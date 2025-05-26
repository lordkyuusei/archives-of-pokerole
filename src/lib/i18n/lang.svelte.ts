export type Lang = "en" | "fr";

let lang: Lang = $state('en');
const getLang = () => lang;
const updateLang = (newLang: Lang) => lang = newLang;

export { getLang, updateLang };