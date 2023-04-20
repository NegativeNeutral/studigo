<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let google_auth_url = data.google_auth_url;
</script>

<a href={google_auth_url}>Sign into Google!</a>
