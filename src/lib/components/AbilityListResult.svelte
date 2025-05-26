<script lang="ts">
    let { value } = $props();
</script>

<li>
    <a href="/abilities/{value['_id']}" data-sveltekit-reload>
        <span class="name">
            {value['Name']}
        </span>
    </a>
</li>

<style>
    li {
        padding: var(--medium-gap);
        border-radius: var(--medium-gap);
        
        & > a {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
            gap: var(--large-gap);
        }
    }
</style>
