import { SAVE_DEBOUNCE_DELAY } from "$lib/constants/storage";
import type { Trainer } from "$lib/types/mongo/trainer";
import { Tween } from "svelte/motion";

let debounce: { [key: string]: NodeJS.Timeout | null } = {};
let isSaving: boolean = $state(false);

export const getSavingState = () => isSaving;

export const getStorage = (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

export const getStorageOrDefault = <T>(key: string, defaultValue: T): T => {
    const value = getStorage(key);
    return value !== null ? value as T : defaultValue;
}

export const setStorage = (key: string, value: any) => {
    if (debounce[key] !== null) clearTimeout(debounce[key]);

    isSaving = true;
    debounce[key] = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(value));
        isSaving = false;
        console.log('saved', key);
    }, SAVE_DEBOUNCE_DELAY)
}