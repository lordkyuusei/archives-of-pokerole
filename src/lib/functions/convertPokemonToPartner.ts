import type { DbPartnerPokemon, DbPokemon } from "$lib/types/mongo/pokemon";
import type { ObjectId, WithId } from "mongodb";
import { getIdFromName } from "./getIdFromName";

const regroupPropertiesAsObj = (obj: any, prefix: string) =>
    Object.entries(obj)
        .filter(([key]) => key.startsWith(prefix))
        .reduce(
            (acc, [key, value]) => ({
                ...acc,
                [key.replace(prefix, '')]: parseInt(value as string),
            }),
            {} as any,
        );

const regroupMovesAsArray = (obj: any, prefix: string) =>
    Object.entries(obj)
        .filter(([key]) => key.startsWith(prefix))
        .reduce((acc, [_, value]) => {
            return [...acc, getIdFromName(value)];
        }, [] as string[]);

export const convertPokemonToPartner = (pkmn: WithId<DbPokemon>, pokemon: { [x: string]: any }): DbPartnerPokemon => ({
    id: crypto.randomUUID(),
    specie: [pkmn._id.toString(), pkmn['Number']],
    nickname: pokemon['Nickname'] === '' ? pkmn['Name'] : pokemon['Nickname'],
    shiny: pokemon['Shiny'] === "true",
    nature: pokemon['Nature'],
    status: pokemon['Status'],
    battles: Number(pokemon['Battles']),
    victories: Number(pokemon['Victories']),
    happiness: Number(pokemon['Happiness']),
    loyalty: Number(pokemon['Loyalty']),
    rank: pokemon['Rank'],
    notes: '',
    box: Number(pokemon["Box"]) ?? 0,
    hp: Number(pkmn['BaseHP']) + Number(pokemon['ATTR_Vitality']),
    will: Number(pokemon['ATTR_Insight']) + 2,
    heldItem: pokemon['HeldItem'],
    skills: regroupPropertiesAsObj(pokemon, 'SKILL_'),
    socials: regroupPropertiesAsObj(pokemon, 'SOC_'),
    attributes: regroupPropertiesAsObj(pokemon, 'ATTR_'),
    moves: regroupMovesAsArray(pokemon, 'MOVE_'),
});