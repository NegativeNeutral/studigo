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

	let start_hour: number;
	let end_hour: number;

	let html_times = new Array<HTMLHeadingElement>(8);

	// When SELECTED_START_TIME changes, run on_new_date_selected
	$: on_new_times_retrieved(on_new_date_selected(SELECTED_START_TIME));

	async function on_new_date_selected(SELECTED_START_TIME: Date) {
		start_hour = 0;
		end_hour = 0;
		if (!SELECTED_START_TIME) {
			return [];
		}

		// Create END time of day
		const SELECTED_END_TIME = new Date(SELECTED_START_TIME);
		SELECTED_END_TIME?.setHours(23, 59, 59, 999);

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
		console.log(TIMES);

		TIMES.forEach((time) => {
			// TODO: Set this to up to work with more than 1 event in a day
			const START_D = new Date(time[0]);
			const END_D = new Date(time[1]);

			console.log(`${START_D} , ${END_D}`);

			start_hour = START_D.getHours();
			// Extra logic so that a 1 hour slot doesn't block out 2 hours
			end_hour = !END_D.getMinutes() ? END_D.getHours() - 1 : END_D.getHours();
			end_hour += end_hour < start_hour ? 24 : 0;

			console.log(`${start_hour}, ${end_hour}`);
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
					<div style="display: flex; flex-direction: row">
						{#if start_hour?.toString() <= el?.id && end_hour?.toString() >= el?.id}
							<h5
								id={(i + 9).toString()}
								bind:this={el}
								style="background-color: red"
							>
								{(i + 9).toString()}:00
							</h5>
						{:else}
							<h5
								id={(i + 9).toString()}
								bind:this={el}
								style="background-color: green"
							>
								{(i + 9).toString()}:00
							</h5>
							<button>Book!</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<a href="/login">Login to view calendars</a>
{/if}
