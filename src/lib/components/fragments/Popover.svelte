<script lang="ts">
    type Position = 'top' | 'left' | 'bottom' | 'right';

    type Props = {
        children: any,
        element: HTMLUListElement,
        isOpen: boolean,
        position: Position
    }

    let { children, element, isOpen, position = 'right' }: Props = $props();
    let padding = 12;
    let dialogRef: HTMLDialogElement;
    let coords = $state({ x: 0, y: 0, width: 0 });

    const mapPositionToCoordinates = (position: Position, rect: DOMRect) => [
        { c: position === 'top', coords: { x: rect.x, y: rect.y - dialogRef.clientHeight - padding }},
        { c: position === 'left', coords: { x: rect.x - dialogRef.clientWidth - padding, y: rect.y + (rect.height / 2) - (dialogRef.clientHeight / 2) }},
        { c: position === 'bottom', coords: { x: rect.x, y: rect.y + rect.height + padding }},
        { c: position === 'right', coords: { x: rect.x + rect.width + padding, y: rect.y + (rect.height / 2) - (dialogRef.clientHeight / 2) }}
    ].find(x => x.c === true)?.coords

    $effect(() => {
        if (isOpen) {
            const rect = element.getBoundingClientRect();
            const { x, y } = mapPositionToCoordinates(position, rect)!;
            coords = { x, y, width: rect.width };
        }
    })
</script>

<dialog bind:this={dialogRef} open={isOpen} class="wrapper {position}" style:--x="{coords.x}px" style:--y="{coords.y}px" style:--width="{coords.width}px">
    {@render children()}
</dialog>

<style>
    dialog {
        z-index: 10;
        position: fixed;
        top: var(--y);
        left: var(--x);
        width: var(--width);

        height: auto;
        min-width: 25svw;
        padding: var(--large-gap);
        border-radius: var(--medium-gap);

        color: var(--text-color);
        box-shadow: 0px 0px var(--large-gap) var(--small-gap) var(--background-color);

        &::before {
            content: '';
            position: absolute;
            border-width: 5px;
            border-style: solid;
        }
        
        &.right::before, &.left::before {
            top: 50%;
            margin-top: -5px;            
        }
        
        &.right::before {
            right: calc(100% + 3px);
            border-color: transparent transparent transparent transparent;
        }

        &.left::before {
            left: calc(100% + 3px);
            border-color: transparent transparent transparent transparent;
        }

        &.top::before, &.bottom::before {
            left: 50%;
            margin-left: -5px;
        }

        &.top::before {
            bottom: -13px;
            border-color: transparent transparent transparent transparent;
        }

        &.bottom::before {
            top: -13px;
            border-color: transparent transparent transparent transparent;
        }
    }

</style>