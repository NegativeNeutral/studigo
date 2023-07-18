<script lang="ts">
  import auth from '$lib/helpers/auth/auth';
  import type { Auth0Client } from '@auth0/auth0-spa-js';
  import { onMount } from 'svelte';
  import { isAuthenticated, user } from '$lib/Store';

  import type { PageData } from './$types';
	export let data: PageData;
  
  async function logout(auth0Client: Auth0Client) {
    await auth.logout(auth0Client);
  }

  onMount(async () => {
    const auth0Client = await auth.create_client(data.auth0_domain, data.auth0_client_id);
    console.log("Logging out...")
    await logout(auth0Client);
    console.log("Popup closed")
    isAuthenticated.set(await auth0Client.isAuthenticated());
    user.set(await auth0Client.getUser() as object);
  });
</script>
