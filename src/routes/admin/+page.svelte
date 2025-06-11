<script lang="ts">
    import type { PageProps } from './$types';
</script>

<section class="wrapper" id="admin"></section>

<style>
    section#admin {
        grid-column: 1 / -1;

        height: 100%;
        overflow-y: auto;
        display: grid;
        grid-template: auto 1fr / 1fr 1fr;

        & > h1 {
            grid-row: 1;
        }

        & > ul {
            height: 100%;
            overflow-y: auto;
            grid-row: 2;
        }
    }
</style>
