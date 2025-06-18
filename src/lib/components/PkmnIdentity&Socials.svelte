<script lang="ts">
    import { getContext } from 'svelte';

    import { AILMENTS, type Ailment } from '$lib/constants/ailments';
    import t from '$lib/i18n/i18n.svelte';
    import { type DbNature } from '$lib/types/mongo/nature';

    import { getPkmnMoves, getPokemon, getSpecie, setPokemonProperty } from '$lib/state/pokemon.svelte';
    import CharacterProperty from './fragments/CharacterProperty.svelte';
    import Toggle from './fragments/Toggle.svelte';
    import MovesList from './lodestones/pokemon/MovesList.svelte';
    import PartnerAttribute from './PartnerAttribute.svelte';
    import PokemonTypes from './PokemonTypes.svelte';
    import { getIdFromName } from '$lib/functions/getIdFromName';

    let pokemon = $derived(getPokemon());
    let moves = $derived(getPkmnMoves());
    let specie = $derived(getSpecie());

    let shiftModifier: boolean = $state(false);
    let movesViewToggle: boolean = $state<boolean>(false);

    // tmp fix for getContext as intellisense says it returns an array when it returns a function.
    const natures = (getContext<DbNature[]>('natures') as unknown as () => DbNature[])();

    const getConfidence = (nature: string) => natures.find((n) => n.Name === nature)?.Confidence ?? 0;
    const getAilmentModifier = (status: Ailment) => (status === 'Paralysis' ? -2 : 0);

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

