import { rankUpSettings } from "$lib/constants/rankUpConfigs";
import { PokemonSkills } from "$lib/constants/skills";
import type { DbPokemon, DbPokemonMove } from "$lib/types/mongo/pokemon";
import type { WithId } from "mongodb";
import { getLearnableMoves } from "./getLearnableMoves";

export const generatePokemon = (pokemon: WithId<DbPokemon>, rank: number, nature: string, boxId: string) => {
    const successiveRankUps = rankUpSettings.slice(0, rank + 1);
    const attrIncrease = successiveRankUps.reduce((acc, rankup) => acc + rankup.config.attributePoints, 0);
    const socIncrease = successiveRankUps.reduce((acc, rankup) => acc + rankup.config.socialPoints, 0);
    const skillIncrease = successiveRankUps.map((rankup) => rankup.config.skillPoints);

    const attrReferences = [
        [pokemon.Strength, pokemon.MaxStrength],
        [pokemon.Dexterity, pokemon.MaxDexterity],
        [pokemon.Vitality, pokemon.MaxVitality],
        [pokemon.Special, pokemon.MaxSpecial],
        [pokemon.Insight, pokemon.MaxInsight],
    ];

    console.log(`Generating a ${rankUpSettings[rank].to} ${pokemon.Name}`);
    let attributes = Array.from({ length: 5 }, (_, i) => attrReferences[i][0]);
    let remainingAttr = attrIncrease;

    while (remainingAttr > 0) {
        const randomIndex = Math.floor(Math.random() * 5);
        if (attributes[randomIndex] < attrReferences[randomIndex][1]) {
            attributes[randomIndex]++;
            remainingAttr--;
        }
    }

    console.log(`Attributes: ${attributes.join(', ')}`);

    let socials = Array.from({ length: 5 }, (_, i) => 0);
    let remainingSoc = socIncrease;

    while (remainingSoc > 0) {
        const randomIndex = Math.floor(Math.random() * 5);
        if (socials[randomIndex] < 5) {
            socials[randomIndex]++;
            remainingSoc--;
            console.log('increased social points for index', randomIndex, 'to', socials[randomIndex]);
        }
    }

    console.log(`Socials: ${socials.join(', ')}`);
    let skills = Array.from({ length: PokemonSkills.length }, (_, i) => 0);

    skillIncrease.forEach((points, n) => {
        let remainingPoints = points;
        while (remainingPoints > 0) {
            const randomIndex = Math.floor(Math.random() * skills.length);
            if (skills[randomIndex] < n + 1) {
                skills[randomIndex]++;
                remainingPoints--;
            }
        }
    });

    console.log(`Skills: ${skills.join(', ')}`);
    const learnableMoveset = getLearnableMoves(pokemon.Moves, rankUpSettings[rank].to);
    const learnableAmount = attributes[4] + 2;

    const moves: WithId<DbPokemonMove>[] = Array.from({ length: learnableAmount }).reduce((acc: WithId<DbPokemonMove>[], _, i) => {
        let possibleLearnset = learnableMoveset.filter((move) => !acc.some((m) => m.Name === move.Name));
        if (possibleLearnset.length === 0) return acc;

        const randomIndex = Math.floor(Math.random() * possibleLearnset.length);
        return [...acc, possibleLearnset[randomIndex]];
    }, [] as WithId<DbPokemonMove>[]);

    const rawPokemonData = {
        Nickname: pokemon.Name,
        Shiny: Math.ceil(Math.random() * 100) === 1,
        Nature: nature,
        Status: 'Healthy',
        Battles: 0,
        Victories: 0,
        Happiness: 2,
        Loyalty: 2,
        Rank: rankUpSettings[rank].to,
        Box: boxId,
        HeldItem: '',
        ATTR_Strength: attributes[0],
        ATTR_Dexterity: attributes[1],
        ATTR_Vitality: attributes[2],
        ATTR_Special: attributes[3],
        ATTR_Insight: attributes[4],
        SOC_Tough: socials[0],
        SOC_Cool: socials[1],
        SOC_Beauty: socials[2],
        SOC_Cute: socials[3],
        SOC_Clever: socials[4],
        ...PokemonSkills.reduce((acc, skill, index) => {
            acc[`SKILL_${skill}`] = skills[index];
            return acc;
        }, {}),
        ...moves.reduce((acc, move, index) => {
            acc[`MOVE_${index + 1}`] = move.Name;
            return acc;
        }, {}),
    };

    return { pokemon, rawPokemonData };

}