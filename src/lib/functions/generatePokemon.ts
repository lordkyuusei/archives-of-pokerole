import type { WithId } from "mongodb";
import { PokemonSkills, type PokemonSkill } from "$lib/constants/skills";
import { getLearnableMoves, getLearnableMovesData, pickRandomMoves } from "./getLearnableMoves";
import { rankUpSettings } from "$lib/constants/rankUpConfigs";
import { pokemonRankOrder } from "$lib/constants/pokemonRank";
import type { DbMove, DbMoveCategory } from "$lib/types/mongo/move";
import type { DbPokemon, DbPokemonMove, DbPokemonRank } from "$lib/types/mongo/pokemon";

type PokemonRole = 'DPS' | 'Tank' | 'Support';
type PokemonArchetype = DbMoveCategory | 'Mixed';

const compareNumber = (x: number, y: number): string => x - y < 0 ? "-1" : x - y > 0 ? "1" : "0";

const mapPokemonToRole: { [key: string]: PokemonRole } = {
    "-1": "DPS",
    "0": "Tank",
    "1": "Tank",
};

const mapPokemonToArchetype: { [key: string]: PokemonArchetype } = {
    "-1": "Physical",
    "0": "Mixed",
    "1": "Special",
};
export const findLowestRankPossible = (pokemon: WithId<DbPokemon>[]) => {
    const movesRankPerPokemon = pokemon.map(p => p.Moves.flatMap(m => m.Learned).sort((a, z) => {
        const aRank = pokemonRankOrder[a];
        const bRank = pokemonRankOrder[z];

        return aRank - bRank;
    })[0]);

    return movesRankPerPokemon.sort((a, z) => {
        const aRank = pokemonRankOrder[a];
        const bRank = pokemonRankOrder[z];

        return bRank - aRank;
    })[0];
}

export const findPokemonArchetype = (pokemon: WithId<DbPokemon>, moveset: WithId<DbMove>[]): [PokemonArchetype, PokemonRole] => {
    const pokemonArchetype = mapPokemonToArchetype[compareNumber(pokemon.MaxSpecial, pokemon.MaxStrength)];

    const damagingMoves = moveset.filter(m => m["Damage1"] !== "");
    const physicalMoves = damagingMoves.filter(m => m.Category === "Physical");
    const specialMoves = damagingMoves.filter(m => m.Category === "Special");
    const averagePower = damagingMoves.reduce((acc, move) => acc + move["Power"], 0) / damagingMoves.length;

    const movesArchetype = mapPokemonToArchetype[compareNumber(specialMoves.length, physicalMoves.length)];

    const dpsPotential = pokemon.MaxDexterity + pokemon.MaxStrength + pokemon.MaxSpecial;
    const tankPotential = pokemon.MaxVitality + pokemon.MaxInsight + pokemon.BaseHP;

    const pokemonRole = damagingMoves.length > moveset.length / 2 && averagePower >= 3 ? "DPS" : mapPokemonToRole[compareNumber(tankPotential, dpsPotential)];

    const randomNumber = Math.random();
    const randomRole = randomNumber < 0.33 ? "Physical" : randomNumber < 0.66 ? "Special" : "Mixed";
    return pokemonArchetype === movesArchetype ? [pokemonArchetype, pokemonRole] : [randomRole, pokemonRole];
}

const findSuitableSetupMove = (role: PokemonRole, moveset: WithId<DbMove>[], maxSize: number): WithId<DbMove>[] => {
    const statChangingMoves = moveset.filter(m => m["AddedEffects"].StatChanges);

    const healingMoves = moveset.filter(m => m["AddedEffects"].Heal);
    const selfBuffMoves = statChangingMoves.filter(m => m["AddedEffects"].StatChanges.some(sc => sc.Stages > 0 && sc.Affects === "User"));
    const debuffMoves = statChangingMoves.filter(m => m["AddedEffects"].StatChanges.some(sc => sc.Stages < 0 && sc.Affects === "Targets"));

    const selfBuffMove = selfBuffMoves[0] ?? pickRandomMoves(moveset, 1)[0];
    const healingMove = healingMoves[0] ?? pickRandomMoves(moveset, 1, [selfBuffMove?.Name ?? ""])[0];
    const debuffMove = debuffMoves[0] ?? pickRandomMoves(moveset, 1, [selfBuffMove?.Name ?? "", healingMove?.Name ?? ""])[0];

    if (role === "DPS") {
        return [selfBuffMove, healingMove, debuffMove].filter(m => m).slice(0, maxSize);
    } else if (role === "Tank") {
        return [healingMove, selfBuffMove, debuffMove].filter(m => m).slice(0, maxSize);
    } else {
        return [debuffMove, healingMove, selfBuffMove].filter(m => m).slice(0, maxSize);
    }
}

