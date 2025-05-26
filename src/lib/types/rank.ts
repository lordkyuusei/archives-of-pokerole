import type { DbPokemonRank } from "./mongo/pokemon";

export type RankUpConfig = {
    attributePoints: number;
    socialPoints: number;
    skillPoints: number;
    skillLimit: number;
    attributeOverload: number;
}

export type RankUpSetting = {
    to: DbPokemonRank,
    from: DbPokemonRank,
    config: RankUpConfig,
}