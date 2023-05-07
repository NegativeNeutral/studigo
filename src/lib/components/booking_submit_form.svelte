<script lang="ts">
	import type { Cal_event } from '$lib/types';
	import { redirect } from '@sveltejs/kit';

	export let STUDIO_OPERATING_HOURS: number;
	export let STUDIO_OPENING_HOUR: number;
	export let selected_start_time: Date;
	export let available_hours: boolean[];

	let checkboxes = new Array<HTMLInputElement>(STUDIO_OPERATING_HOURS);
	let is_checked = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(false);

	// Runs when is_checked updates
	$: (() => {
		// Make all selectable BUT unavailable hours
		if (!is_checked.filter((v) => v == true).length) {
			for (let i = 0; i < checkboxes.length; i++) {
				if (available_hours[i]) {
					checkboxes[i]?.removeAttribute('disabled');
				}
			}
		}
		// Make some unselectable
		else {
			for (let i = 0; i < is_checked.length; i++) {
				checkboxes[i].setAttribute('disabled', 'true');

				if (
					((is_checked[i + 1] && !is_checked[i]) ||
						(is_checked[i] && !is_checked[i - 1]) ||
						(!is_checked[i + 1] && is_checked[i]) ||
						(!is_checked[i] && is_checked[i - 1])) &&
					available_hours[i]
				) {
					checkboxes[i].removeAttribute('disabled');
				}
			}
		}
	})();

	async function on_submit(e: SubmitEvent) {
		let form_data = new FormData(e.target as HTMLFormElement);
		let time: Cal_event = ['', ''];
		let i = 0;
		let t = new Date(selected_start_time);
		let data: { [key: string]: Cal_event | FormDataEntryValue } = {};

		for (let field of form_data) {
			const [k, v] = field;

			if (/^checkbox/.test(k)) {
				t.setHours(parseInt(k.replace('checkbox_', '')));
				time[i] = t.toISOString();
				i++;
			} else {
				data[k] = v;
			}
		}

		if (i == 1) {
			t.setHours(t.getHours() + 1);
			time[1] = t.toISOString();
		}

		data['event_times'] = time;
		data['cal_id'] = 'lawrencewarren2@gmail.com';

		let resp = await fetch('/booking-submit', {
			method: 'POST',
			body: JSON.stringify(data)
		});

		window.location.replace('/booking-submit');
	}
</script>

{#if available_hours.every((hour) => hour == false)}
	<h1>PHOTOMAFIA STUDIES IS UNAVAILABLE THIS DAY</h1>
{:else}
	<form
		style="text-align: center; background-color: grey; display: flex; flex-direction: column"
		action="/booking-submit"
		method="POST"
		on:submit|preventDefault={on_submit}
	>
		<h2>
			Book PHOTOMAFIA STUDIOS for {selected_start_time?.toLocaleDateString('en-GB', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}
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
