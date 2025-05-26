<script lang="ts">
    import type { ObjectId, WithId } from 'mongodb';
    import { goto } from '$app/navigation';

    import t from '$lib/i18n/i18n.svelte';
    import { type DbMove } from '$lib/types/mongo/move';
    import type { DbPokemon } from '$lib/types/mongo/pokemon';
    import { getIdFromName } from '$lib/functions/getIdFromName';
    import { getPkmnTypeColor } from '$lib/functions/getPkmnTypeColor';
    import { getIconFromMoveCategory, getIconFromRank } from '$lib/functions/getIconFromData';

    type Props = {
        pokemon: DbPokemon;
        moves: WithId<DbMove>[];
        onMoveSelection?: null | ((move: WithId<DbMove>) => boolean);
    };

    let { pokemon, moves, onMoveSelection = null }: Props = $props();

    let selectedMoves: ObjectId[] = $state([]);

    const getDamage = (move: WithId<DbMove>) => {
        if (move['Power'] === 0) return '-';

        const rawDamage =
            move['Damage2'] !== ''
                ? `${t(`character.attribute.${move['Damage1']}`)} + ${t(`character.attribute.${move['Damage2']}`)} + ${move['Power']}`
                : `${t(`character.attribute.${move['Damage1']}`)} + ${move['Power']}`;

        return move['Type'] === pokemon['Type1'] || move['Type'] === pokemon['Type2']
            ? `${rawDamage} + 1 (STAB)`
            : rawDamage;
    };

    const getMoveInformation = (move: WithId<DbMove>) => {
        const id = getIdFromName(move['Name']);
        const icon = getIconFromMoveCategory(move['Category']);
        const typeColor = getPkmnTypeColor(move['Type'].toLowerCase());
        const damage = getDamage(move);

        const moveFromPokemon = pokemon.Moves.find((x) => x.Name === move.Name);
        if (!moveFromPokemon) return { id, icon, typeColor, damage, rankIcon: 'Starter' };

        const rankIcon = getIconFromRank(moveFromPokemon?.Learned);
        return { id, icon, typeColor, damage, rankIcon };
    };

    const selectMove = (id: string, move: WithId<DbMove>) => {
        if (onMoveSelection !== null) {
            const selected = onMoveSelection(move);
            if (!selected) return;

            selectedMoves = selectedMoves.includes(move['_id'])
                ? selectedMoves.filter((name) => name !== move['_id'])
                : [...selectedMoves, move['_id']];
        } else {
            goto('/moves/' + id);
        }
    };
</script>

<moves-list class:wrapper={onMoveSelection === null} class:selectable={onMoveSelection !== null} data-title="Capacités">
    <div class="overflow-container">
        <table>
            <thead>
                <tr>
                    <th>{t('pokedex.pokemon.moves-name')}</th>
                    <th>{t('pokedex.pokemon.moves-type')}</th>
                    <th>{t('pokedex.pokemon.moves-damage-pool')}</th>
                    <th>{t('pokedex.pokemon.moves-accuracy-pool')}</th>
                    <th>{t('pokedex.pokemon.moves-category')}</th>
                    <th>{t('pokedex.pokemon.moves-rank')}</th>
                </tr>
            </thead>
            <tbody>
                {#each moves as move, i (move._id)}
                    {@const { id, icon, rankIcon, typeColor, damage } = getMoveInformation(move)}
                    <tr class:selected={selectedMoves.includes(id)} onclick={() => selectMove(id, move)}>
                        <td><a href="/moves/{id}">{move['Name']}</a></td>
                        <td><span class="type" style:background={typeColor}>{move['Type']}</span></td>
                        <td>{damage}</td>
                        <td>
                            <ul>
                                <li>{t(`character.attribute.${move['Accuracy1']}`)}</li>
                                {#if move['Accuracy2'] !== ''}
                                    <li>{t(`character.attribute.${move['Accuracy2']}`)}</li>
                                {/if}
                            </ul>
                        </td>
                        <td
                            ><img
                                class="category"
                                src="/icons/{icon}"
                                title={move['Category']}
                                alt={move['Category']}
                            /></td
                        >
                        <td
                            ><img
                                class="rank"
                                src="/icons/{rankIcon}"
                                title={pokemon.Moves[i].Learned}
                                alt={pokemon.Moves[i].Learned}
                            /></td
                        >
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</moves-list>

<style>
    moves-list {
        display: grid;
        grid-template: 1fr / 1fr;

        &.selectable {
            cursor: pointer;
        }

        & > div.overflow-container {
            height: 100%;
            overflow-y: auto;

            & > table {
                font-size: small;
                border-radius: var(--medium-gap);

                & td {
                    text-align: center;
                }

                & > tbody {
                    & > tr.selected {
                        background-color: var(--background-accent-color);
                    }

                    & span.type {
                        padding: var(--small-gap) var(--medium-gap);
                        border-radius: var(--large-gap);
                    }
                }
            }
        }

        & img.rank {
            z-index: 1;
            clip-path: circle(13px at center);
        }
    }
</style>
