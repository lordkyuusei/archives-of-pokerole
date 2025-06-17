<script lang="ts">
    import type { WithId } from 'mongodb';
    import { getContext } from 'svelte';
    import { Tween } from 'svelte/motion';

    import t from '$lib/i18n/i18n.svelte';
    import { type DbNature } from '$lib/types/mongo/nature';

    import { getNbrPokemonStatus } from '$lib/functions/binaryPokedexStorage';
    import { getTrainer, setTrainerProperty } from '$lib/state/trainer.svelte';
    import type { DbPokemonShort } from '$lib/types/mongo/pokemon';
    import CharacterProperty from './fragments/CharacterProperty.svelte';
    import Toggle from './fragments/Toggle.svelte';
    import PartnerAttribute from './PartnerAttribute.svelte';
    import TrainerInventory from './TrainerInventory.svelte';
    import TrainerPokedex from './TrainerPokedex.svelte';
    import TrainerMoneyInput from './lodestones/trainer/TrainerMoneyInput.svelte';
    import { linear } from 'svelte/easing';

    type Props = {
        species: WithId<DbPokemonShort>[];
    };

    let { species }: Props = $props();

    let trainer = $derived(getTrainer());

    let showPokedex: boolean = $state(false);
    let shiftModifier: boolean = $state(false);
    let showInventory: boolean = $state(false);

    let moneyAnimated: Tween<number> = new Tween(0, {
        duration: 3000,
        easing: linear,
        interpolate: (a, b) => (t) => Math.round(a + (b - a) * t),
    });

    $effect(() => {
        if (trainer) {
            moneyAnimated.target = trainer.money;
        }
    });

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
</script>

<svelte:body onkeydown={captureShiftModifier} onkeyup={releaseShiftModifier} />

{#if trainer}
    {@const totalHp = 4 + trainer.attributes['Vitality']}
    {@const totalWp = trainer.attributes['Insight'] + 2}
    {@const [pokemonSeen, pokemonCaught] = getNbrPokemonStatus(trainer.pokedex, species)}
    {@const confidence = natures.find((n) => n.Name === trainer.nature)?.Confidence ?? 0}
    <trnr-identity-socials class="wrapper" data-title={t(`trainer.identity.${showInventory ? 'inventory-badges' : 'title'}`)}>
        {#if showInventory}
            <TrainerInventory></TrainerInventory>
        {:else if showPokedex}
            <TrainerPokedex {species} pokedex={trainer.pokedex}></TrainerPokedex>
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
                    value={trainer.notes}
                    oninput={({ currentTarget }) => setTrainerProperty('notes', currentTarget.value)}
                ></textarea>
            </div>
        {/if}

        <ul class="references">
            <li>
                <CharacterProperty name={t('character.attribute.HitPoints')} value="{trainer.hp} / {totalHp}" large>
                    <button class="group" onclick={() => setTrainerProperty('hp', Math.max(trainer.hp - 1, 0))}>-1</button>
                    <button class="group" onclick={() => setTrainerProperty('hp', Math.min(trainer.hp + 1, totalHp))}>+1</button>
                </CharacterProperty>
            </li>
            <li>
                <CharacterProperty name={t('character.attribute.WillPoints')} value="{trainer.will} / {trainer.attributes['Insight'] + 2}" large>
                    <button class="group" onclick={() => setTrainerProperty('will', Math.max(trainer.will - 1, 0))}>-1</button>
                    <button class="group" onclick={() => setTrainerProperty('will', Math.min(trainer.will + 1, totalWp))}>+1</button>
                </CharacterProperty>
            </li>
            <li>
                <CharacterProperty name={t('trainer.attribute.money')} value="{moneyAnimated.current} P$" large>
                    <TrainerMoneyInput money={moneyAnimated.current} onMoneyUpdate={(newMoney) => setTrainerProperty('money', newMoney)}
                    ></TrainerMoneyInput>
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
                <CharacterProperty
                    name={t('trainer.pokedex.pokedex')}
                    value="{pokemonSeen} {t('trainer.pokedex.seen')} / {pokemonCaught} {t('trainer.pokedex.caught')}"
                ></CharacterProperty>
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
{/if}

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
