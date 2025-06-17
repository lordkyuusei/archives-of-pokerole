<script lang="ts">
    import t from '$lib/i18n/i18n.svelte';
    import type { Ailment } from '$lib/constants/ailments';
    import { getLang, type Lang } from '$lib/i18n/lang.svelte';
    import PartnerAttribute from './PartnerAttribute.svelte';
    import { getPokemon, getSpecie } from '$lib/state/pokemon.svelte';

    let pokemon = $derived(getPokemon());
    let specie = $derived(getSpecie());

    let lang: Lang = $derived(getLang());

    const mapAilmentToEffect: { [x: string]: number } = {
        Paralysis_Dexterity: -2,
    };

    const mapAilmentToAcronym: { [x in Ailment]: string } = {
        Paralysis: 'PAR',
    };
</script>

{#snippet metric(name: string, value: string)}
    <li>
        <label for={name}>{name}</label>
        <output id={name}>{value}</output>
    </li>
{/snippet}

<div class="wrapper stats" data-title={t('home.character.attributes-skills')}>
    {#if pokemon && specie}
        {@const heightUnit = lang === 'en' ? specie['Height']['Feet'] + '"' : specie['Height']['Meters'] + ' m'}
        {@const weightUnit = lang === 'en' ? specie['Weight']['Pounds'] + ' pounds' : specie['Weight']['Kilograms'] + ' kgs'}

        <ul class="attributes">
            {#each Object.entries(pokemon.attributes) as [key, value] (key)}
                {@const ailmentEffect = mapAilmentToEffect[`${pokemon.status}_${key}`]}
                {@const ailmentAcronym = mapAilmentToAcronym[pokemon.status]}
                <li class:ailment={ailmentEffect} data-ailment="{ailmentAcronym}: -2">
                    <PartnerAttribute
                        {value}
                        name={t(`character.attribute.${key}`)}
                        minValue={specie[key]}
                        maxValue={specie['Max' + key]}
                    ></PartnerAttribute>
                </li>
            {/each}
        </ul>

        <ul class="measurments">
            {@render metric(t('pokedex.pokemon.data-height'), heightUnit)}
            {@render metric(t('pokedex.pokemon.data-weight'), weightUnit)}
        </ul>

        <ul class="skills">
            {#each Object.entries(pokemon.skills) as [key, value]}
                <li>
                    <PartnerAttribute name={t(`character.attribute.${key}`)} {value} minValue={0} maxValue={5}
                    ></PartnerAttribute>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    div.stats {
        display: grid;
        grid-template: repeat(6, 1fr) / 1fr auto;
        gap: var(--medium-gap);

        & > ul {
            height: 100%;

            &.attributes {
                display: contents;

                & > li.ailment {
                    position: relative;

                    &::before {
                        content: attr(data-ailment);
                        position: absolute;
                        top: var(--medium-gap);
                        right: var(--medium-gap);

                        font-size: small;
                        border-radius: var(--large-gap);
                        padding-inline: var(--medium-gap);
                        color: var(--background-color);
                        background-color: var(--tough);
                    }
                }
            }

            &.measurments {
                grid-column: 1;

                display: flex;
                justify-content: space-around;
                align-items: center;
                border-radius: var(--small-gap);
                padding: var(--small-gap);
                background-color: var(--background-fourth-color);

                & > li {
                    display: flex;
                    flex-direction: column;

                    & > label {
                        font-size: medium;
                        font-weight: bold;
                        text-transform: uppercase;
                        padding-inline: var(--small-gap);
                    }

                    & > output {
                        color: var(--accent-color);
                        font-weight: bold;
                        text-align: center;
                    }
                }
            }

            &.skills {
                display: grid;
                gap: var(--medium-gap);
                overflow: auto;
                grid-area: 1 / 2 / -1 / -1;
            }

            & > li {
                grid-column: 1;
            }
        }
    }
</style>
