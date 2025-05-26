import { ageConfigs } from "$lib/constants/ageConfigs";

export const getAgeConfigFromAge = (age: number) => {
    return ageConfigs.filter(config => age >= config.age).at(-1) ?? ageConfigs[0];
}