<pkmn-identity-socials class="wrapper" data-title={t(`home.character.${movesViewToggle ? 'moveset' : 'identity'}`)}>
    {#if movesViewToggle && specie}
        <div class="moves">
            <MovesList pokemon={specie} {moves} onMoveSelection={(_) => true}></MovesList>
        </div>
    {:else if pokemon && specie}
        {@const confidence = getConfidence(pokemon.nature)}
        <div class="socials-types">
            <ul class="socials">
                {#each Object.entries(pokemon.socials) as [key, value]}
                    <li>
                        <PartnerAttribute name={t(`character.attribute.${key}`)} {value} minValue={0} maxValue={5}></PartnerAttribute>
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
                        onUpdate={(loyalty) => setPokemonProperty('loyalty', loyalty)}></PartnerAttribute>
                </li>
                <li>
                    <PartnerAttribute
                        name={t('form.pokemon.Happiness')}
                        value={pokemon.happiness}
                        maxValue={5}
                        onUpdate={(happiness) => setPokemonProperty('happiness', happiness)}></PartnerAttribute>
                </li>
            </ul>
            <ul class="battle-wins">
                <li>
                    <CharacterProperty name={t('form.pokemon.Battles')} value={pokemon.battles} large>
                        <button class="secondary group" onclick={() => setPokemonProperty('battles', pokemon.battles - 1)}>-1</button>
                        <button class="secondary group" onclick={() => setPokemonProperty('battles', pokemon.battles + 1)}>+1</button>
                    </CharacterProperty>
                </li>
                <li>
                    <CharacterProperty name={t('form.pokemon.Victories')} value={pokemon.victories} large>
                        <button class="secondary group" onclick={() => setPokemonProperty('victories', pokemon.victories - 1)}>-1</button>
                        <button class="secondary group" onclick={() => setPokemonProperty('victories', pokemon.victories + 1)}>+1</button>
                    </CharacterProperty>
                </li>
            </ul>
            <ul class="nature-abilities">
                <li>
                    <CharacterProperty name={t('form.character.nature')} value="{pokemon.nature} ({confidence})"></CharacterProperty>
                </li>
                <li>
                    <CharacterProperty name={t('form.pokemon.abilities')} value="">
                        <a href="/abilities/{getIdFromName(specie['Ability1'])}" target="_blank">{specie['Ability1']}</a>
                        {#if specie['Ability2'] !== ''}
                            <a href="/abilities/{getIdFromName(specie['Ability2'])}" target="_blank">{specie['Ability2']}</a>
                        {/if}
                    </CharacterProperty>
                </li>
            </ul>
            <textarea
                class="notes"
                placeholder={t('form.character.notes').replace('$1', pokemon.nickname)}
                value={pokemon.notes}
                oninput={({ currentTarget }) => setPokemonProperty('notes', currentTarget.value)}></textarea>
        </div>
    {/if}

    {#if pokemon && specie}
        {@const totalHp = specie['BaseHP'] + pokemon.attributes['Vitality']}
        {@const totalWp = pokemon.attributes['Insight'] + 2}
        {@const ailmentDexModifier = getAilmentModifier(pokemon.status)}
        <ul class="references">
            <li>
                <CharacterProperty name={t('character.attribute.HitPoints')} value="{pokemon.hp} / {totalHp}" large>
                    <button class="secondary group" onclick={() => setPokemonProperty('hp', Math.max(pokemon.hp - 1, 0))}>-1</button>
                    <button class="secondary group" onclick={() => setPokemonProperty('hp', Math.min(pokemon.hp + 1, totalHp))}>+1</button>
                </CharacterProperty>
            </li>
            <li>
                <CharacterProperty name={t('character.attribute.WillPoints')} value="{pokemon.will} / {pokemon.attributes['Insight'] + 2}" large>
                    <button class="secondary group" onclick={() => setPokemonProperty('will', Math.max(pokemon.will - 1, 0))}>-1</button>
                    <button class="secondary group" onclick={() => setPokemonProperty('will', Math.max(pokemon.will - 1, totalWp))}>+1</button>
                </CharacterProperty>
            </li>
            <li>
                <CharacterProperty name={t('form.pokemon.held-item')} wrapper large>
                    <input
                        type="text"
                        id="Item"
                        value={pokemon.heldItem}
                        onchange={({ currentTarget }) => setPokemonProperty('heldItem', currentTarget.value)} />
                </CharacterProperty>
            </li>
            <li>
                <CharacterProperty name={t('form.pokemon.status')} wrapper large>
                    <select
                        id="Status"
                        value={pokemon.status}
                        onchange={({ currentTarget }) => setPokemonProperty('status', currentTarget.value as Ailment)}>
                        {#each AILMENTS as ailment}
                            <option value={ailment}>{t(`pokemon.ailment.${ailment}`)}</option>
                        {/each}
                    </select>
                </CharacterProperty>
            </li>
            <li>
                <CharacterProperty
                    name={t('pokemon.attribute.initiative')}
                    value="1D6 + {Math.max(0, pokemon.attributes['Dexterity'] + ailmentDexModifier + pokemon.skills['Alert'])}"></CharacterProperty>
            </li>
            <li>
                <CharacterProperty
                    name={t('pokemon.attribute.defense')}
                    value="Ph: {pokemon.attributes['Vitality']} / Sp: {pokemon.attributes['Insight']}"></CharacterProperty>
            </li>
            <li>
                <CharacterProperty
                    name={t('pokemon.attribute.evasion')}
                    value="{Math.max(0, pokemon.skills['Evasion'] + pokemon.attributes['Dexterity'] + ailmentDexModifier)}D6"></CharacterProperty>
            </li>
            <li>
                <CharacterProperty
                    name={t('pokemon.attribute.clash')}
                    value="Ph: {pokemon.skills['Clash'] + pokemon.attributes['Strength']}D6 / Sp: {pokemon.skills['Clash'] +
                        pokemon.attributes['Special']}D6"></CharacterProperty>
            </li>
            <li>
                <CharacterProperty name={t('form.character.rank')} value={pokemon.rank}></CharacterProperty>
            </li>
            <li>
                <CharacterProperty name=" " value={t(`form.${movesViewToggle ? 'character.socials' : 'pokemon.moveset'}`)} large>
                    <Toggle bind:toggled={movesViewToggle}></Toggle>
                </CharacterProperty>
            </li>
        </ul>
    {/if}
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
