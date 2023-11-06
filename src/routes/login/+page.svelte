<script lang="ts">
	import { login, AUTH0_CONTEXT_CLIENT_PROMISE } from '@dopry/svelte-auth0';
	import { getContext } from 'svelte';

	const auth0Promise = getContext(AUTH0_CONTEXT_CLIENT_PROMISE) as any;
	login(auth0Promise, true, 'http://localhost:5173');
</script>