const selectSTABMoves = (moveset: WithId<DbMove>[], pokemonTypes: [string, string], amount: number): WithId<DbMove>[] => {
    const isDualType = pokemonTypes[1] !== "";
    const type1Moves = moveset.filter(m => m.Type === pokemonTypes[0]);
    const type2Moves = isDualType ? moveset.filter(m => m.Type === pokemonTypes[1]) : [];

    const selectedMoves: WithId<DbMove>[] = [];
    if (isDualType && type1Moves.length > 0) {
        selectedMoves.push(type1Moves[0]);
    }
    if (isDualType && type2Moves.length > 0) {
        selectedMoves.push(type2Moves[0]);
    }

    const remainingAmount = amount - selectedMoves.length;
    if (remainingAmount > 0) {
        const remainingMoves = [...type1Moves, ...type2Moves].filter(m => !selectedMoves.some(sm => sm.Name === m.Name));
        for (let i = 0; i < remainingAmount && remainingMoves.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * remainingMoves.length);
            selectedMoves.push(remainingMoves[randomIndex]);
            remainingMoves.splice(randomIndex, 1);
        }
    }

    return selectedMoves.slice(0, amount);
}

const buildStrategicMoves = (pokemon: WithId<DbPokemon>, attributes: number[], moveset: WithId<DbMove>[], to: DbPokemonRank, archetype: PokemonArchetype, role: PokemonRole): DbPokemonMove[] => {
    const learnableAmount = attributes[4] + 2;
    const learnableMoveset = getLearnableMoves(pokemon.Moves, to).sort((a, b) => pokemonRankOrder[b["Learned"]] - pokemonRankOrder[a["Learned"]]);
    const learnableMovesetDetails = moveset.filter(m => learnableMoveset.some(lm => lm["Name"] === m["Name"]));

    const damagingMoves = learnableMovesetDetails.filter(m => {
        const doesDamage = m["Damage1"] !== "" || m["AddedEffects"] && m["AddedEffects"]["FixedDamage"];
        const matchArchetype = archetype === "Mixed" ? true : m["Category"] === archetype;
        return doesDamage && matchArchetype;
    }).sort((a, b) => b.Power - a.Power);

    const supportMoves = learnableMovesetDetails.filter(m => m["Category"] === "Support" && m["AddedEffects"]);
    const STABMoves = damagingMoves.filter(m => m.Type === pokemon.Type1 || m.Type === pokemon.Type2);
    const coverageMoves = damagingMoves.filter(m => m.Type !== pokemon.Type1 && m.Type !== pokemon.Type2);

    if (role === 'DPS') {
        const nbrSupportMoves = Math.ceil(learnableAmount / 4);
        const bestSetupMoves = findSuitableSetupMove(role, supportMoves, nbrSupportMoves);

        const nbrOffensiveMoves = learnableAmount - (nbrSupportMoves - (nbrSupportMoves - bestSetupMoves.length));
        const nbrSTABMoves = Math.min(Math.max(2, nbrOffensiveMoves - 1), 3);
        const chosenSTABs = selectSTABMoves(STABMoves, [pokemon.Type1, pokemon.Type2], nbrSTABMoves);

        const nbrCoverageMoves = nbrOffensiveMoves - chosenSTABs.length;
        const chosenCoverages = coverageMoves.filter(m => m.Power >= 2 || m["AddedEffects"] && m["AddedEffects"]["FixedDamage"]).sort(() => Math.random() - 0.5).slice(0, nbrCoverageMoves);

        if (chosenCoverages.length) {
            const finalMoves = [...chosenSTABs.slice(0, nbrOffensiveMoves - 1), ...chosenCoverages, ...bestSetupMoves];
            return learnableMoveset.filter(m => finalMoves.some(fm => fm["Name"] === m["Name"]));
        } else {
            const finalMoves = [...chosenSTABs, ...bestSetupMoves];
            return learnableMoveset.filter(m => finalMoves.some(fm => fm["Name"] === m["Name"]));
        }
    } else {
        const nbrSupportMoves = Math.ceil(learnableAmount / 2);
        const bestSetupMoves = findSuitableSetupMove(role, supportMoves, nbrSupportMoves);

        const nbrOffensiveMoves = learnableAmount - (nbrSupportMoves - (nbrSupportMoves - bestSetupMoves.length));
        const chosenMoves = damagingMoves.slice(0, nbrOffensiveMoves);

        const finalMoves = [...chosenMoves.slice(0, nbrOffensiveMoves), ...bestSetupMoves];
        return learnableMoveset.filter(m => finalMoves.some(fm => fm["Name"] === m["Name"]));
    }

}

