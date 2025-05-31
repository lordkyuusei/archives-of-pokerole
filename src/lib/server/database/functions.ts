import type { WithId } from "mongodb";
import { mongo } from "./mongodb";
import type { DbMove } from "$lib/types/mongo/move";
import type { DbNature } from "$lib/types/mongo/nature";
import type { DbAbility } from "$lib/types/mongo/ability";
import { type DbPokemon, type DbPokemonMove } from "$lib/types/mongo/pokemon";

export const generatePokemon = async (types: string[], ranks: string[], isEvolved: boolean, isStarter: boolean): Promise<DbPokemon[]> => {
    // Step 1: Query the database for Pokémon matching the types
    const query: any = {
        $or: [{ Type1: { $in: types } }, { Type2: { $in: types } }],
    };

    // Step 2: Add conditions for evolution if isEvolved is true
    if (isEvolved) {
        query["Evolutions.From"] = { $exists: true };
    }

    // Step 3: Add condition for starter Pokémon if isStarted is true
    if (isStarter) {
        query.GoodStarter = true;
    }

    // Step 4: Fetch matching Pokémon from the database
    const collection = mongo.collection<DbPokemon>("Pokedex");
    const matchingPokemon = await collection.find(query).toArray();

    // Step 5: Randomly shuffle the results and return up to 10 Pokémon
    const shuffledPokemon = matchingPokemon.sort(() => Math.random() - 0.5);
    return shuffledPokemon.slice(0, 10);
}

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
    await mongo.collection<DbPokemon>("Pokedex").find({ DexID: { $not: /[(FM)]/ } }, { projection: { _id: 1, Name: 1, Number: 1, DexID: 1 } }).sort({ DexID: 1 }).toArray();

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
    await mongo.collection<DbPokemon>("Pokedex").find({
        $or: [
            { "Ability1": ability["Name"] },
            { "Ability2": ability["Name"] },
            { "HiddenAbility": ability["Name"] },
        ]
    }).toArray();