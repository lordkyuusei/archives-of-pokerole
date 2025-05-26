import type { WithId } from "mongodb";
import { mongo } from "./mongodb";
import type { DbMove } from "$lib/types/mongo/move";
import type { DbNature } from "$lib/types/mongo/nature";
import type { DbAbility } from "$lib/types/mongo/ability";
import { type DbPokemon, type DbPokemonMove } from "$lib/types/mongo/pokemon";

export const searchDatabase = async (searchText: string) => {
    const tokens = searchText.split(" ");
    const modifiersTokens = tokens.map((token, i) => token.startsWith('@') ? i : -1).filter(i => i !== -1);

    const searchPairs = modifiersTokens.map((index) => ({
        key: tokens[index].slice(1),
        value: tokens[index + 1]
    }));

    if (searchPairs.length === 0) return await findInDatabase(searchText);
    return await Promise.resolve([]);
}

export const searchDatabaseMult = async (searchText: string) => {
    const speciesList = searchText.split(',');
    const species = await findMultInDatabase(speciesList, "Pokedex") as unknown as WithId<DbPokemon>[];

    const movesList = [...new Set(species.map(p => p.Moves).flat())];
    const moves = await getMovesFromPokemon(movesList);

    return { species, moves };
}

export const findInDatabase = async (searchText: string) => {
    const collections = await mongo.listCollections().toArray();

    const results = collections.map(async (collection) => {
        const { name } = collection;
        const collectionData = await mongo.collection(name).find({ "Name": { $regex: searchText, $options: "i" } }).toArray();
        return { name, results: collectionData };
    });

    return Promise.all(results);
}

export const findMultInDatabase = async (searchArray: string[], collection: string) => {
    return await mongo.collection(collection).find({ "_id": { $in: searchArray } }).toArray();
}

export const getNaturesFromDb = async () => 
    await mongo.collection<DbNature>("Natures").find().toArray();

export const getAllPokemonFromDb = async () =>
    await mongo.collection<DbPokemon>("Pokedex").find({ DexID: { $not: /[(FM)]/ } }, { projection: { _id: 1, Name: 1, Number: 1, DexID: 1 } }).sort({ DexID: 1}).toArray();

export const getPokemonFromDb = async (pokemon: string) => 
    await mongo.collection<DbPokemon>("Pokedex").findOne({ _id: pokemon });

export const getMoveFromDb = async (move: string) => 
    await mongo.collection<DbMove>("Moves").findOne({ _id: move });

export const getLearnersFromDb = async (move: DbMove) => 
    await mongo.collection<DbPokemon>("Pokedex").find({ "Moves.Name": move.Name }).toArray();

export const getMovesFromPokemon = async (moves: DbPokemonMove[]) => 
    await mongo.collection<DbMove>("Moves").find({ "Name": { $in: moves.map(m => m.Name) } }).toArray();

export const getAbilityFromDb = async (ability: string) => 
    await mongo.collection<DbAbility>("Abilities").findOne({ "_id": ability });

export const getAbilityLearnersFromDb = async (ability: DbAbility) => 
    await mongo.collection<DbPokemon>("Pokedex").find({ $or: [
        { "Ability1": ability["Name"] },
        { "Ability2": ability["Name"] },
        { "HiddenAbility": ability["Name"] },
    ] }).toArray();