<script lang="ts">
    import { getPkmnTypeColor } from "$lib/functions/getPkmnTypeColor";
    import type { DbMove } from "$lib/types/mongo/move";
    import type { WithId } from "mongodb";

    let { value }: { value: WithId<DbMove>} = $props();
</script>

<li style:--bg-color={getPkmnTypeColor(value["Type"].toLocaleLowerCase())}>
    <a href="/moves/{value['_id']}" data-sveltekit-reload>
        <span class="name">
            {value['Name']}
        </span>
        <span class="damage">
            {value['Damage1']} {value['Damage2'] ?? ''} + {value['Power']}
        </span>
        <span class="accuracy">
            {value['Accuracy1']} {value['Accuracy2'] ?? ''}
        </span>
    </a>
</li>

<style>
    li {
        padding: var(--medium-gap);
        border-radius: var(--medium-gap);
        background: hsl(from var(--bg-color) h s calc(l - 20));
        
        & > a {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
            gap: var(--large-gap);
            align-items: center;
        }
    }
</style>
