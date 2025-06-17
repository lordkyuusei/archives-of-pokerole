<script lang="ts">

    type Props = { isSaving: boolean };
    let { isSaving }: Props = $props();
</script>

<span class:saving={isSaving} title={isSaving ? 'Saving' : 'Saved!'}>
</span>

<style>
    span {
        display: inline-block;
        width: var(--large-gap);
        height: var(--large-gap);

        &.saving {
            border: 2px solid transparent;
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        &:not(.saving) {
            background-color: var(--color-success);
            border-radius: 50%;

            &::after {
                content: '✓';
                color: white;
                font-size: 1.2em;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }
        }
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }


</style>