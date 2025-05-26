<script lang="ts">
    let { value } = $props();
</script>

<li>
    <a href="/nature/{value['_id']}">
        <span class="name">
            {value['Name']}
        </span>
        <span class="confidence">
            {value['Confidence']}
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
