<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	console.log('x');
</script>

<div>
	{#each data.all_studios as studio, i}
		<a href="/studios/{studio.studio_id}">{studio.studio_name}</a>
		<br />
	{/each}
</div>
