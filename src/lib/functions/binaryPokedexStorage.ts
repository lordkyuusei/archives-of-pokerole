import type { WithId } from "mongodb";
import { PokemonStudyState } from "$lib/types/mongo/trainer";

export const createBitfield = (numForms: number) => {
    const totalBits = numForms * 2;
    const totalBytes = Math.ceil(totalBits / 8);
    return new Uint8Array(totalBytes);
}

export const setPokemonStatus = (bitfield: Uint8Array, index: number, status: PokemonStudyState): Uint8Array => {
    const bitIndex = index * 2;
    const byteIndex = bitIndex >> 3;
    const shift = bitIndex % 8;
    bitfield[byteIndex] &= ~(0b11 << shift);
    bitfield[byteIndex] |= (status & 0b11) << shift;

    return bitfield;
}

export const getPokemonStatus = (bitfield: Uint8Array, index: number) => {
    const bitIndex = index * 2;
    const byteIndex = bitIndex >> 3;
    const shift = bitIndex % 8;
    return (bitfield[byteIndex] >> shift) & 0b11;
}

export const getNbrPokemonStatus = (base64: string | null, species: WithId<{ Name: string; }>[]) => {
    const pokedex = fromBase64(base64, species.length);
    const [seen, caught] = species.reduce(([currentSeen, currentCaught], _, index) => {
        const status = getPokemonStatus(pokedex, index);
        if (status === PokemonStudyState.Seen) return [currentSeen + 1, currentCaught];
        if (status === PokemonStudyState.Caught) return [currentSeen + 1, currentCaught + 1];
        return [currentSeen, currentCaught];
    }, [0, 0]);

    return [seen, caught];
}

export const toBase64 = (bitfield: Uint8Array) => btoa(String.fromCharCode(...bitfield));

export const fromBase64 = (base64: string | null, numForms: number) => {
    if (!base64) return createBitfield(numForms);

    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
}
