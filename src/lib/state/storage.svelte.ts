import type { Trainer } from "$lib/types/mongo/trainer";
import { Tween } from "svelte/motion";

let debounce: NodeJS.Timeout | null = null;
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
    if (debounce) clearTimeout(debounce);

    isSaving = true;
    debounce = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(value));
        isSaving = false;
    }, 500)
}