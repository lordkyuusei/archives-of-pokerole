<script lang="ts">
    import { drawBookBackground } from "$lib/functions/getPkmnTypeColor";
    import type { DbPokemon } from "$lib/types/mongo/pokemon";
    import type { WithId } from "mongodb";

    let { value }: { value: WithId<DbPokemon>} = $props();

    let types: string[] = value["Type2"] === "" ? 
        [value["Type1"].toLowerCase()] : 
        [value["Type1"].toLowerCase(), value["Type2"].toLowerCase()];


</script>

<li style:--bg-color={drawBookBackground(types)}>
    <a href="/pokemon/{value['_id']}" data-sveltekit-reload>
        <span class="name">
            #{value['Number']} {value['Name']}
        </span>
        <span class="category">
            {value['DexCategory']}
        </span>
    </a>
</li>

<style>
    li {
        padding: var(--medium-gap);
        border-radius: var(--medium-gap);
        background: var(--bg-color);
        
        & > a {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
            gap: var(--large-gap);
            align-items: center;
        }
    }
</style>
