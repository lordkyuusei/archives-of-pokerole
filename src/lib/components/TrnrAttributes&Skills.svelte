<script lang="ts">
    import t from '$lib/i18n/i18n.svelte';
    import type { Trainer } from '$lib/types/mongo/trainer';

    import PartnerAttribute from './PartnerAttribute.svelte';

    type Props = { trainer: Trainer };
    let { trainer }: Props = $props();
</script>


<div class="wrapper stats" data-title="Attributs & Skills">
    <ul class="attributes">
        {#each Object.entries(trainer.attributes) as [key, value] (key)}
            <li>
                <PartnerAttribute name={t(`character.attribute.${key}`)} {value} minValue={1} maxValue={5}></PartnerAttribute>
            </li>
        {/each}
    </ul>

    <ul class="achievements">
        {#each trainer.achievements as [name, _], i (name)}
            <li>
                <label for={name}>{t(`trainer.achievement.${name}`)}</label>
                <input id={name} type="checkbox" bind:checked={trainer.achievements[i][1]} />
            </li>
        {/each}
    </ul>

    <ul class="skills">
        {#each Object.entries(trainer.skills) as [key, value]}
            <li>
                <PartnerAttribute name={t(`character.attribute.${key}`)} {value} minValue={0} maxValue={5}></PartnerAttribute>
            </li>
        {/each}
    </ul>
</div>

<style>
    div.stats {
        display: grid;
        grid-template: repeat(4, 1fr) 2fr / 1fr auto;
        gap: var(--medium-gap);

        & > ul {
            &.attributes {
                display: contents;
            }

            &.achievements {
                display: grid;
                grid-auto-flow: row;
                align-items: center;

                padding: var(--small-gap);
                border-radius: var(--small-gap);

                background: var(--background-fourth-color);

                & > li {
                    display: grid;
                    grid-template: auto / 1fr auto;
                    padding-inline: var(--medium-gap);
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
