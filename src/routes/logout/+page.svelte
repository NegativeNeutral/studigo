<script lang="ts">
	import { logout, AUTH0_CONTEXT_CLIENT_PROMISE } from '@dopry/svelte-auth0';
	import { getContext } from 'svelte';

	const auth0Promise = getContext(AUTH0_CONTEXT_CLIENT_PROMISE) as any;
	logout(auth0Promise, 'http://localhost:5173');
</script>
