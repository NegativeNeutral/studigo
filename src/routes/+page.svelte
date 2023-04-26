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
	let is_waiting_for_api = false;

	// When selected_start_time changes, run on_new_date_selected
	$: on_new_times_retrieved(on_new_date_selected(selected_start_time));

	/**
	 * The function to run when a new date is selected on the calendar view. It:
	 * 1. Fills the @var hour_is_free array with true
	 * 2. calculates the start and end time of the selected date
	 * 3. Uses those times to retrieve the events for the date from the Google API
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
		is_waiting_for_api = true;
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
		is_waiting_for_api = false;
	}

	function book_time_on_click(hour: number) {
		console.log(hour);
		return null;
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
			{#if is_waiting_for_api}
				<h1>
					Waiting for dates, imagine there is a loading spinner here or
					something IDK
				</h1>
			{:else}
				<form
					style="text-align: center; background-color: grey; display: flex; flex-direction: column"
					action="/booking-submit"
					method="post"
				>
					<h2>
						Book PHOTOMAFIA STUDIOS for {selected_start_time?.toLocaleDateString(
							'en-GB',
							{
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							}
						)}
					</h2>
					<label for="name">Name:</label>
					<input type="text" id="name" name="name" required />

					<label for="email">Email:</label>
					<input type="email" id="email" name="email" required />

					<div
						style="display: flex; flex-direction: column; align-items: center"
					>
						{#each hour_is_free as hour, i}
							<div style="display: flex; flex-direction: row">
								{#if hour}
									<input
										type="checkbox"
										name="hour_to_book"
										id={(i + STUDIO_OPENING_HOUR).toString()}
										value={(i + STUDIO_OPENING_HOUR).toString()}
									/>
									<label
										for={(i + STUDIO_OPENING_HOUR).toString()}
										style="background-color: green"
									>
										{(i + STUDIO_OPENING_HOUR).toString()}:00
									</label>
								{:else if !hour}
									<p style="background-color: red; margin: 0; padding: 0">
										{(i + STUDIO_OPENING_HOUR).toString()}:00
									</p>
								{/if}
							</div>
						{/each}
					</div>
					<label for="message">Additional notes:</label>
					<textarea id="message" name="message" />
					<button type="submit">Submit</button>
				</form>
			{/if}
		</div>
	</div>
{:else}
	<a href="/login">Login to view calendars</a>
{/if}
