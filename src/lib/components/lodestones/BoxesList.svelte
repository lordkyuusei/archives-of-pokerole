<script lang="ts">
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { Box } from '$lib/types/box';
    import { SPRITE_PICTURE_URL } from '$lib/constants/urls';
    import type { DbPartnerPokemon } from '$lib/types/mongo/pokemon';

    const MAX_POKEMON_PREVIEW = 6;

    type Props = {
        boxes: { id: number; name: string }[];
        pokemons: WithId<DbPartnerPokemon>[];
        setCurrentBox: (boxId: number) => void;
        updatePokemonList: (pokemonList: WithId<DbPartnerPokemon>[]) => void;
    };

    let { boxes, pokemons, updatePokemonList, setCurrentBox }: Props = $props();

    let show: boolean = $state(false);
    let currentPokemonList: WithId<DbPartnerPokemon>[] = $derived(pokemons);

    const changeBox = (boxId: number) => {
        setCurrentBox(boxId);
        show = !show;
    }

    const onDragStartElementHandle = (event: DragEvent & { currentTarget: HTMLImageElement }, pkmn: WithId<DbPartnerPokemon>, box: Box) => {
        if (!event.dataTransfer) return;

        event.dataTransfer.setData('text/plain', pkmn.id);
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.style.opacity = '0.5';
    };

    const onDragEndElementHandle = (event: DragEvent & { currentTarget: EventTarget & HTMLImageElement}) => {
        if (!event.dataTransfer) return;

        event.currentTarget.style.opacity = "1";
    };
    
    const onDragOverElementHandle = (event: DragEvent & { currentTarget: HTMLLIElement }) => {
        event.preventDefault();
        event.currentTarget.style.borderColor = 'var(--second-color)';
    };
    
    const onDragLeaveElementHandle = (event: DragEvent & { currentTarget: HTMLLIElement }) => {
        event.preventDefault();
        event.currentTarget.style.borderColor = 'var(--accent-color)';
    };

    const onDropElementHandle = (event: DragEvent & { currentTarget: HTMLLIElement }, box: Box) => {
        if (!event.dataTransfer) return;

        if (box.id === 0 && currentPokemonList.filter(p => p.box === 0).length === MAX_POKEMON_PREVIEW) return;

        const id = event.dataTransfer.getData('text/plain');
        const matchingPokemonIndex = currentPokemonList.findIndex((p) => p.id === id);

        if (matchingPokemonIndex < 0) return;
        currentPokemonList[matchingPokemonIndex].box = box.id;
        updatePokemonList(currentPokemonList);
    };
</script>

<boxes-list role="tree">
    <button title={t('boxes.form.title-box')} onclick={() => (show = !show)}><span>_</span></button>
    <ul class="wrapper boxes-list" data-title={t('home.boxes.title-box')} class:show>
        {#each boxes as box, i (box.id)}
            {@const pokemonInBox = currentPokemonList.filter((p) => p.box === box.id)}
            <li
                class="tag"
                class:show-additional={i !== 0 && pokemonInBox.length > MAX_POKEMON_PREVIEW - 1}
                data-additional-pokemon="+ {pokemonInBox.length - MAX_POKEMON_PREVIEW + 1}"
                ondragover={(event) => onDragOverElementHandle(event)}
                ondragleave={(event) => onDragLeaveElementHandle(event)}
                ondrop={(event) => onDropElementHandle(event, box)}
            >
                <button title={box.name} onclick={() => changeBox(box.id)}>{box.name}</button>
                {#each Array.from({ length: i === 0 ? MAX_POKEMON_PREVIEW : MAX_POKEMON_PREVIEW - 1 }) as _, index}
                    {#if pokemonInBox[index]}
                        <img
                            class="sprite"
                            draggable="true"
                            ondragstart={(event) => onDragStartElementHandle(event, pokemonInBox[index], box)}
                            ondragend={(event) => onDragEndElementHandle(event)}
                            src="{SPRITE_PICTURE_URL}{pokemonInBox[index].specie[1]}.png"
                            alt={pokemonInBox[index].specie[0]}
                        />
                    {:else}
                        <div class="empty"></div>
                    {/if}
                {/each}
            </li>
        {/each}
    </ul>
</boxes-list>

<style>
    boxes-list {
        aspect-ratio: 1;
        margin-left: auto;

        height: 100%;
        border-radius: 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;

        & > button {
            position: relative;
            border-radius: var(--medium-gap);

            &:hover {
                cursor: pointer;
            }

            &::before, &::after, & > span::before, & > span::after {
                content: "";
                position: absolute;
                height: 30%;
                border-radius: var(--small-gap);
                border: var(--smaller-gap) solid var(--text-color);
                background: var(--background-fourth-color);
            }

            &::before {
                width: 50%;
                top: var(--small-gap);
                left: var(--small-gap);
            }

            &::after {
                width: 25%;
                bottom: var(--small-gap);
                left: var(--small-gap);
            }

            & > span::before {
                width: 25%;
                top: var(--small-gap);
                right: var(--small-gap);
            }

            & > span::after {
                width: 50%;
                bottom: var(--small-gap);
                right: var(--small-gap);
            }
        }

        & > ul.boxes-list:not(.show) {
            display: none;
        }

        & > ul.boxes-list.show {
            z-index: 3;

            height: calc(75svh / 1.5);
            width: var(--max-width);

            position: absolute;
            top: calc(100% + var(--large-gap));
            left: 0;

            display: grid;
            grid-template: repeat(2, 1fr) / repeat(10, 1fr);
            align-items: center;
            gap: var(--medium-gap);

            border-radius: var(--large-gap);
            background-color: var(--background-fourth-color);
            box-shadow: var(--box-shadow);

            & > li {
                position: relative;

                display: grid;
                grid-template: auto repeat(3, 1fr) / 1fr 1fr;
                gap: var(--small-gap);

                height: 100%;
                padding: var(--small-gap);
                border-radius: var(--medium-gap);
                background-color: var(--background-color);
                border-radius: var(--medium-gap);
                border: 2px solid var(--accent-color);

                & > * {
                    height: 100%;
                }

                & > button {
                    grid-area: 1 / 1 / 1 / -1;
                    border-radius: var(--small-gap);
                    color: var(--background-color);
                    background-color: var(--accent-color);
                    border: 0;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }

                & > img,
                & > div.empty,
                &::after {
                    background-color: var(--background-third-color);
                    border-radius: var(--small-gap);
                    width: 100%;
                }

                & > img {
                    cursor: pointer;
                    object-fit: cover;

                    &:hover {
                        background-color: var(--background-fourth-color);
                    }
                }

                &.show-additional::after {
                    content: attr(data-additional-pokemon);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: var(--background-third-color);
                }
            }
        }
    }
</style>
