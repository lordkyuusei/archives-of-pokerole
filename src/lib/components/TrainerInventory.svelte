<script lang="ts">

    import t from '$lib/i18n/i18n.svelte';
    import type {
        Trainer,
        TrainerBadges,
        TrainerBattlePocket,
        TrainerHealingBag,
        TrainerMainPocket,
    } from '$lib/types/mongo/trainer';

    type Props = {
        trainer: Trainer;
        changeMainPocket: (pocket: TrainerMainPocket) => void;
        changeBattlePocket: (pocket: TrainerBattlePocket) => void;
        changeHealingBag: (pocket: TrainerHealingBag) => void;
        changeBadges: (pocket: TrainerBadges) => void;
    };

    let { trainer, changeMainPocket, changeBattlePocket, changeHealingBag, changeBadges }: Props = $props();

    let mainPocket: TrainerMainPocket = $derived(trainer.mainPocket);
    let battlePocket: TrainerBattlePocket = $derived(trainer.battlePocket);
    let healingBag: TrainerHealingBag = $derived(trainer.healingBag);
    let badges: TrainerBadges = $derived(trainer.badges);

    let bags: string[] = ['pocket.main-healing', 'pocket.battle'];
    let selectedBag: string = $state(bags[0]);
</script>

<trainer-inventory class="wrapper">
    <ul class="bags">
        {#each bags as bag}
            <li>
                <button class:selected={selectedBag === bag} onclick={() => (selectedBag = bag)}
                    >{t('trainer.' + bag)}</button
                >
            </li>
        {/each}
    </ul>

    {#if selectedBag === 'pocket.main-healing'}
        <ul class="main-pocket-healing">
            {#each mainPocket as _, i}
                <li class="pocket">
                    <input type="text" bind:value={mainPocket[i]} oninput={() => changeMainPocket(mainPocket)} />
                </li>
            {/each}
            {#each Object.entries(healingBag) as [healingItem, [_, uses, maxUses]], i}
                <li class="healing">
                    <label for={healingItem}>{healingItem}</label>
                    <input type="number" bind:value={healingBag[healingItem][0]} oninput={() => changeHealingBag(healingBag)} />
                    <ul class="healing-uses">
                        {#each Array.from({ length: maxUses }) as _, i}
                            <li>
                                <input
                                    type="checkbox"
                                    checked={i < uses}
                                    oninput={({ currentTarget }) => {
                                        const value = currentTarget.checked ? uses + 1 : uses - 1;
                                        healingBag[healingItem][1] = value;
                                        changeHealingBag(healingBag);
                                    }}
                                />
                            </li>
                        {/each}
                    </ul>
                </li>
            {/each}
        </ul>
    {:else if selectedBag === 'pocket.battle'}
        <ul class="battle-pocket">
            {#each battlePocket as _, i}
                <li>
                    <input type="text" bind:value={battlePocket[i]} oninput={() => changeBattlePocket(battlePocket)} />
                </li>
            {/each}
        </ul>
    {/if}
    <ul class="badges">
        {#each badges as [name, obtained], i}
            <li>
                <label for={name}>{name}</label>
                <input type="checkbox" bind:checked={badges[i][1]} />
            </li>
        {/each}
    </ul>
</trainer-inventory>

<style>
    trainer-inventory {
        display: grid;
        grid-template:
            'bags' auto
            'content' 1fr
            'badges' auto / 100%;

        background-color: var(--background-third-color);

        & input {
            background-color: var(--background-second-color);
        }

        & > ul {
            display: grid;
            align-items: center;

            & > li {
                height: 100%;
                border-radius: var(--medium-gap);
            }
        }

        & > ul.bags {
            grid-area: bags;

            display: grid;
            grid-template-columns: 1fr 1fr;

            & > li {
                &:first-child button {
                    border-radius: var(--medium-gap) 0 0 0;
                }

                &:last-child button {
                    border-radius: 0 var(--medium-gap) 0 0;
                }

                & > button {
                    width: 100%;
                    border-radius: 0;

                    &.selected {
                        border-color: var(--text-color);
                        color: var(--background-second-color);
                        background-color: var(--text-color);
                    }
                }
            }
        }

        & > ul.battle-pocket,
        & > ul.main-pocket-healing {
            grid-area: content;

            gap: var(--medium-gap);
            padding: var(--medium-gap);

            border: 2px solid var(--text-color);
            border-top: none;
            border-radius: 0 0 var(--medium-gap) var(--medium-gap);
        }

        & > ul.battle-pocket {
            grid-template-columns: 1fr 1fr 1fr;
            grid-auto-rows: 1fr;

            font-size: small;
        }

        & > ul.main-pocket-healing {
            grid-template-rows: repeat(6, 1fr);
            grid-template-columns: 1fr 2fr 3fr;

            & > li.pocket {
                grid-column: 1 / -1;
            }

            & > li.healing {
                grid-row: 6;

                display: grid;
                grid-template: auto 1fr / 1fr auto;
                align-items: center;
                gap: var(--large-gap);

                padding: var(--medium-gap);
                background-color: var(--background-second-color);

                & > label {
                    text-wrap: nowrap;
                }

                & input {
                    background-color: var(--background-third-color);
                }

                & > ul {
                    grid-column: 1 / -1;

                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    grid-template-rows: 1fr 1fr;
                    gap: var(--small-gap);
                }
            }
        }

        & > ul.badges {
            grid-auto-flow: column;

            border: 2px solid var(--text-color);
            border-radius: var(--medium-gap);
            margin-top: var(--medium-gap);
            padding: var(--medium-gap);

            & > li {
                display: flex;
                flex-direction: column;
                justify-content: start;
            }
        }
    }
</style>
