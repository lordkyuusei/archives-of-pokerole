<script lang="ts">
    import { getContext } from 'svelte';
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import type { DbMove } from '$lib/types/mongo/move';
    import { type DbNature } from '$lib/types/mongo/nature';
    import { AILMENTS, type Ailment } from '$lib/constants/ailments';
    import type { DbPartnerPokemon, DbPokemon } from '$lib/types/mongo/pokemon';

    import Toggle from './fragments/Toggle.svelte';
    import PokemonTypes from './PokemonTypes.svelte';
    import PartnerAttribute from './PartnerAttribute.svelte';
    import MovesList from './lodestones/pokemon/MovesList.svelte';
    import CharacterProperty from './fragments/CharacterProperty.svelte';

    type Props = {
        pokemon: DbPartnerPokemon;
        specie: DbPokemon;
        moves: WithId<DbMove>[];
        changeHp: (hp: number) => void;
        changeWp: (wp: number) => void;
        changeItem: (item: string) => void;
        changeStatus: (status: Ailment) => void;
        changeBattle: (battles: number) => void;
        changeWins: (wins: number) => void;
        changeNotes: (notes: string) => void;
        changeLoyalty: (loyalty: number) => void;
        changeHappiness: (happiness: number) => void;
    };

    let {
        pokemon,
        specie,
        moves,
        changeHp,
        changeWp,
        changeItem,
        changeStatus,
        changeBattle,
        changeWins,
        changeNotes,
        changeLoyalty,
        changeHappiness,
    }: Props = $props();

    let movesViewToggle: boolean = $state<boolean>(false);

    let status: Ailment = $derived(pokemon.status);
    let heldItem: string = $derived(pokemon.heldItem);
    let notes: string = $derived(pokemon.notes);
    let totalHp: number = $derived(specie['BaseHP'] + pokemon.attributes['Vitality']);

    // tmp fix for getContext as intellisense says it returns an array when it returns a function.
    const natures = (getContext<DbNature[]>('natures') as unknown as () => DbNature[])();

    let confidence: number = $derived(natures.find((n) => n.Name === pokemon.nature)?.Confidence ?? 0);
    let ailmentDexModifier: number = $derived(status === 'Paralysis' ? -2 : 0);

    let shiftModifier: boolean = $state(false);

    const captureShiftModifier = (event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) => {
        if (event.key === 'Shift') {
            event.preventDefault();
            shiftModifier = true;
        }
    };

    const releaseShiftModifier = (event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) => {
        if (event.key === 'Shift') {
            event.preventDefault();
            shiftModifier = false;
        }
    };
</script>

<svelte:body onkeydown={captureShiftModifier} onkeyup={releaseShiftModifier} />

<pkmn-identity-socials
    class="wrapper"
    data-title={t(`home.character.${movesViewToggle ? 'moveset' : 'identity'}`)}
