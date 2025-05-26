import POKEMON_TYPES from "$lib/constants/pokemonTypes";

export const getPkmnTypeColor = (type: string) => {
    const [h, s, l] = POKEMON_TYPES.find(t => t.name === type)?.color || [];
    return `hsl(${h}, ${s}%, ${l}%)`;
}

export const drawBookBackground = (types: string[] = []): string => {
    if (types.length) {
        const [fHsl, sHsl] = types.map(
            (type) => POKEMON_TYPES.find((t) => t.name === type)?.color || []
        );

        return types[1] && sHsl
            ? `linear-gradient(to right, hsl(${fHsl[0]}, ${fHsl[1]}%, ${fHsl[2]}%) 25%, hsl(${sHsl[0]}, ${sHsl[1]}%, ${sHsl[2]}%) 75%)`
            : `linear-gradient(to right, hsl(${fHsl[0]}, ${fHsl[1]}%, ${fHsl[2]}%) 25%, hsl(${fHsl[0]}, ${fHsl[1]}%, ${fHsl[2]}%) 35%)`;
    }
    return "";
};