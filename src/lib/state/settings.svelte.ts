import type { Settings } from "$lib/types/meta/settings";
import { setStorage } from "./storage.svelte";

let settings: Settings | undefined = $state();

export const getSettings = () => settings;
export const setSettings = (newSettings: Settings) => {
    settings = newSettings;
    setStorage('settings', settings);
} 