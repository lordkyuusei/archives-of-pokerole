<script lang="ts">
    import { onMount } from 'svelte';
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { Box } from '$lib/types/box';
    import { setStorage } from '$lib/state/storage.svelte';
    import type { DbPartnerPokemon } from '$lib/types/mongo/pokemon';
    import { DEFAULT_PICTURE_URL, SHINY_PICTURE_URL, SPRITE_PICTURE_URL } from '$lib/constants/urls';

    import {
        addPokemonToParty,
        getMoves,
        getPokemon,
        getPokemons,
        getSpecie,
        getSpecies,
        removePokemonFromParty,
        setPkmnMoves,
        setPokemon,
        setPokemonParty,
        setPokemonProperty,
        setSelectedPokemon,
        setSpecie,
        updatePokemonInParty,
    } from '$lib/state/pokemon.svelte';

    import BoxesList from '$lib/components/lodestones/BoxesList.svelte';
    import BoxesManagerForm from '$lib/components/forms/BoxesManagerForm.svelte';
    import PkmnIdentitySocials from '$lib/components/PkmnIdentity&Socials.svelte';
    import EvolvePokemonForm from '$lib/components/forms/EvolvePokemonForm.svelte';
    import ImportPokemonForm from '$lib/components/forms/ImportPokemonForm.svelte';
    import RankUpPokemonForm from '$lib/components/forms/RankUpPokemonForm.svelte';
    import PkmnAttributesSkills from '$lib/components/PkmnAttributes&Skills.svelte';
    import RetrainPokemonForm from '$lib/components/forms/RetrainPokemonForm.svelte';
    import ReleasePokemonForm from '$lib/components/forms/ReleasePokemonForm.svelte';
    import LearnPokemonMoveForm from '$lib/components/forms/LearnPokemonMoveForm.svelte';
    import { getBox, getBoxes, setBox, setBoxes } from '$lib/state/boxes.svelte';

    let boxes = $derived(getBoxes());
    let box = $derived(getBox());

    let pokemon = $derived(getPokemon());
    let pokemons = $derived(getPokemons());
    let pokemonInBox = $derived(pokemons.filter((p) => p.box === (box?.id ?? 0)));

    let species = $derived(getSpecies());
    let specie = $derived(getSpecie());

    let moves = $derived(getMoves());

    let showRankUpDialog: boolean = $state(false);
    let showEvolveDialog: boolean = $state(false);
    let showImportDialog: boolean = $state(false);
    let showRetrainDialog: boolean = $state(false);
    let showReleaseDialog: boolean = $state(false);
    let showLearnMoveDialog: boolean = $state(false);
    let showManageBoxesDialog: boolean = $state(false);

    $effect(() => updateSelectedPokemon(pokemon));

    const updateSelectedPokemon = (pkmn: DbPartnerPokemon | null) => {
        if (pkmn === null) {
            setSpecie(null);
            setPkmnMoves([]);
        } else {
            const box = boxes.find((b) => b.id === pkmn.box);
            const specie = species.find((specie) => specie._id.toString() === pokemon?.specie[0]) ?? null;
            const pkmnMoves = moves.filter((move) => pkmn.moves.includes(move['_id'].toString()));

            setBox(box);
            setSpecie(specie);
            setPkmnMoves(pkmnMoves);
        }
    };

    const releasePokemon = () => {
        if (pokemon === null) return;

        const box = pokemon.box;
        removePokemonFromParty(pokemon);

        const nextDisplayPokemon = pokemons.find((p) => p.box === box && p.id !== pokemon.id) || null;
        if (!nextDisplayPokemon) {
            setPokemon(pokemons[0]);
        } else {
            setPokemon(nextDisplayPokemon);
        }

        setStorage('team', pokemons);
    };

    const updatePokemon = (pkmn: DbPartnerPokemon) => {
        if (!pkmn) return;

        setPokemon(pkmn);
    };

    const updatePokemonList = (pkmns: DbPartnerPokemon[]) => {
        if (!pkmns && !pokemon) return;

        setPokemonParty(pkmns);

        const hasIdChange = pkmns.find((p) => p.id === pokemon.id)?.box !== pokemon?.box;
        if (hasIdChange) {
            updateSelectedPokemon(pokemons[0]);
        }

        setStorage('team', pokemons);
    };

    const importPokemon = (pkmn: DbPartnerPokemon) => {
        if (!pkmn) return;

        updateSelectedPokemon(pkmn);
        addPokemonToParty(pkmn);
    };

    const exportPokemon = () => {
        if (!pokemon) return;

        const { id, box, ...pokemonData } = pokemon;
        const data = JSON.stringify(pokemonData);
        navigator.clipboard.writeText(data).then(() => {
            alert(pokemonData.nickname + ' copié dans le presse-papiers.');
        });
    };

    const setCurrentBox = (boxId: number) => {
        const index = boxes.findIndex((b) => b.id === boxId);
        if (index === -1) return;

        setBox(boxes[index]);
        setPokemon(pokemonInBox[0] || null);
        updateSelectedPokemon(pokemonInBox[0] || null);
    };

    const updateBoxes = (newBoxes: Box[]) => {
        if (!newBoxes) return;

        const ids = newBoxes.map((b) => b.id);
        const updatedPokemon = pokemons.map((pkmn) => ({
            ...pkmn,
            box: ids.includes(pkmn.box) ? pkmn.box : 0,
        }));

        setBoxes(newBoxes);
        setPokemonParty(updatedPokemon);

        setStorage('boxes', newBoxes);
    };

    const onPokemonDragStartHandle = (event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement }, pkmn: DbPartnerPokemon) => {
        if (!event.dataTransfer) return;

        event.dataTransfer.setData('text/plain', pkmn.id);
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.style.opacity = '0.5';
    };

    const onPokemonDragEndHandle = (event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
        if (!event.dataTransfer) return;

        event.currentTarget.style.opacity = '1';
    };

    onMount(() => {
        updateSelectedPokemon(pokemonInBox[0] || null);
    });
