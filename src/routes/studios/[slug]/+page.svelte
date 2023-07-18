<script lang="ts">
	import Booking_submit_form from '$lib/components/booking_form/booking_submit_form.svelte';
	import { construct_qps } from '$lib/helpers/helpers';
	import { fly } from 'svelte/transition';
	import { Circle } from 'svelte-loading-spinners';
	import { DatePicker } from 'date-picker-svelte';
	import type { PageData } from './$types';
	import type { Cal_event } from '$lib/types';

	export let data: PageData;

	const TOMORROW = new Date();
	const END = new Date();
	TOMORROW.setDate(TOMORROW.getDate() + 1);
	TOMORROW.setHours(0, 0, 0, 0);
	END.setMonth(END.getMonth() + 3);
	const STUDIO_OPENING_HOUR = data.studio_opening_hour; // Open at 9am
	const STUDIO_OPERATING_HOURS = data.studio_operating_hours; // Operates from 9am until 5pm
	const HOURLY_RATE = data.hourly_rate;
	const STUDIO_NAME = data.studio_name;
	const CAL_ID = data.cal_id;
	const STUDIO_EMAIL = data.studio_email;

	let selected_start_time: Date | null = null;
	let show_calendar = true;
	let available_hours = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(true);
	let is_waiting_for_api = false;
	let fly_direction = 1;

	const ANIM_SPEED = 1000;
	const ANIM_DURATION = 200;

	async function on_new_date_selected() {
		is_waiting_for_api = true;
		const OUT = await on_new_times_retrieved(call_calendar_api(selected_start_time));
		if (OUT != null) {
			fly_direction = 1;
			available_hours = OUT;
			show_calendar = false;
		}

		is_waiting_for_api = false;
	}

	/**
	 * The function to run when a new date is selected on the calendar view. It:
	 * 1. Fills the @var hour_is_free array with true
	 * 2. calculates the start and end time of the selected date
	 * 3. Uses those times to retrieve the events for the date from the Google API
	 * @param start_time_o An object representing the selected date
	 * @returns the events for the selected day, as a Promise
	 */
	async function call_calendar_api(start_time_o: Date | null) {
		if (start_time_o == null) {
			return null;
		}

		available_hours = available_hours.fill(true);

		// Create END time of day object
		const end_time_o = new Date(start_time_o);
		end_time_o?.setHours(23, 59, 59, 999);

		// Fetch query & output
		const QPS = {
			cal_id: CAL_ID,
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
	async function on_new_times_retrieved(es_p: Promise<Cal_event[] | null>) {
		let es = await es_p;

		if (es == null) {
			return null;
		}

		let hour_is_free = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(true);

		es.forEach((e) => {
			// Get the date objects needed
			const [start, end] = e;

			// Validate that start & end are correct
			if (start == 'error' && end == 'error') {
				data.is_oauth_set = false;
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

<div class="master_container">
	{#if data.slug_is_invalid}
		<h1>This studio doesn't exist, please navigate away from <code>{data.path}</code></h1>
	{:else if show_calendar && data.is_oauth_set}
		<div
			class="carousel_phase"
			in:fly|local={{ x: ANIM_SPEED * fly_direction, duration: ANIM_DURATION, opacity: 100 }}
			out:fly|local={{ x: ANIM_SPEED * -fly_direction, duration: ANIM_DURATION, opacity: 100 }}
		>
			<div class="lowest_container">
				<DatePicker
					on:select={on_new_date_selected}
					min={TOMORROW}
					max={END}
					bind:value={selected_start_time}
					browseWithoutSelecting={true}
				/>
			</div>
			{#if is_waiting_for_api}
				<div class="lowest_container">
					<Circle size="60" color="#444444" unit="px" duration="1s" />
				</div>
				<div class="loading_cover" />
			{/if}
		</div>
	{:else if !show_calendar && !is_waiting_for_api && data.is_oauth_set}
		<div
			class="carousel_phase"
			in:fly|local={{ x: ANIM_SPEED * fly_direction, duration: ANIM_DURATION, opacity: 100 }}
			out:fly|local={{ x: ANIM_SPEED * -fly_direction, duration: ANIM_DURATION, opacity: 100 }}
		>
			<Booking_submit_form
				{available_hours}
				{STUDIO_OPENING_HOUR}
				{STUDIO_OPERATING_HOURS}
				{HOURLY_RATE}
				{STUDIO_NAME}
				{CAL_ID}
				{STUDIO_EMAIL}
				bind:selected_start_time
				bind:fly_direction
				bind:show_calendar
			/>
		</div>
	{:else if !data.is_oauth_set}
		<p class="no_display_text"><i>We can't access <b>{STUDIO_NAME}</b>'s calendar</i></p>
	{/if}
</div>

<style>
	:root {
		--date-picker-foreground: black;
		--date-picker-background: #f7f7f700;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.master_container {
		display: grid;
		grid-template: 1fr / 1fr;
		place-items: start center;
		overflow: hidden;
		margin: auto;
		width: max-content;
		/*box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;*/
	}

	.carousel_phase {
		position: relative;
		grid-column: 1 / 1;
		grid-row: 1 / 1;
		width: max-content;
		display: grid;
		align-items: center;
		justify-items: center;
	}

	.lowest_container {
		grid-column: 1;
		grid-row: 1;
	}

	.loading_cover {
		grid-column: 1;
		grid-row: 1;
		z-index: 1;
		background-color: #66666666;
		width: 100%;
		height: 100%;
	}

	.no_display_text {
		margin-left: 0.1vw;
		margin-right: 0.1vw;
	}
</style>
