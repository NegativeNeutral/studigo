<script lang="ts">
  import { isAuthenticated, user } from '$lib/Store';
</script>

<nav>
	<a href="/">StudiGo</a>

	{#if $isAuthenticated}
			<a href="/logout">Logout</a>
			{#if $user.picture}
			<img src={$user.picture} alt={user.name} style="max-width: 50px; max-height: 50px; border-radius: 100%;" />
			{:else}
			<p>Hey, {$user.name}</p>
			{/if}
	{:else}
		<a href="/login">Login</a>
	{/if}
</nav>

<style>
	nav {
		background-color: white;
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: row;
		text-align: center;
		vertical-align: middle;
		align-items: center;
		border-bottom: solid 2px black;
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		margin-bottom: 1vh;
		z-index: 10000;
	}

	a {
		margin: 0.5vw;
		padding: 0.5vw;
		text-decoration: none;
		color: black;
		font-size: 1.5rem;
		border: solid 1px black;
		border-radius: 1rem;
	}
</style>
