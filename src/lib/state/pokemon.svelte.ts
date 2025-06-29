import type { DbMove } from "$lib/types/mongo/move";
import type { DbPartnerPokemon, DbPokemon } from "$lib/types/mongo/pokemon";
import type { WithId } from "mongodb";
import { setStorage } from "./storage.svelte";
import { KEY_TEAM } from "$lib/constants/storage";

let pokemon: DbPartnerPokemon | null = $state(null);
let pokemons: DbPartnerPokemon[] = $state([]);

let specie: WithId<DbPokemon> | null = $state(null);
let species: WithId<DbPokemon>[] = $state([]);

let moves: WithId<DbMove>[] = $state([]);
let pkmnMoves: WithId<DbMove>[] = $state([]);

export const getPokemon = () => pokemon;
export const getPokemons = () => pokemons;

export const getSpecie = () => specie
export const getSpecies = () => species;

export const getMoves = () => moves;
export const getPkmnMoves = () => pkmnMoves;

export const setSelectedPokemon = (newPokemon: DbPartnerPokemon | null) => {
    pokemon = newPokemon;
}

export const setPokemon = (newPokemon: DbPartnerPokemon) => {
    pokemon = newPokemon;
    if (!pokemon) return;

    updatePokemonInParty(pokemon);
}

export const setPokemonProperty = <T extends keyof DbPartnerPokemon>(property: T, value: DbPartnerPokemon[T]) => {
    if (pokemon) {
        pokemon = { ...pokemon, [property]: value };
        updatePokemonInParty(pokemon);
    }
}

export const setPokemonParty = (newPokemons: DbPartnerPokemon[]) => {
    pokemons = newPokemons;
    setStorage(KEY_TEAM, pokemons);
}

export const updatePokemonInParty = (updatedPokemon: DbPartnerPokemon) => {
    const pokemonIndex = pokemons.findIndex(p => p.id === updatedPokemon.id);
    if (pokemonIndex === -1) return;

    pokemons = pokemons.with(pokemonIndex, updatedPokemon);
    setStorage(KEY_TEAM, pokemons);
}

export const setSpecie = (newSpecie: WithId<DbPokemon> | null) => {
    specie = newSpecie;
}

export const setSpecies = (newSpecies: WithId<DbPokemon>[]) => {
    species = newSpecies;
}

export const setMoves = (newMoves: WithId<DbMove>[]) => {
    moves = newMoves;
}

export const setPkmnMoves = (newPkmnMoves: WithId<DbMove>[]) => {
    pkmnMoves = newPkmnMoves;
}

export const addPokemonToParty = (newPokemon: DbPartnerPokemon) => {
    pokemons = [...pokemons, newPokemon];
    setStorage(KEY_TEAM, pokemons);
}

export const removePokemonFromParty = (pokemon: DbPartnerPokemon) => {
    const index = pokemons.findIndex(p => p.id === pokemon.id);
    pokemons = pokemons.toSpliced(index, 1);
    setStorage(KEY_TEAM, pokemons);
}