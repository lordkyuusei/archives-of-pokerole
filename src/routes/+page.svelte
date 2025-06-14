<script lang="ts">
    import { onMount } from 'svelte';
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { Box } from '$lib/types/box';
    import type { DbMove } from '$lib/types/mongo/move';
    import type { Ailment } from '$lib/constants/ailments';
    import type { DbPartnerPokemon, DbPokemon } from '$lib/types/mongo/pokemon';
    import { applyMigrationsToBoxes, applyMigrationsToPokemon } from '$lib/functions/migrations';
    import { DEFAULT_PICTURE_URL, SHINY_PICTURE_URL, SPRITE_PICTURE_URL } from '$lib/constants/urls';

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

    let isSaving: boolean = $state(false);
    let debounceTimeout: NodeJS.Timeout | null = null;

    let boxes: { id: number; name: string }[] = $state([]);
    let pokemons: WithId<DbPartnerPokemon>[] = $state([]);
    let species: WithId<DbPokemon>[] = $state([]);
    let moves: WithId<DbMove>[] = $state([]);

    let box: { id: number; name: string } | null = $state(null);
    let pokemon: WithId<DbPartnerPokemon> | null = $state(null);
    let specie: WithId<DbPokemon> | null = $state(null);
    let pkmnMoves: WithId<DbMove>[] = $state([]);

    let pokemonInBox: WithId<DbPartnerPokemon>[] = $derived(pokemons.filter((p) => p.box === (box?.id ?? 0)));

    let showRankUpDialog: boolean = $state(false);
    let showEvolveDialog: boolean = $state(false);
    let showImportDialog: boolean = $state(false);
    let showRetrainDialog: boolean = $state(false);
    let showReleaseDialog: boolean = $state(false);
    let showLearnMoveDialog: boolean = $state(false);
    let showManageBoxesDialog: boolean = $state(false);

    const setPokemon = (pkmn: WithId<DbPartnerPokemon> | null) => {
        pokemon = pkmn;

        if (pkmn === null) {
            specie = null;
            pkmnMoves = [];
        } else {
            box = boxes.find((b) => b.id === pkmn.box) ?? boxes[0];
            specie = species.find((specie) => specie._id.toString() === pokemon?.specie[0]) ?? null;
            pkmnMoves = moves.filter((move) => pkmn.moves.includes(move['_id'].toString()));
        }
    };

    const savePokemons = () => {
        isSaving = true;
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            localStorage.setItem('team', JSON.stringify(pokemons));
            isSaving = false;
        }, 1000);
    };

    const savePokemon = () => {
        if (pokemon === null) return;

        const index = pokemons.findIndex((p) => p.id === pokemon!.id);
        pokemons[index] = pokemon;

        savePokemons();
    };

    const releasePokemon = () => {
        if (pokemon === null) return;

        const index = pokemons.findIndex((p) => p.id === pokemon!.id);
        if (index === -1) return;

        pokemons = pokemons.toSpliced(index, 1);
        localStorage.setItem('team', JSON.stringify(pokemons));
        setPokemon(pokemons[0]);
    };

    const changeHp = (value: number) => {
        if (!pokemon || !specie) return;

        pokemon.hp = Math.max(0, Math.min(pokemon.hp + value, specie['BaseHP'] + pokemon.attributes['Vitality']));
        savePokemon();
    };

    const changeWp = (value: number) => {
        if (!pokemon || !specie) return;

        pokemon.will = Math.max(0, Math.min(pokemon.will + value, pokemon.attributes['Insight'] + 2));
        savePokemon();
    };

    const changeItem = (item: string) => {
        if (!pokemon) return;

        pokemon.heldItem = item;
        savePokemon();
    };

    const changeStatus = (status: Ailment) => {
        if (!pokemon) return;

        pokemon.status = status;
        savePokemon();
    };

    const changeBattle = (battle: number) => {
        if (!pokemon) return;

        pokemon.battles += battle;
        savePokemon();
    };

    const changeWins = (wins: number) => {
        if (!pokemon) return;

        pokemon.victories += wins;
        savePokemon();
    };

    const changeNotes = (notes: string) => {
        if (!pokemon) return;

        pokemon.notes = notes;
        savePokemon();
    };

    const changeLoyalty = (loyalty: number) => {
        if (!pokemon) return;

        pokemon.loyalty = loyalty;
        savePokemon();
    };

    const changeHappiness = (happiness: number) => {
        if (!pokemon) return;

        pokemon.happiness = happiness;
        savePokemon();
    };

    const updatePokemon = (pkmn: WithId<DbPartnerPokemon>) => {
        if (!pkmn) return;

        setPokemon(pkmn);
        savePokemon();
    };

    const updatePokemonList = (pkmns: WithId<DbPartnerPokemon>[]) => {
        if (!pkmns && !pokemon) return;

        pokemons = pkmns;

        const hasIdChange = pkmns.find((p) => p.id === pokemon.id)?.box !== pokemon?.box;
        if (hasIdChange) {
            setPokemon(pokemons[0]);
        }

        savePokemons();
    };

    const importPokemon = (pkmn: WithId<DbPartnerPokemon>) => {
        if (!pkmn) return;

        pokemons = [...pokemons, pkmn];
        localStorage.setItem('team', JSON.stringify(pokemons));
        setPokemon(pkmn);
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

        box = boxes[index];
        setPokemon(pokemonInBox[0] || null);
    };

    const updateBoxes = (newBoxes: Box[]) => {
        if (!newBoxes) return;

        const ids = newBoxes.map((b) => b.id);

        boxes = newBoxes;
        pokemons = pokemons.map((pkmn) => ({
            ...pkmn,
            box: ids.includes(pkmn.box) ? pkmn.box : 0,
        }));

        isSaving = true;
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            localStorage.setItem('boxes', JSON.stringify(newBoxes));
            isSaving = false;

            savePokemons();
        }, 1000);
    };

    const onPokemonDragStartHandle = (
        event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement },
        pkmn: WithId<DbPartnerPokemon>,
    ) => {
        if (!event.dataTransfer) return;

        event.dataTransfer.setData('text/plain', pkmn.id);
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.style.opacity = '0.5';
    };

    const onPokemonDragEndHandle = (
        event: DragEvent & { currentTarget: EventTarget & HTMLButtonElement },
        pkmn: WithId<DbPartnerPokemon>,
    ) => {
        if (!event.dataTransfer) return;

        event.currentTarget.style.opacity = '1';
    };

    onMount(async () => {
        const boxesAsString = localStorage.getItem('boxes');
        const pokemonsAsString = localStorage.getItem('team');

        pokemons = applyMigrationsToPokemon(JSON.parse(pokemonsAsString ?? '[]'));
        boxes = applyMigrationsToBoxes(JSON.parse(boxesAsString ?? '[]'), t('home.pokemon.title-team'));

        const party = pokemons.map((pkmn) => pkmn.specie).join(',');
        const knownMoves = pokemons.flatMap((pkmn) => pkmn.moves).join(',');

        const data = await fetch('/api/pokemons?species=' + party + '&moves=' + knownMoves);
        const json = await data.json();

        moves = json.moves;
        species = json.species;

        if (pokemons.length > 0) {
            setPokemon(pokemons[0]);
        }
    });
