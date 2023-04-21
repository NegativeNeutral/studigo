<script lang="ts">
	import { InlineCalendar, themes } from 'svelte-calendar';
	import type { PageData } from './$types';

	export let data: PageData;
	const { dark: theme } = themes;
	const MONDAY = 1;
	const TODAY = new Date();
	const END = new Date();
	END.setMonth(END.getMonth() + 3);

	let store: any; // Hack
	$: SELECTED_START_TIME = $store?.selected as Date;

	// When Selected changes, run function
	$: SELECTED_START_TIME,
		(async () => {
			if (!SELECTED_START_TIME) {
				return;
			}

			const SELECTED_END_TIME = new Date(SELECTED_START_TIME);
			SELECTED_END_TIME?.setUTCHours(23, 59, 59, 999);
			SELECTED_END_TIME?.setDate(SELECTED_END_TIME.getDate() + 1);

			let prom = await get_dates(
				SELECTED_START_TIME?.toISOString(),
				SELECTED_END_TIME?.toISOString()
			);

			let times = await prom?.json();

			console.log(times);
			// TODO: Use these events to block out calendar
		})();

	async function get_dates(dateMin: string, dateMax: string) {
		if (!dateMin && !dateMax) {
			return;
		}
		const QUERY = `${data.path}?dateMin=${dateMin}&dateMax=${dateMax}`;
		return fetch(QUERY, { method: 'GET' });
	}
</script>

<h1>Welcome to StudiGo</h1>

<h2>{$store?.hasChosen}</h2>

<a href="/login">Login!</a>

<div style="display: flex; flex-direction: row">
	<InlineCalendar
		{theme}
		selected={TODAY}
		start={TODAY}
		end={END}
		startOfWeekIndex={MONDAY}
		bind:store
	/>

	<div style="background-color: grey">
		<p>{SELECTED_START_TIME}</p>

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
