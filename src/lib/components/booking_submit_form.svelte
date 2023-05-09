<script lang="ts">
	import type { Cal_event } from '$lib/types';

	export let STUDIO_OPERATING_HOURS: number;
	export let STUDIO_OPENING_HOUR: number;
	export let selected_start_time: Date;
	export let available_hours: boolean[];
	let formatted_time = selected_start_time?.toLocaleDateString('en-GB', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	let checkboxes = new Array<HTMLInputElement>(STUDIO_OPERATING_HOURS);
	let is_checked = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(false);
	let booking_has_submit = false;

	// Runs when is_checked updates
	$: update_checkboxes(is_checked);

	/**
	 * Updates the state of the checkboxes (whether they disabled or not) based on
	 * the state of the surrounding checkboxes. Image the checkboxes are a list:
	 * 1. Only the head, head -1, tail, and tail -1 checkboxes should be clickable
	 * 2. If no checkboxes are checked, every checkbox should be checkable
	 * 3. If an hour is unavailable, it should never be checkable
	 * 4. Checkboxes between the head and tail should never be checkable
	 * @param cs A boolean array indicating if a checkbox is clicked or not.
	 */
	function update_checkboxes(cs: boolean[]) {
		// Make all selectable BUT unavailable hours
		if (!cs.filter((v) => v == true).length) {
			for (let i = 0; i < checkboxes.length; i++) {
				if (available_hours[i]) {
					checkboxes[i]?.removeAttribute('disabled');
				}
			}
		}
		// Make some checkboxes unselectable
		else {
			for (let i = 0; i < cs.length; i++) {
				checkboxes[i]?.setAttribute('disabled', 'true');

				if (
					((cs[i + 1] && !cs[i]) || (cs[i] && !cs[i - 1]) || (!cs[i + 1] && cs[i]) || (!cs[i] && cs[i - 1])) &&
					available_hours[i]
				) {
					checkboxes[i]?.removeAttribute('disabled');
				}
			}
		}
	}

	/**
	 * Intercepts the form submit and manipulates the request body before sending.
	 * @param e The submit event
	 */
	async function on_submit(e: SubmitEvent) {
		let time: Cal_event = ['', ''];
		let i = 0;
		let t = new Date(selected_start_time);
		let data: { [key: string]: Cal_event | FormDataEntryValue } = {};
		data['cal_id'] = 'primary'; // TODO: Read this value from somewhere

		// Loop through form data:
		// * if it was a checkbox, add the date time string
		// * else add immediately
		for (let [k, v] of new FormData(e.target as HTMLFormElement)) {
			if (/^checkbox/.test(k)) {
				t.setHours(parseInt(k.replace('checkbox_', '')) + i);
				time[i] = t.toISOString();
				i++;
			} else {
				data[k] = v;
			}
		}

		// If only one checkbox was ticked & active
		if (i == 1) {
			t.setHours(t.getHours() + 1);
			time[1] = t.toISOString();
		}

		data['event_times'] = time;

		booking_has_submit = true;
		let resp = await fetch('/booking-submit', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		booking_has_submit = false;

		if (resp.status == 200) {
			window.location.assign('/booking-submit');
		} else {
			// TODO: Handle error - show toast?
		}
	}
</script>

{#if available_hours.every((hour) => hour == false)}
	<h1>PHOTOMAFIA STUDIOS is unavailable on {formatted_time}</h1>
{:else if booking_has_submit}
	<h1>Submitting booking form... imagine a loading spinner...</h1>
{:else}
	<form
		style="text-align: center; background-color: grey; display: flex; flex-direction: column"
		action="/booking-submit"
		method="POST"
		on:submit|preventDefault={on_submit}
	>
		<h2>
			Book PHOTOMAFIA STUDIOS for {formatted_time}
		</h2>
		<label for="firstname">First Name(s):</label>
		<input type="text" id="firstname" name="firstname" required />

		<label for="surname">Surname:</label>
		<input type="text" id="surname" name="surname" required />

		<label for="email">Contact Email:</label>
		<input type="email" id="email" name="email" required />

		<label for="phone">Phone Number:</label>
		<input type="tel" id="phone" name="phone" required />

		<div style="display: flex; flex-direction: column; align-items: center" id="radio_container">
			{#each available_hours as hour, i}
				<label
					for={(i + STUDIO_OPENING_HOUR).toString()}
					style={'background-color: '.concat(!hour ? 'red' : 'green')}
					id={(i + STUDIO_OPENING_HOUR).toString()}
				>
					<input
						type="checkbox"
						name={'checkbox_'.concat((i + STUDIO_OPENING_HOUR).toString())}
						disabled={!hour}
						bind:checked={is_checked[i]}
						bind:this={checkboxes[i]}
					/>
					{(i + STUDIO_OPENING_HOUR).toString()}:00
				</label>
			{/each}
		</div>
		<label for="message">Additional notes:</label>
		<textarea id="message" name="message" />
		<button type="submit">Submit</button>
	</form>
{/if}
