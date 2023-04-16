<script lang="ts">
	import { InlineCalendar, themes } from 'svelte-calendar';
	import { onMount } from 'svelte';

	const { dark: theme } = themes;
	const MONDAY = 1;

	let today = new Date();
	let end = new Date();
	end.setMonth(end.getMonth() + 3);

	let store: any; // Hack

	$: selected = $store?.selected;

	onMount(async () => {
		const PATH = `/`;
		const res = await fetch(PATH, { method: 'GET' });
		const json = await res.json();
		console.log(json.url as string)
		return json.url as string;
		// TODO: Add button to call json.url
	});
</script>

<h1>Welcome to StudiGo</h1>

<div style="display: flex; flex-direction: row">
	<InlineCalendar
		{theme}
		selected={today}
		start={today}
		{end}
		startOfWeekIndex={MONDAY}
		bind:store
	/>

	<div style="background-color: grey">
		<p>{selected}</p>

		<div style="text-align: center; background-color: red">
			<h5>09:00</h5>
			<h5>10:00</h5>
			<h5>11:00</h5>
			<h5>12:00</h5>
			<h5>13:00</h5>
			<h5>14:00</h5>
			<h5>15:00</h5>
			<h5>16:00</h5>
		</div>
	</div>
</div>