>
    {#if movesViewToggle}
        <div class="moves">
            <MovesList pokemon={specie} {moves} onMoveSelection={(_) => true}></MovesList>
        </div>
    {:else}
        <div class="socials-types">
            <ul class="socials">
                {#each Object.entries(pokemon.socials) as [key, value]}
                    <li>
                        <PartnerAttribute name={t(`character.attribute.${key}`)} {value} minValue={0} maxValue={5}
                        ></PartnerAttribute>
                    </li>
                {/each}
            </ul>
            <div style:grid-area="types">
                <PokemonTypes helperPosition="top" types={[specie['Type1'], specie['Type2']]}></PokemonTypes>
            </div>
            <ul class="loyalty-happiness">
                <li>
                    <PartnerAttribute
                        name={t('form.pokemon.Loyalty')}
                        value={pokemon.loyalty}
                        maxValue={5}
                        onUpdate={changeLoyalty}
                    ></PartnerAttribute>
                </li>
                <li>
                    <PartnerAttribute
                        name={t('form.pokemon.Happiness')}
                        value={pokemon.happiness}
                        maxValue={5}
                        onUpdate={changeHappiness}
                    ></PartnerAttribute>
                </li>
            </ul>
            <ul class="battle-wins">
                <li>
                    <CharacterProperty name={t('form.pokemon.Battles')} value={pokemon.battles} large>
                        <button class="secondary group" onclick={() => changeBattle(-1)}>-1</button>
                        <button class="secondary group" onclick={() => changeBattle(1)}>+1</button>
                    </CharacterProperty>
                </li>
                <li>
                    <CharacterProperty name={t('form.pokemon.Victories')} value={pokemon.victories} large>
                        <button class="secondary group" onclick={() => changeWins(-1)}>-1</button>
                        <button class="secondary group" onclick={() => changeWins(1)}>+1</button>
                    </CharacterProperty>
                </li>
            </ul>
            <ul class="nature-abilities">
                <li>
                    <CharacterProperty name={t('form.character.nature')} value="{pokemon.nature} ({confidence})"
                    ></CharacterProperty>
                </li>
                <li>
                    <CharacterProperty
                        name={t('form.pokemon.abilities')}
                        value="{specie['Ability1']}{specie['Ability2'] !== '' ? ' / ' + specie['Ability2'] : ''}"
                    ></CharacterProperty>
                </li>
            </ul>
            <textarea
                class="notes"
                placeholder={t('form.character.notes').replace('$1', pokemon.nickname)}
                bind:value={notes}
                oninput={() => changeNotes(notes)}
            >
            </textarea>
        </div>
    {/if}

    <ul class="references">
        <li>
            <CharacterProperty name={t('character.attribute.HitPoints')} value="{pokemon.hp} / {totalHp}" large>
                <button class="secondary group" onclick={() => changeHp(-1)}>-1</button>
                <button class="secondary group" onclick={() => changeHp(1)}>+1</button>
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty
                name={t('character.attribute.WillPoints')}
                value="{pokemon.will} / {pokemon.attributes['Insight'] + 2}"
                large
            >
                <button class="secondary group" onclick={() => changeWp(-1)}>-1</button>
                <button class="secondary group" onclick={() => changeWp(1)}>+1</button>
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.pokemon.held-item')} wrapper large>
                <input type="text" id="Item" bind:value={heldItem} onchange={() => changeItem(heldItem)} />
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.pokemon.status')} wrapper large>
                <select id="Status" bind:value={status} onchange={() => changeStatus(status)}>
                    {#each AILMENTS as ailment}
                        <option value={ailment}>{t(`pokemon.ailment.${ailment}`)}</option>
                    {/each}
                </select>
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty
                name={t('pokemon.attribute.initiative')}
                value="1D6 + {Math.max(
                    0,
                    pokemon.attributes['Dexterity'] + ailmentDexModifier + pokemon.skills['Alert'],
                )}"
            ></CharacterProperty>
        </li>
        <li>
            <CharacterProperty
                name={t('pokemon.attribute.defense')}
                value="Ph: {pokemon.attributes['Vitality']} / Sp: {pokemon.attributes['Insight']}"
            ></CharacterProperty>
        </li>
        <li>
            <CharacterProperty
                name={t('pokemon.attribute.evasion')}
                value="{Math.max(
                    0,
                    pokemon.skills['Evasion'] + pokemon.attributes['Dexterity'] + ailmentDexModifier,
                )}D6"
            ></CharacterProperty>
        </li>
        <li>
            <CharacterProperty
                name={t('pokemon.attribute.clash')}
                value="Ph: {pokemon.skills['Clash'] + pokemon.attributes['Strength']}D6 / Sp: {pokemon.skills['Clash'] +
                    pokemon.attributes['Special']}D6"
            ></CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.character.rank')} value={pokemon.rank}></CharacterProperty>
        </li>
        <li>
            <CharacterProperty
                name=" "
                value={t(`form.${movesViewToggle ? 'character.socials' : 'pokemon.moveset'}`)}
                large
            >
                <Toggle bind:toggled={movesViewToggle}></Toggle>
            </CharacterProperty>
        </li>
    </ul>
</pkmn-identity-socials>

<style>
    pkmn-identity-socials {
        display: grid;
        grid-template: 1fr / 2fr 1fr;
        grid-template-areas: 'identity-socials-moves references';
        gap: calc(var(--large-gap) * 2);

        & > div.moves,
        & > div.socials-types {
            grid-area: identity-socials-moves;
        }

        & > div.socials-types {
            display: grid;
            grid-template:
                'social loyalty-happiness' 1fr
                'social battle-wins' 1fr
                'social nature-abilities' 1fr
                'social notes' 1fr
                'social notes' 1fr
                'types types' auto / 1fr 3fr;

            gap: var(--medium-gap);

            & > ul.socials {
                display: grid;
                grid-template: subgrid / 1fr;
                grid-area: social;
            }

            & > ul.nature-abilities {
                grid-area: nature-abilities;
            }

            & > ul.battle-wins {
                grid-area: battle-wins;
            }

            & > ul.loyalty-happiness {
                grid-area: loyalty-happiness;

                display: grid;
                grid-template: 1fr / 1fr 1fr;
                gap: var(--medium-gap);
            }

            & > textarea.notes {
                grid-area: notes;
            }
        }

        & > ul.references {
            grid-area: references;
        }

        & > ul.references,
        & ul.battle-wins,
        & ul.nature-abilities {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            gap: var(--medium-gap);

            & > li {
                height: 100%;
            }
        }
    }
</style>
