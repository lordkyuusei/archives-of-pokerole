<script lang="ts">
    import type { WithId } from "mongodb";
    import type { DbNature } from "$lib/types/mongo/nature";

    type Props = {
        showSearch?: boolean;
        keys: (keyof DbNature)[];
        value: WithId<DbNature>;
    };
    let { showSearch = $bindable(), keys, value }: Props = $props();

    const closeSearch = () => (showSearch = false);
</script>

<li>
    <a href="/natures/{value['_id']}" data-sveltekit-reload onclick={closeSearch}>
        <span class="name">
            {value['Name']}
        </span>
        <span class="confidence">
            {value['Confidence']}
        </span>
    </a>
</li>

<style>
    li {
        padding: var(--medium-gap);
        border-radius: var(--medium-gap);

        & > a {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
            gap: var(--large-gap);
        }
    }
</style>