</script>

<section class="homepage">
    <!-- List of Pokemon in current box-->
    <pkmn-list class="wrapper" data-title={box?.name}>
        {#if box !== null}
            {#if pokemonInBox.length === 0}
                <p>{t('home.pokemon.error-no-team')}</p>
            {:else}
                <ul>
                    {#each pokemonInBox as pkmn}
                        <li>
                            <button
                                draggable="true"
                                class="partner secondary"
                                class:selected={pkmn === pokemon}
                                onclick={() => setSelectedPokemon(pkmn)}
                                ondragstart={(event) => onPokemonDragStartHandle(event, pkmn)}
                                ondragend={(event) => onPokemonDragEndHandle(event)}
                                style:--url="url('{SPRITE_PICTURE_URL}{pkmn.specie[1]}.png')">
                                {pkmn.nickname}
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
            <BoxesList {updatePokemonList} {setCurrentBox}></BoxesList>
        {/if}
    </pkmn-list>

    <!-- List of meta-actions -->
    <pkmn-list-actions class="wrapper" data-title={t('home.pokemon.title-actions')}>
        <button onclick={() => (showManageBoxesDialog = true)}>{t('home.pokemon.action-boxes')}</button>
        <button onclick={() => (showImportDialog = true)}>{t('home.pokemon.action-import')}</button>
    </pkmn-list-actions>

    <!-- Selected Pokemon's stats, identity & socials -->
    <pkmn-selected class="wrapper">
        {#if pokemon && specie}
            <PkmnAttributesSkills></PkmnAttributesSkills>
            <PkmnIdentitySocials></PkmnIdentitySocials>
        {/if}
    </pkmn-selected>

    <!-- Actions for the selected Pokemon -->
    <pkmn-actions>
        {#if pokemon && specie}
            <pkmn-infos
                class="wrapper"
                data-title="{pokemon.specie[0]} {pokemon.shiny ? ' ✨' : ''}"
                style:--url="url('{pokemon.shiny ? SHINY_PICTURE_URL : DEFAULT_PICTURE_URL}/{pokemon.specie[1]}.png')">
                <a href="/pokemon/{specie._id}"><button>{t('home.pokemon.action-check-pokedex')}</button></a>
                <input type="text" value={pokemon.nickname} oninput={({ currentTarget }) => setPokemonProperty('nickname', currentTarget.value)} />
            </pkmn-infos>
            <pkmn-updates class="wrapper" data-title="Actions">
                <button onclick={() => (showRankUpDialog = true)}>{t('home.pokemon.action-rank-up')}</button>
                <button onclick={() => (showRetrainDialog = true)}>{t('home.pokemon.action-retrain')}</button>
                <button onclick={() => (showEvolveDialog = true)}>{t('home.pokemon.action-evolve')}</button>
                <button onclick={() => (showReleaseDialog = true)}>{t('home.pokemon.action-release')}</button>
                <button onclick={() => (showLearnMoveDialog = true)}>{t('home.pokemon.action-learn')}</button>
                <button onclick={() => exportPokemon()}>{t('home.pokemon.action-export')}</button>
            </pkmn-updates>
        {/if}
    </pkmn-actions>
</section>

{#if showImportDialog}
    <ImportPokemonForm bind:isOpen={showImportDialog} {importPokemon}></ImportPokemonForm>
{/if}

{#if showManageBoxesDialog}
    <BoxesManagerForm bind:isOpen={showManageBoxesDialog} {boxes} {pokemons} {updateBoxes}></BoxesManagerForm>
{/if}

{#if specie && pokemon}
    {#if showRankUpDialog}
        <RankUpPokemonForm bind:isOpen={showRankUpDialog} {pokemon} {specie} {moves} {updatePokemon}></RankUpPokemonForm>
    {/if}

    {#if showRetrainDialog}
        <RetrainPokemonForm bind:isOpen={showRetrainDialog} {pokemon} {specie} {moves} {updatePokemon}></RetrainPokemonForm>
    {/if}

    {#if showEvolveDialog}
        <EvolvePokemonForm bind:isOpen={showEvolveDialog} {pokemon} {specie} {moves} {updatePokemon}></EvolvePokemonForm>
    {/if}

    {#if showLearnMoveDialog}
        <LearnPokemonMoveForm bind:isOpen={showLearnMoveDialog} {pokemon} {updatePokemon}></LearnPokemonMoveForm>
    {/if}

    {#if showReleaseDialog}
        <ReleasePokemonForm bind:isOpen={showReleaseDialog} nickname={pokemon.nickname} specie={pokemon.specie[0]} {releasePokemon}
        ></ReleasePokemonForm>
    {/if}
{/if}

<style>
    section.homepage {
        grid-column: 1 / -1;

        display: grid;
        grid-template:
            'pkmn-list     pkmn-list-actions     pkmn-list-actions' auto
            'pkmn-selected pkmn-selected pkmn-selected-actions' 1fr / 1fr auto auto;
        gap: var(--large-gap);

        & > pkmn-list {
            grid-area: pkmn-list;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: var(--large-gap);
            align-items: center;

            & > ul {
                display: flex;
                gap: var(--large-gap);
                align-items: center;
                overflow-x: auto;

                & > li {
                    & > button.partner {
                        align-content: center;
                        align-items: center;
                        text-transform: capitalize;
                        text-wrap: nowrap;
                        background-image: var(--url);
                        background-position: bottom right;
                        background-blend-mode: luminosity;
                        background-repeat: no-repeat;

                        &.selected {
                            background-color: var(--text-color);
                            color: var(--background-second-color);
                            border-color: var(--background-color);
                        }
                    }
                }
            }
        }

        & > pkmn-list-actions {
            grid-area: pkmn-list-actions;

            display: flex;
            gap: var(--large-gap);
            align-items: center;
        }

        & > pkmn-selected {
            grid-area: pkmn-selected;

            display: grid;
            grid-template: 1fr / 1fr 2fr;
        }

        & > pkmn-actions {
            grid-area: pkmn-selected-actions;
        }

        & > pkmn-actions {
            display: flex;
            flex-direction: column;
            gap: var(--large-gap);

            & > pkmn-infos,
            & > pkmn-updates {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            & > pkmn-infos {
                gap: var(--medium-gap);
                background-image: var(--url);
                background-position: center center;
                background-size: cover;
                background-blend-mode: hard-light;

                & > input {
                    height: auto;
                    backdrop-filter: blur(var(--large-gap));
                    background: hsl(from var(--background-color) h s l / 0.5);
                    border: var(--smaller-gap) solid currentColor;
                    border-radius: var(--large-gap);
                }
                & > a button {
                    width: 100%;
                }
            }
        }
    }

    @media (max-width: 1280px) {
        section.homepage {
            grid-template:
                'pkmn-list pkmn-list-actions' auto
                'pkmn-selected-actions pkmn-selected-actions' auto
                'pkmn-selected pkmn-selected' 1fr / 1fr auto;

            & > pkmn-actions {
                display: grid;
                grid-template-columns: auto 1fr;

                & > pkmn-infos {
                    background-size: contain;
                    background-repeat: no-repeat;
                }

                & > pkmn-updates {
                    flex-direction: row;
                    gap: var(--medium-gap);
                }
            }
        }
    }
</style>
