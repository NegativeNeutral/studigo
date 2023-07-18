<script lang="ts">
  import auth from '$lib/helpers/auth/auth';
  import type { Auth0Client } from '@auth0/auth0-spa-js';
  import { onMount } from 'svelte';
  import { isAuthenticated, user } from '$lib/Store';

  import type { PageData } from './$types';
	export let data: PageData;

  async function login(auth0Client: Auth0Client) {
    await auth.login_with_popup(auth0Client);
  }

  onMount(async () => {
    const auth0Client = await auth.create_client(data.auth0_domain, data.auth0_client_id);
    console.log("Logging in...")
    await login(auth0Client);
    console.log("Popup closed")
    isAuthenticated.set(await auth0Client.isAuthenticated());
    const USER = await auth0Client.getUser() as object
    user.set(USER);
  });
</script>