const buildRandomMoves = (attributes: number[], moves: DbPokemonMove[], rank: DbPokemonRank): DbPokemonMove[] => {
    const learnableMoveset = getLearnableMoves(moves, rank);
    const learnableAmount = attributes[4] + 2;

    return Array.from({ length: learnableAmount }).reduce((acc: DbPokemonMove[], _) => {
        let possibleLearnset = learnableMoveset.filter((move) => !acc.some((m) => m.Name === move.Name));
        if (possibleLearnset.length === 0) return acc;

        const randomIndex = Math.floor(Math.random() * possibleLearnset.length);
        return [...acc, possibleLearnset[randomIndex]];
    }, []);
}

const buildStrategicSkills = (skills: number[], skillIncrease: number[], moves: WithId<DbMove>[], archetype: string, role: string) => {
    const skillUsage: { [key: string]: number } = moves.reduce((acc, move) => {
        if (move["Accuracy1"] !== "" && PokemonSkills.includes(move["Accuracy1"] as PokemonSkill)) {
            acc[move["Accuracy1"]] = (acc[move["Accuracy1"]] || 0) + 1;
        }

        if (move["Accuracy2"] !== "" && PokemonSkills.includes(move["Accuracy2"] as PokemonSkill)) {
            acc[move["Accuracy2"]] = (acc[move["Accuracy2"]] || 0) + 1;
        }
        return acc;
    }, {} as { [key: string]: number });

    /* @TODO: fine tune depending on role */
    const skillWeights: number[] = PokemonSkills.map(skill => {
        const usageCount = skillUsage[skill] || 0;
        const isAlert = skill === 'Alert';
        const isEvasionClash = skill === 'Evasion' || skill === 'Clash';
        return usageCount > 0 ? usageCount : isEvasionClash ? 0.1 : isAlert ? 0.15 : 0.0;
    });

    const totalWeight = skillWeights.reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = skillWeights.map(weight => weight / totalWeight);

    if (archetype === 'Physical') {
        normalizedWeights[PokemonSkills.indexOf('Brawl')] += 0.2;
    } else if (archetype === 'Special') {
        normalizedWeights[PokemonSkills.indexOf('Channel')] += 0.2;
    } else {
        normalizedWeights[PokemonSkills.indexOf('Brawl')] += 0.1;
        normalizedWeights[PokemonSkills.indexOf('Channel')] += 0.1;
    }

    if (role === 'Tank') {
        normalizedWeights[PokemonSkills.indexOf('Clash')] += 0.3;
        normalizedWeights[PokemonSkills.indexOf('Evasion')] += 0.3;
    }

    skillIncrease.forEach((points, n) => {
        let remainingPoints = points;
        let currentWeights: number[] = normalizedWeights;

        while (remainingPoints > 0) {
            const highestWeightIndex = currentWeights.findIndex(weight => weight === Math.max(...currentWeights));
            if (skills[highestWeightIndex] < n + 1) {
                skills[highestWeightIndex]++;
                remainingPoints--;
                currentWeights = currentWeights.with(highestWeightIndex, -1);
            }
        }
    });

    return skills;
}

const buildRandomSkills = (skills: number[], skillIncrease: number[]): number[] => {
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

    return skills;
}

const buildRandomSocials = (socials: number[], socIncrease: number): number[] => {
    let remainingSoc = socIncrease;

    while (remainingSoc > 0) {
        const randomIndex = Math.floor(Math.random() * 5);
        if (socials[randomIndex] < 5) {
            socials[randomIndex]++;
            remainingSoc--;

            if (socials.every(s => s === 5)) return socials;
        }
    }

    return socials;
}

