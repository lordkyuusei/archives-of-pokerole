import { ThreegleState } from "$lib/constants/threegle";
import type { DbAbility } from "$lib/types/mongo/ability";
import { type DbItem } from "$lib/types/mongo/item";
import type { DbMove } from "$lib/types/mongo/move";
import type { DbNature } from "$lib/types/mongo/nature";
import { type DbPokemon } from "$lib/types/mongo/pokemon";
import type { WithId } from "mongodb";
import { mongo } from "./mongodb";

const updatePokemonData = (pokemonList: WithId<DbPokemon>[], pokemonListWithTranslations: any[]) => {
    const getFrenchMegaWord = (id: number) => {
        return [382, 383].includes(id) ? 'Primo-' : 'Méga-';
    }

    const getFrenchFormWord = (pkmn: DbPokemon) => {
        const parenthesisIndex = pkmn.Name.indexOf('(');
        const spaceIndex = pkmn.Name.indexOf('Form', parenthesisIndex);
        return pkmn.Name.substring(parenthesisIndex + 1, spaceIndex - 1);
    }


    return pokemonList.map((pokemon) => {
        const match = pokemonListWithTranslations.find(dex => dex.id === pokemon.Number);
        if (!match) {
            console.log(`No match found for Pokemon Number ${pokemon.Number}`);
            return { pokemon, I18n: { fr: '???', en: pokemon.Name } };
        }
        else {
            const frTranslation =
                pokemon.DexID.includes('M') ? `${getFrenchMegaWord(pokemon.Number)}${match.i18n.fr}` :
                    pokemon.DexID.includes('F') ? `${match.i18n.fr} (Forme ${getFrenchFormWord(pokemon)})` :
                        pokemon.DexID.includes('A') ? `${match.i18n.fr} d'Alola'` :
                            pokemon.DexID.includes('G') ? `${match.i18n.fr} de Galar` :
                                pokemon.DexID.includes('H') ? `${match.i18n.fr} de Hisui` : match.i18n.fr;

            const enTranslation = pokemon.Name;

            return {
                ...pokemon,
                I18n: {
                    fr: frTranslation,
                    en: enTranslation
                }
            }
        }
    })
}

export const generatePokemon = async (types: string[], ranks: string[], isEvolved: ThreegleState, isStarter: ThreegleState, isLegendary: ThreegleState): Promise<{ pokemon: WithId<DbPokemon>[], moves: WithId<DbMove>[] }> => {
    let query: any = {};

    if (types[0] !== "Typeless") {
        query = {
            $or: [{ Type1: { $in: types } }, { Type2: { $in: types } }],
        };
    }

    if (isEvolved !== ThreegleState.NA) {
        query["Evolutions.From"] = { $exists: isEvolved === ThreegleState.ON };
        /* Prevent Evolutions.Kind to be either Mega or Special.*/
        query["Evolutions.Kind"] = { $nin: ['Mega', 'Special', 'Form'] };
    }

    if (isStarter !== ThreegleState.NA) {
        query.GoodStarter = isStarter === ThreegleState.ON;
    }

    if (isLegendary !== ThreegleState.NA) {
        query.Legendary = isLegendary === ThreegleState.ON;
    }

    const collection = mongo.collection<DbPokemon>("Pokedex");
    const matchingPokemon = await collection.find(query).toArray();
    const shuffledPokemon = matchingPokemon.sort(() => Math.random() - 0.5).slice(0, 10);

    const pokemonMoves = await getMovesFromPokemon(shuffledPokemon.flatMap(p => p.Moves.map(m => m.Name)));
    return { pokemon: shuffledPokemon, moves: pokemonMoves };
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

export const searchDatabaseMult = async (pokemonSearchText: string, movesSearchText: string) => {
    const speciesList = pokemonSearchText.split(',');
    const movesList = movesSearchText.split(',');

    const species = await findMultInDatabase(speciesList, "Pokedex") as unknown as WithId<DbPokemon>[];
    const knownMoves = await findMultInDatabase(movesList, "Moves") as unknown as WithId<DbMove>[];

    const allMoves = [...new Set([
        ...species.flatMap(p => p.Moves.map(m => m.Name)),
        ...knownMoves.flatMap(m => m.Name)
    ])];

    const moves = await getMovesFromPokemon(allMoves);

    return { species, moves };
}

export const findInDatabase = async (searchText: string) => {
    const collections = await mongo.listCollections().toArray();

    const results = collections.map(async (collection) => {
        const { name } = collection;
        const collectionData = await mongo.collection(name).find({
            $or: [
                { "Name": { $regex: searchText, $options: "i" } },
                { "I18n.fr": { $regex: searchText, $options: "i" } },
                { "I18n.en": { $regex: searchText, $options: "i" } }
            ]
        }).toArray();
        return { name, results: collectionData };
    });

    return Promise.all(results);
}

export const findMultInDatabase = async (searchArray: string[], collection: string) => {
    return await mongo.collection(collection).find({ "_id": { $in: searchArray } }).toArray();
}

export const getNaturesFromDb = async () =>
    await mongo.collection<DbNature>("Natures").find().toArray();

export const getAllItemsFromDb = async () =>
    await mongo.collection<DbItem>("Items").find().toArray();

export const getAllPokemonFromDb = async () =>
    await mongo.collection<DbPokemon>("Pokedex").find({ DexID: { $not: /[(FM)]/ } }, { projection: { _id: 1, Name: 1, Number: 1, DexID: 1, I18n: 1 } }).sort({ DexID: 1 }).toArray();

export const getAllMovesFromDb = async () =>
    await mongo.collection<DbPokemon>("Moves").find().sort().toArray();

export const getPokemonFromDb = async (pokemon: string) =>
    await mongo.collection<DbPokemon>("Pokedex").findOne({ _id: pokemon });

export const getMoveFromDb = async (move: string) =>
    await mongo.collection<DbMove>("Moves").findOne({ _id: move });

export const getItemFromDb = async (item: string) =>
    await mongo.collection<DbItem>("Items").findOne({ _id: item });

export const getLearnersFromDb = async (move: DbMove) =>
    await mongo.collection<DbPokemon>("Pokedex").find({ "Moves.Name": move.Name }).toArray();

export const getMovesFromPokemon = async (moves: string[]) =>
    await mongo.collection<DbMove>("Moves").find({ "Name": { $in: moves } }).toArray();

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