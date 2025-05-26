<script lang="ts">
    import { onMount } from 'svelte';
    import { getLang, updateLang, type Lang } from '$lib/i18n/lang.svelte';
    import Toggle from '../fragments/Toggle.svelte';

    let lang: Lang = $derived(getLang());

    onMount(() => {
        const mapUserLangToLang: Array<{ match: boolean; lang: Lang }> = [
            { match: navigator.language.includes('fr'), lang: 'fr' },
            { match: navigator.language.includes('en'), lang: 'en' },
            { match: true, lang: 'en' },
        ];

        const match = mapUserLangToLang.find((x) => x.match === true);
        if (match) {
            updateLang(match.lang);
        }
    });
</script>

<div style:display="inline flex">
    <label id="lang-switch" for="lang-switch">{lang}</label>
    <Toggle toggled={lang === 'en'} onToggle={(value) => updateLang(value ? 'en' : 'fr')}></Toggle>
</div>

<style>
    #lang-switch {
        text-transform: capitalize;
        border-radius: var(--border-r-50);
        margin-right: var(--small-gap);

        @media (max-width: 640px) {
            height: calc(100% - var(--smallest-gap));
        }
    }
</style>
