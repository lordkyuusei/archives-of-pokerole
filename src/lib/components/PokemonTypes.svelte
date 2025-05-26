<script lang="ts">
    import t from '$lib/i18n/i18n.svelte';
    import Popover from '$lib/components/fragments/Popover.svelte';
    import { getPkmnTypeColor } from '$lib/functions/getPkmnTypeColor';
    import TypesRelationships from '$lib/components/TypesRelationships.svelte';
    import { computeAffinities, fetchFullTypes } from '$lib/functions/getTypesRelationship';

    type Props = { types: string[]; helperPosition?: any };

    let { types, helperPosition = 'bottom' }: Props = $props();
    let typesRef: HTMLUListElement | null = $state(null);
    let isRelationshipDialogOpen: boolean = $state(false);

    let pkmnTypes = $derived(
        types.length === 1 ? [types[0].toLowerCase()] : [types[0].toLowerCase(), types[1].toLowerCase()],
    );
    let typesRelationship = $derived(computeAffinities(fetchFullTypes(pkmnTypes)));
</script>

<ul
    class="types"
    bind:this={typesRef}
    onmouseover={() => (isRelationshipDialogOpen = true)}
    onmouseleave={() => (isRelationshipDialogOpen = false)}
    onfocus={() => (isRelationshipDialogOpen = !isRelationshipDialogOpen)}
>
    <li style:background={getPkmnTypeColor(pkmnTypes[0])}>{t(`pokemon.type.${pkmnTypes[0]}`)}</li>
    {#if pkmnTypes[1]}
        <li style:background={getPkmnTypeColor(pkmnTypes[1])}>{t(`pokemon.type.${pkmnTypes[1]}`)}</li>
    {/if}
</ul>
<Popover element={typesRef} isOpen={isRelationshipDialogOpen} position={helperPosition}>
    <TypesRelationships relationships={typesRelationship} />
</Popover>

<style>
    ul.types {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        border-radius: var(--medium-gap);
        overflow: hidden;

        & > li {
            text-transform: capitalize;
            text-wrap: nowrap;
            text-align: center;
            padding: var(--medium-gap);
        }
    }
</style>