const buildStrategicAttributes = (attributes: number[], attrReferences: number[][], attrIncrease: number, archetype: PokemonArchetype, role: PokemonRole): number[] => {
    const statRatios = attrReferences.map(([baseStat, maxStat]) => baseStat / maxStat);

    const roleWeights: number[] = [
        { build: role === 'DPS' && archetype === 'Physical', weight: [0.45, 0.3, 0.1, 0.0, 0.15] },
        { build: role === 'DPS' && archetype === 'Special', weight: [0.0, 0.3, 0.1, 0.45, 0.15] },
        { build: role === 'DPS' && archetype === 'Mixed', weight: [0.1, 0.3, 0.1, 0.3, 0.2] },
        { build: role === 'Tank' && archetype === 'Physical', weight: [0.15, 0.05, 0.4, 0.0, 0.4] },
        { build: role === 'Tank' && archetype === 'Special', weight: [0.0, 0.05, 0.4, 0.15, 0.4] },
        { build: role === 'Tank' && archetype === 'Mixed', weight: [0.1, 0.1, 0.4, 0.1, 0.3] },
    ].find(({ build }) => build === true)?.weight ?? [0.2, 0.2, 0.2, 0.2, 0.2];

    const combinedWeights = statRatios.map((ratio, i) => ratio + roleWeights[i]);
    const totalWeight = combinedWeights.reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = combinedWeights.map(weight => weight / totalWeight);

    const distributedPoints = attributes.slice();
    let remainingPoints = attrIncrease;

    normalizedWeights.forEach((weight, index) => {
        const allocatedPoints = Math.min(Math.floor(weight * attrIncrease), attrReferences[index][1]);
        distributedPoints[index] += allocatedPoints;
        remainingPoints -= allocatedPoints;
    });

    while (remainingPoints > 0) {
        const maxWeightIndex = normalizedWeights.filter((n, i) => distributedPoints[i] < attrReferences[i][1]).indexOf(Math.max(...normalizedWeights));
        distributedPoints[maxWeightIndex]++;
        remainingPoints--;
    }

    return distributedPoints;
}

const buildRandomAttributes = (attributes: number[], attrReferences: number[][], attrIncrease: number): number[] => {
    let remainingAttr = attrIncrease;

    while (remainingAttr > 0) {
        const randomIndex = Math.floor(Math.random() * 5);
        if (attributes[randomIndex] < attrReferences[randomIndex][1]) {
            attributes[randomIndex]++;
            remainingAttr--;
        }
    }

    return attributes;
}

export const generatePokemon = (pokemon: WithId<DbPokemon>, moveset: WithId<DbMove>[], rank: number, nature: string, boxId: string, isStrategic: boolean = false) => {
    const successiveRankUps = rankUpSettings.slice(0, rank + 1);
    const attrIncrease = successiveRankUps.reduce((acc, rankup) => acc + rankup.config.attributePoints, 0);
    const socIncrease = successiveRankUps.reduce((acc, rankup) => acc + rankup.config.socialPoints, 0);
    const skillIncrease = successiveRankUps.map((rankup) => rankup.config.skillPoints);

    const [archetype, role] = findPokemonArchetype(pokemon, moveset);

    const attrReferences = [
        [pokemon.Strength, pokemon.MaxStrength],
        [pokemon.Dexterity, pokemon.MaxDexterity],
        [pokemon.Vitality, pokemon.MaxVitality],
        [pokemon.Special, pokemon.MaxSpecial],
        [pokemon.Insight, pokemon.MaxInsight],
    ];

    const attributes = pokemon.Legendary ? Array.from({ length: 5 }, (_, i) => attrReferences[i][0]) : isStrategic ?
        buildStrategicAttributes(Array.from({ length: 5 }, (_, i) => attrReferences[i][0]), attrReferences, attrIncrease, archetype, role) :
        buildRandomAttributes(Array.from({ length: 5 }, (_, i) => attrReferences[i][0]), attrReferences, attrIncrease);

    const socials = buildRandomSocials(Array.from({ length: 5 }, (_) => 1), socIncrease);

    const moves = isStrategic ?
        buildStrategicMoves(pokemon, attributes, moveset, rankUpSettings[rank].to, archetype, role) :
        buildRandomMoves(attributes, pokemon.Moves, rankUpSettings[rank].to);

    const chosenMoveDetails = getLearnableMovesData(moveset, moves, rankUpSettings[rank].to);
    const skills = isStrategic ?
        buildStrategicSkills(Array.from({ length: PokemonSkills.length }, (_) => 0), skillIncrease, chosenMoveDetails, archetype, role) :
        buildRandomSkills(Array.from({ length: PokemonSkills.length }, (_) => 0), skillIncrease);

    console.log(`[GENERATING NEW POKEMON] - ${pokemon.Name} - ${rankUpSettings[rank].to} ${role} ${archetype}`);
    console.log(`------ ATTRIBUTES ------\n${attributes.map((attr, i) => `${attrReferences[i][0]} -> ${attr} (+${attr - attrReferences[i][0]})/${attrReferences[i][1]}`).join('\n')}`);
    console.log(`------ SOCIALS ------\n${socials.map((soc, i) => `${soc} (${i + 1})`).join('\n')}`);
    console.log(`------ MOVES ------\n${moves.map((move, i) => `${i + 1}. ${move.Name} (${move.Learned})`).join('\n')}`);
    console.log(`------ SKILLS ------\n${skills.map((skill, i) => `${PokemonSkills[i]}: ${skill}`).join('\n')}`);

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