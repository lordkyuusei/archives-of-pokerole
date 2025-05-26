<script lang="ts">
    let { value } = $props();
</script>

<li>
    <a href="/item/{value['_id']}">
        <span class="name">
            {value['Name']}
        </span>
        <span class="pocket">
            {value['Pocket']}
        </span>
        <span class="category">
            {value['Category']}
        </span>
    </a>
</li>

<style>
    li {
        padding: var(--medium-gap);
        border-radius: var(--medium-gap);
        
        & > a {
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
            gap: var(--large-gap);
        }
    }
</style>
