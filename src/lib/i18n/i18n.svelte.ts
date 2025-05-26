import { getLang } from "./lang.svelte";

import i18nEn from "./en.json";
import i18nFr from "./fr.json";

let lang: Lang = $derived(getLang());
const translations = $derived(lang === 'fr' ? i18nFr : i18nEn);
const translation = $derived((key: string): string => translations[key] ?? key);

export default (key: string) => translation(key);