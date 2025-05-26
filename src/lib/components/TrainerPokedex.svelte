<script lang="ts">
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import { SPRITE_PICTURE_URL } from '$lib/constants/urls';
    import { PokemonStudyState } from '$lib/types/mongo/trainer';
    import { fromBase64, getPokemonStatus, setPokemonStatus, toBase64 } from '$lib/functions/binaryPokedexStorage';

    import Toggle from './fragments/Toggle.svelte';

    type Props = {
        species: WithId<{ Name: string; DexID: string; Number: number }>[];
        pokedex: string;
        changePokedex: (pokedex: string) => void;
    };
    let { species, pokedex, changePokedex }: Props = $props();

    let showSeen: boolean = $state(false);
    let showCaught: boolean = $state(false);

    let searchTerm: string = $state('');
    let searchableTerm: string = $derived(searchTerm.toLowerCase());

    let speciesMap = $derived(Object.fromEntries(species.map((s, i) => [s.DexID, i])));
    let pokedexBits = $derived(fromBase64(pokedex, species.length));

    $inspect(speciesMap, pokedexBits);
    let filteredSpecies = $derived(
        species.filter((x) => {
            const name = x.Name.toLowerCase();
            const status = getPokemonStatus(pokedexBits, speciesMap[x.DexID]);

            const filteredByName = name.includes(searchableTerm) || x.DexID.toString().includes(searchableTerm);
            const filterBySeen = showSeen
                ? status === PokemonStudyState.Seen || status === PokemonStudyState.Caught
                : true;
            const filterByCaught = showCaught ? status === PokemonStudyState.Caught : true;
            return filteredByName && filterBySeen && filterByCaught;
        }),
    );

    const switchState = (index: number, status: number) => {
        console.log(status);
        if (status === PokemonStudyState.NeverMet) {
            pokedexBits = setPokemonStatus(pokedexBits, index, PokemonStudyState.Seen);
        } else if (status === PokemonStudyState.Seen) {
            pokedexBits = setPokemonStatus(pokedexBits, index, PokemonStudyState.Caught);
        } else {
            pokedexBits = setPokemonStatus(pokedexBits, index, PokemonStudyState.NeverMet);
        }

        changePokedex(toBase64(pokedexBits));
    };
</script>

<trainer-pokedex>
    <div>
        <input type="text" placeholder={t('trainer.pokedex.filter-placeholder')} bind:value={searchTerm} />
        <label for="showSeen">{t('trainer.pokedex.seen')}</label>
        <Toggle bind:toggled={showSeen}></Toggle>
        <label for="showCaught">{t('trainer.pokedex.caught')}</label>
        <Toggle bind:toggled={showCaught}></Toggle>
    </div>
    <ul>
        {#each filteredSpecies as { Number, DexID, Name, _id } (_id)}
            {@const index = speciesMap[DexID]}
            {@const status = getPokemonStatus(pokedexBits, index)}
            <li class:seen={status === 1} class:caught={status === 2}>
                <a href="#null" onclick={() => switchState(index, status)}>
                    <h3>#{DexID}</h3>
                    <img src={SPRITE_PICTURE_URL + Number + '.png'} loading="lazy" alt={Name} />
                    <span>{Name}</span>
                </a>
            </li>
        {/each}
    </ul>
</trainer-pokedex>

<style>
    trainer-pokedex {
        display: grid;
        grid-template-rows: auto 1fr;
        gap: var(--medium-gap);

        & > div {
            display: grid;
            grid-template-columns: 1fr auto auto auto auto;
            gap: var(--medium-gap);
            align-items: center;
        }

        & > ul {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
            grid-auto-rows: min-content;
            gap: var(--medium-gap);
            overflow-y: auto;

            & > li {
                border-radius: var(--medium-gap);
                padding: var(--small-gap) var(--medium-gap);
                background-color: var(--background-fourth-color);
                transition: background-color var(--transition-duration) var(--transition-function);

                &:hover {
                    background-color: var(--background-third-color);
                }

                &:not(.seen, .caught) {
                    & img {
                        filter: grayscale(1);
                    }
                }

                &.seen {
                    background-color: var(--accent-color);

                    & > a {
                        color: var(--background-color);
                    }
                }

                &.caught {
                    background-color: var(--text-color);
                    background-image: url('/icons/starter.svg');
                    background-repeat: no-repeat;
                    background-position: calc(100% - var(--medium-gap)) var(--medium-gap);

                    & > a {
                        color: var(--background-color);
                    }
                }

                & > a {
                    display: grid;
                    grid-template-rows: auto 1fr auto;
                    justify-items: center;
                    text-align: center;
                }
            }
        }
    }
</style>
