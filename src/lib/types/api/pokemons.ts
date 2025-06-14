import type { WithId } from "mongodb";

import type { DbMove } from "../mongo/move";
import type { DbPokemon } from "../mongo/pokemon";

export type SpeciesAndMoves = { species: WithId<DbPokemon>[]; moves: WithId<DbMove>[] };