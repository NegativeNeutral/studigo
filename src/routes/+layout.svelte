<script lang="ts">
	import Header_bar from '$lib/components/header_bar/header_bar.svelte';
	import { Auth0Context } from '@dopry/svelte-auth0';
</script>

<!-- TODO: Use variables from .env here -->

<Auth0Context domain="studigo.uk.auth0.com" client_id="2R8Fesvk5h49u1Sze2HArUOXPexu7CRG">
	<Header_bar />
	<slot />
</Auth0Context>