</script>

<section class="homepage">
    <pkmn-list class="wrapper" data-title={box?.name}>
        {#if box !== null}
            {#if pokemonInBox.length === 0}
                <p>{t('home.pokemon.error-no-team')}</p>
            {/if}
            {#each pokemonInBox as pkmn}
                <button
                    draggable="true"
                    class="partner secondary"
                    class:selected={pkmn === pokemon}
                    onclick={() => setPokemon(pkmn)}
                    ondragstart={(event) => onPokemonDragStartHandle(event, pkmn)}
                    ondragend={(event) => onPokemonDragEndHandle(event, pkmn)}
                    style:--url="url('{SPRITE_PICTURE_URL}{pkmn.specie[1]}.png')"
                >
                    {pkmn.nickname}
                </button>
            {/each}
            <BoxesList {boxes} {pokemons} {updatePokemonList} {setCurrentBox}></BoxesList>
        {/if}
    </pkmn-list>
    <pkmn-list-actions class="wrapper" data-title={t('home.pokemon.title-actions')}>
        <button onclick={() => (showManageBoxesDialog = true)}>{t('home.pokemon.action-boxes')}</button>
        <button onclick={() => (showImportDialog = true)}>{t('home.pokemon.action-import')}</button>
    </pkmn-list-actions>
    <pkmn-selected class="wrapper">
        {#if pokemon && specie}
            <PkmnAttributesSkills {pokemon} {specie}></PkmnAttributesSkills>
            <PkmnIdentitySocials
                {pokemon}
                {specie}
                moves={pkmnMoves}
                {changeHp}
                {changeWp}
                {changeItem}
                {changeStatus}
                {changeBattle}
                {changeWins}
                {changeNotes}
                {changeLoyalty}
                {changeHappiness}
            ></PkmnIdentitySocials>
        {/if}
    </pkmn-selected>
    <pkmn-actions>
        {#if pokemon && specie}
            <pkmn-infos
                class="wrapper"
                data-title={pokemon.specie[0]}
                style:--url="url('{pokemon.shiny ? SHINY_PICTURE_URL : DEFAULT_PICTURE_URL}/{pokemon.specie[1]}.png')"
            >
                <a href="/pokemon/{specie._id}"><button>{t('home.pokemon.action-check-pokedex')}</button></a>
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
        <RankUpPokemonForm bind:isOpen={showRankUpDialog} {pokemon} {specie} {moves} {updatePokemon}
        ></RankUpPokemonForm>
    {/if}

    {#if showRetrainDialog}
        <RetrainPokemonForm bind:isOpen={showRetrainDialog} {pokemon} {specie} {moves} {updatePokemon}
        ></RetrainPokemonForm>
    {/if}

    {#if showEvolveDialog}
        <EvolvePokemonForm bind:isOpen={showEvolveDialog} {pokemon} {specie} {moves} {updatePokemon}
        ></EvolvePokemonForm>
    {/if}

    {#if showLearnMoveDialog}
        <LearnPokemonMoveForm bind:isOpen={showLearnMoveDialog} {pokemon} {updatePokemon}></LearnPokemonMoveForm>
    {/if}

    {#if showReleaseDialog}
        <ReleasePokemonForm
            bind:isOpen={showReleaseDialog}
            nickname={pokemon.nickname}
            specie={pokemon.specie[0]}
            {releasePokemon}
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
            grid-area: 'pkmn-list';

            display: flex;
            gap: var(--large-gap);
            align-items: center;

            & > button.partner {
                align-content: center;
                align-items: center;
                text-transform: capitalize;
                background-image: var(--url);
                background-position: bottom right;
                background-blend-mode: luminosity;
                background-repeat: no-repeat;

                &.selected {
                    background-color: var(--text-color);
                    color: var(--background-second-color);
                    border-color: var(--background-color);
                }

                &.dragging {
                    display: none;
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
        }

        & > pkmn-actions > pkmn-infos {
            background-image: var(--url);
            background-position: center center;
            background-size: cover;
            background-blend-mode: hard-light;
        }

        & > pkmn-actions > pkmn-updates {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
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
