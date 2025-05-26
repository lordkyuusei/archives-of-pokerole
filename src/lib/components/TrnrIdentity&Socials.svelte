<script lang="ts">
    import { getContext } from 'svelte';
    import type { WithId } from 'mongodb';

    import t from '$lib/i18n/i18n.svelte';
    import { type DbNature } from '$lib/types/mongo/nature';
    import {
        type Trainer,
        type TrainerBadges,
        type TrainerBattlePocket,
        type TrainerHealingBag,
        type TrainerMainPocket,
    } from '$lib/types/mongo/trainer';

    import Toggle from './fragments/Toggle.svelte';
    import TrainerPokedex from './TrainerPokedex.svelte';
    import PartnerAttribute from './PartnerAttribute.svelte';
    import CharacterProperty from './fragments/CharacterProperty.svelte';
    import TrainerInventory from './TrainerInventory.svelte';
    import { getNbrPokemonStatus } from '$lib/functions/binaryPokedexStorage';

    type Props = {
        trainer: Trainer;
        species: WithId<{ Name: string, DexID: string, Number: number }>[];
        changeHp: (hp: number) => void;
        changeWp: (wp: number) => void;
        changeNotes: (notes: string) => void;
        changePokedex: (pokedex) => void;
        changeMoney: (money: number) => void;
        changeBattlePocket: (battlePocket: TrainerBattlePocket) => void;
        changeMainPocket: (mainPocket: TrainerMainPocket) => void;
        changeHealingBag: (battlePocket: TrainerHealingBag) => void;
        changeBadges: (battlePocket: TrainerBadges) => void;
    };

    let {
        trainer,
        species,
        changeHp,
        changeWp,
        changeNotes,
        changePokedex,
        changeMoney,
        changeBadges,
        changeBattlePocket,
        changeHealingBag,
        changeMainPocket,
    }: Props = $props();

    let debounceTimeout: NodeJS.Timeout;
    let showPokedex: boolean = $state(false);
    let shiftModifier: boolean = $state(false);
    let showInventory: boolean = $state(false);

    let pokedex = $derived(trainer.pokedex);
    let notes: string = $derived(trainer.notes);
    let totalHp: number = $derived(4 + trainer.attributes['Vitality']);
    let [pokemonSeen, pokemonCaught] = $derived(getNbrPokemonStatus(pokedex, species));
    let confidence: number = $derived(natures.find((n) => n.Name === trainer.nature)?.Confidence ?? 0);

    // tmp fix for getContext as intellisense says it returns an array when it returns a function.
    const natures = (getContext<DbNature[]>('natures') as unknown as () => DbNature[])();

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

    const startMoneyDecrease = (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
        if (debounceTimeout) clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            debounceTimeout = setInterval(() => changeMoney(-10), 10);
        }, 250);
    };

    const startMoneyIncrease = (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
        if (debounceTimeout) clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            debounceTimeout = setInterval(() => changeMoney(10), 10);
        }, 250);
    };

    const stopMoneyDecrease = (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
        clearTimeout(debounceTimeout);
    };

    const stopMoneyIncrease = (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
        clearTimeout(debounceTimeout);
    };
</script>

<svelte:body onkeydown={captureShiftModifier} onkeyup={releaseShiftModifier} />

<trnr-identity-socials class="wrapper" data-title={t(`trainer.identity.${showInventory ? 'inventory-badges' : 'title'}`)}>
    {#if showInventory}
        <TrainerInventory {trainer} {changeBattlePocket} {changeMainPocket} {changeHealingBag} {changeBadges}></TrainerInventory>
    {:else if showPokedex}
        <TrainerPokedex {species} {pokedex} {changePokedex}></TrainerPokedex>
    {:else}
        <div class="socials-types">
            <ul class="socials">
                {#each Object.entries(trainer.socials) as [key, value]}
                    <li>
                        <PartnerAttribute name={t(`character.attribute.${key}`)} {value} minValue={0} maxValue={5}></PartnerAttribute>
                    </li>
                {/each}
            </ul>
            <textarea
                class="notes"
                placeholder={t(`form.character.notes`).replace('$1', trainer.name)}
                bind:value={notes}
                oninput={() => changeNotes(notes)}
            >
            </textarea>
        </div>
    {/if}

    <ul class="references">
        <li>
            <CharacterProperty name={t('character.attribute.HitPoints')} value="{trainer.hp} / {totalHp}" large>
                <button class="group" onclick={() => changeHp(-1)}>-1</button>
                <button class="group" onclick={() => changeHp(1)}>+1</button>
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('character.attribute.WillPoints')} value="{trainer.will} / {trainer.attributes['Insight'] + 2}" large>
                <button class="group" onclick={() => changeWp(-1)}>-1</button>
                <button class="group" onclick={() => changeWp(1)}>+1</button>
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('trainer.attribute.money')} value="{trainer.money} P$" large>
                <button
                    class="group"
                    onclick={() => changeMoney(-1)}
                    onmousedown={startMoneyDecrease}
                    onmouseup={stopMoneyDecrease}>-1</button
                >
                <button
                    class="group"
                    onclick={() => changeMoney(1)}
                    onmousedown={startMoneyIncrease}
                    onmouseup={stopMoneyIncrease}>+1</button
                >
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.trainer.name')} value={trainer.name}></CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.trainer.age')} value={trainer.age}></CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.character.nature')} value="{trainer.nature} ({confidence})"></CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.trainer.concept')} value={trainer.concept}></CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('trainer.pokedex.pokedex')} value="{pokemonSeen} {t('trainer.pokedex.seen')} / {pokemonCaught} {t('trainer.pokedex.caught')}"></CharacterProperty>
        </li>
        <li>
            <CharacterProperty name={t('form.character.rank')} value={trainer.rank}></CharacterProperty>
        </li>
        <li>
            <CharacterProperty name=" " value={t(`form.${showInventory ? 'character.socials' : 'trainer.bags'}`)} large>
                <Toggle bind:toggled={showInventory}></Toggle>
            </CharacterProperty>
        </li>
        <li>
            <CharacterProperty name=" " value={t(`form.${showPokedex ? 'character.socials' : 'trainer.pokedex'}`)} large>
                <Toggle bind:toggled={showPokedex}></Toggle>
            </CharacterProperty>
        </li>
    </ul>
</trnr-identity-socials>

<style>
    trnr-identity-socials {
        display: grid;
        grid-template: 1fr / 2fr 1fr;
        grid-template-areas: 'identity-socials references';
        gap: calc(var(--large-gap) * 2);

        & > div.socials-types {
            display: grid;
            grid-template: repeat(5, 1fr) / 1fr 3fr;
            gap: var(--medium-gap);
            grid-template-areas:
                'social notes'
                'social notes'
                'social notes'
                'social notes'
                'social notes';

            & > ul.socials {
                display: grid;
                grid-template: subgrid / 1fr;
                grid-area: social;
            }

            & > textarea.notes {
                grid-area: notes;
            }
        }

        & > ul.references {
            grid-area: references;

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
