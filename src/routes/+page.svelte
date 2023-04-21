<script lang="ts">
	import { InlineCalendar, themes } from 'svelte-calendar';
	import type { PageData } from './$types';
	import type { Cal_event } from '$lib/types';

	const { dark: theme } = themes;
	const MONDAY = 1;
	const TODAY = new Date();
	const END = new Date();
	END.setMonth(END.getMonth() + 3);
	const STUDIO_OPENING_HOUR = 9; // Open at 9am
	const STUDIO_OPERATING_HOURS = 8; // Operates from 9am until 5pm
	export let data: PageData;

	let store: any; // Hack

	$: selected_start_time = $store?.selected as Date;
	let hour_is_free = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(true);

	// When selected_start_time changes, run on_new_date_selected
	$: on_new_times_retrieved(on_new_date_selected(selected_start_time));

	/**
	 * The function to run when a new date is selected on the calendar view. It:
	 * 1. calculates the start and end time of the selected date
	 * 2. Uses those times to retrieve the events for the date from the Google API
	 * @param start_time_o An object representing the selected date
	 * @returns the events for the selected day, as a Promise
	 */
	async function on_new_date_selected(start_time_o: Date) {
		hour_is_free = hour_is_free.fill(true);
		if (!start_time_o) {
			return [];
		}

		// Create END time of day object
		const end_time_o = new Date(start_time_o);
		end_time_o?.setHours(23, 59, 59, 999);

		// Stringify the dates
		const start_time_s = start_time_o?.toISOString();
		const end_time_s = end_time_o?.toISOString();

		// Fetch query & output
		const query = `${data.path}?dateMin=${start_time_s}&dateMax=${end_time_s}`;
		let p = await fetch(query, { method: 'GET' }); // promise
		let o = await p.json(); // object
		return o.times as Cal_event[]; // list of tuples
	}

	/**
	 * The function to run once new dates are retrieved. It:
	 * 1. For each time in the times array:
	 * 1a. Gets the start and end time of the event as string
	 * 1b. Calculates the event duration, in hours
	 * 1c. Uses these values to set the hours where an event is happening in the
	 *     @var hour_is_free array to false
	 * @param events_p A Promise containing a tuple of all events for the day.
	 */
	async function on_new_times_retrieved(events_p: Promise<Cal_event[]>) {
		(await events_p).forEach((time) => {
			// Get the date objects needed
			const start_time_o = new Date(time[0]);
			const end_time_o = new Date(time[1]);

			// Get the hours difference & the start hour as numbers
			const event_start_hour = start_time_o.getHours();
			const event_duration =
				(end_time_o.getTime() - start_time_o.getTime()) / 1000 / (60 * 60);

			for (
				let i = 0;
				i < event_duration &&
				event_start_hour - STUDIO_OPENING_HOUR + i < STUDIO_OPERATING_HOURS;
				i++
			) {
				hour_is_free[event_start_hour - STUDIO_OPENING_HOUR + i] = false;
			}
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
			<p>{selected_start_time}</p>

			<div style="text-align: center; background-color: grey">
				{#each hour_is_free as hour, i}
					<div style="display: flex; flex-direction: row">
						{#if hour}
							<h5 style="background-color: green">
								{(i + STUDIO_OPENING_HOUR).toString()}:00
							</h5>
							<button>Book this hour!</button>
						{:else if !hour}
							<h5 style="background-color: red">
								{(i + STUDIO_OPENING_HOUR).toString()}:00
							</h5>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<a href="/login">Login to view calendars</a>
{/if}
