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

	let start_hour: number | undefined;
	let end_hour: number | undefined;

	let html_times = new Array<HTMLHeadingElement>(8);

	// When SELECTED_START_TIME changes, run on_new_date_selected
	$: on_new_times_retrieved(on_new_date_selected(SELECTED_START_TIME));

	async function on_new_date_selected(SELECTED_START_TIME: Date) {
		start_hour = undefined;
		end_hour = undefined;
		if (!SELECTED_START_TIME) {
			return [];
		}

		// Create END time of day
		const SELECTED_END_TIME = new Date(SELECTED_START_TIME);
		SELECTED_END_TIME?.setHours(23, 59, 59, 999);
		SELECTED_END_TIME?.setDate(SELECTED_END_TIME.getDate() + 1);

		// Stringify
		const S_START_TIME = SELECTED_START_TIME?.toISOString();
		const S_END_TIME = SELECTED_END_TIME?.toISOString();

		// Fetch query & output
		const QUERY = `${data.path}?dateMin=${S_START_TIME}&dateMax=${S_END_TIME}`;
		let p = await fetch(QUERY, { method: 'GET' }); // promise
		let o = await p.json(); // object
		return o.times as [string, string][]; // list of tuples
	}

	async function on_new_times_retrieved(obj_p: Promise<[string, string][]>) {
		const TIMES = await obj_p;

		TIMES.forEach((time) => {
			const START_D = new Date(time[0]);
			const END_D = new Date(time[1]);

			start_hour = START_D.getHours();
			end_hour = END_D.getHours();
			console.log(`Start: ${start_hour}\nEnd: ${end_hour}`);
		});
	}
</script>

<h1>Welcome to StudiGo</h1>

{#if data.is_oauth_set}
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

			<div style="text-align: center; background-color: grey">
				{#each html_times as el, i}
					<h5
						id={(i + 9).toString()}
						bind:this={el}
						style="background-color: {start_hour?.toString() == el?.id ||
						end_hour?.toString() == el?.id
							? 'red'
							: 'green'}"
					>
						{#if start_hour?.toString() == el?.id || end_hour?.toString() == el?.id}
							CAN'T BOOK
						{:else}
							{(i + 9).toString()}:00
						{/if}
					</h5>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<a href="/login">Login to view calendars</a>
{/if}
