<script lang="ts">
    type Props = { isOpen: boolean; title: string; children: any };
    let { isOpen = $bindable(), title, children }: Props = $props();

    let shrinked: boolean = $state(false);

    const listenForEscape = (key: string) => {
        if (key === 'Escape') {
            isOpen = false;
        }
    };
</script>

<dialog class="wrapper" class:shrinked open={isOpen} data-title={title} onkeydown={({ key }) => listenForEscape(key)}>
    <div class="content">
        {@render children()}
    </div>
    <button class="shrink secondary round" onclick={() => (shrinked = !shrinked)}>{shrinked ? '↔️' : '↕️'}</button>
    <button class="close secondary round" onclick={() => (isOpen = false)}>❌</button>
</dialog>

<style>
    dialog.wrapper {
        z-index: 3;
        position: absolute;

        display: grid;
        grid-template: auto 1fr auto / 1fr;

        width: 75svw;
        height: 75svh;
        margin-inline: auto;

        color: var(--text-color);
        box-shadow: 0px 0px 200px 12svw var(--background-color);

        & > .content {
            display: contents;
        }

        & > .close {
            position: absolute;
            top: -1rem;
            right: -1rem;
        }

        &.shrinked {
            height: 5svh;
            min-height: 5svh;

            & > div.content {
                display: none;
            }
        }

        & > .shrink {
            position: absolute;
            top: -1rem;
            right: 1.5rem;
        }
    }
</style>
