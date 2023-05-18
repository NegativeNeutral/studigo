<script lang="ts">
	import { InlineCalendar, themes } from 'svelte-calendar';
	import Booking_submit_form from '$lib/components/booking_submit_form.svelte';
	import { obj_is_empty, construct_qps } from '$lib/helpers/helpers';

	import type { PageData } from './$types';
	import type { Cal_event } from '$lib/types';

	export let data: PageData;
	const { dark: theme } = themes;
	const MONDAY = 1;
	const TODAY = new Date();
	const END = new Date();
	END.setMonth(END.getMonth() + 3);
	const STUDIO_OPENING_HOUR = 9; // Open at 9am
	const STUDIO_OPERATING_HOURS = 8; // Operates from 9am until 5pm

	let store: any; // Hack

	$: selected_start_time = $store?.selected as Date;
	let available_hours = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(true);
	let is_waiting_for_api = false;

	// When selected_start_time changes, run on_new_date_selected
	$: (async () => {
		is_waiting_for_api = true;
		available_hours = await on_new_times_retrieved(on_new_date_selected(selected_start_time));
		is_waiting_for_api = false;
	})();

	/**
	 * The function to run when a new date is selected on the calendar view. It:
	 * 1. Fills the @var hour_is_free array with true
	 * 2. calculates the start and end time of the selected date
	 * 3. Uses those times to retrieve the events for the date from the Google API
	 * @param start_time_o An object representing the selected date
	 * @returns the events for the selected day, as a Promise
	 */
	async function on_new_date_selected(start_time_o: Date) {
		available_hours = available_hours.fill(true);
		if (!start_time_o) {
			return [];
		}

		// Create END time of day object
		const end_time_o = new Date(start_time_o);
		end_time_o?.setHours(23, 59, 59, 999);

		// Fetch query & output
		const QPS = {
			cal_id: 'primary', // TODO: Read from somewhere
			date_min: start_time_o?.toISOString(),
			date_max: end_time_o?.toISOString()
		};

		const URL = `${data.path}?${construct_qps(QPS)}`;

		let p = await fetch(URL, { method: 'GET' }); // promise
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
	 * @param es_p A Promise containing a tuple of all events for the day.
	 * @returns An array of booleans indicating if each hour of a day the studio
	 * is open is free or not.
	 */
	async function on_new_times_retrieved(es_p: Promise<Cal_event[]>) {
		let hour_is_free = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(true);
		let es = await es_p;

		es.forEach((e) => {
			// Get the date objects needed
			const [start, end] = e;

			// Validate that start & end are correct
			if (start == 'error' && end == 'error') {
				data.is_oauth_set = {};
				return hour_is_free;
			}

			const start_time_o = new Date(start);
			const end_time_o = new Date(end);

			// Get the hours difference & the start hour as numbers
			const start_hour = start_time_o.getHours();
			const e_duration = (end_time_o.getTime() - start_time_o.getTime()) / 1000 / (60 * 60);

			for (let i = 0; i < e_duration && start_hour - STUDIO_OPENING_HOUR + i < STUDIO_OPERATING_HOURS; i++) {
				hour_is_free[start_hour - STUDIO_OPENING_HOUR + i] = false;
			}
		});

		return hour_is_free;
	}
</script>

<h1>Welcome to StudiGo</h1>

{#if !obj_is_empty(data.is_oauth_set)}
	<div style="display: flex; flex-direction: row">
		<InlineCalendar {theme} selected={TODAY} start={TODAY} end={END} startOfWeekIndex={MONDAY} bind:store />

		{#if is_waiting_for_api}
			<h1>Waiting for dates, imagine there is a loading spinner here or something IDK</h1>
		{:else}
			<div style="background-color: grey" />
			<Booking_submit_form {selected_start_time} {available_hours} {STUDIO_OPENING_HOUR} {STUDIO_OPERATING_HOURS} />
		{/if}
	</div>
{:else}
	<a href="/login">Login to view calendars</a>
{/if}
