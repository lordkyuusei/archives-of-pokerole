<script lang="ts">
    import { GET_USERS, POST_USERS } from '$lib/constants/api';
    import { SAVE_DEBOUNCE_DELAY } from '$lib/constants/storage';
    import { getBoxes, setBoxes } from '$lib/state/boxes.svelte';
    import { getPokemons, setPokemonParty } from '$lib/state/pokemon.svelte';
    import { getSettings, setSettings } from '$lib/state/settings.svelte';
    import { getTrainer, setTrainer } from '$lib/state/trainer.svelte';
    import type { Settings } from '$lib/types/meta/settings';
    import Toggle from '../fragments/Toggle.svelte';

    let settings: Settings | undefined = $derived(getSettings());

    let isEnabled: boolean = $derived(settings?.isEnabled ?? false);
    let username: string = $derived(settings?.username ?? '');
    let userKey: string = $derived(settings?.userkey ?? '');

    let outputContent: string | null = $state(null);

    const updateDataToCloud = async () => {
        if (!settings) return;

        outputContent = 'Synchronizing...';

        const body = JSON.stringify({
            username,
            userKey,
            content: {
                team: getPokemons(),
                trainer: getTrainer(),
                boxes: getBoxes(),
            },
        });

        const result = await fetch(`${POST_USERS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });

        const { success, message } = await result.json();

        setSettings({
            ...settings,
            username,
        });
        outputContent = success ? 'Synchronization successful!' : `Error: ${message}`;
    };

    const syncLocalWithCloud = async () => {
        if (!settings) return;

        // execute a GET request from GET_USERS endpoint and send username and userkey as credentials in the header
        outputContent = 'Synchronizing...';
        const result = await fetch(`${GET_USERS}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Username: username,
                UserKey: userKey,
            },
        });

        const { success, message, data } = await result.json();

        if (success) {
            outputContent = 'Synchronized! Reloading the page...';

            const { team, trainer, boxes } = data;

            setPokemonParty(team);
            setTrainer(trainer);
            setBoxes(boxes);

            setTimeout(() => {
                window.location.reload();
            }, SAVE_DEBOUNCE_DELAY * 3);
        } else {
            outputContent = `Error: ${message}`;
        }
    };
</script>

<form>
    {#if settings}
        <fieldset>
            <legend>Synchronization</legend>
            <label for="sync-status">Enable Sync</label>
            <Toggle name="sync-status" bind:toggled={isEnabled}></Toggle>
            <label for="sync-key">Username</label>
            <input type="text" placeholder="pkmn-trainer-54" bind:value={username} disabled={!isEnabled} />
            <label for="sync-key">UserKey</label>
            <input type="password" placeholder="poire-belle-helene" bind:value={userKey} disabled={!isEnabled} />
            <button class="primary" disabled={!isEnabled} onclick={updateDataToCloud}>➡️ Send local to cloud</button>
            <button class="primary" disabled={!isEnabled} onclick={syncLocalWithCloud}>⬅️ Sync local with cloud</button>
            <button class="primary" onclick={updateDataToCloud}>❌ Delete remote data</button>
        </fieldset>
        <fieldset>
            <legend>Sync Status</legend>
            <output>
                {outputContent ? outputContent : 'No synchronization status yet.'}
            </output>
        </fieldset>
    {/if}
</form>

<style>
    form {
        & > fieldset {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: 1fr;
            align-items: center;
            gap: var(--large-gap) var(--medium-gap);
            width: 100%;

            & > button {
                grid-column: 1 / -1;
            }
        }
    }
</style>
