<script lang="ts">
	import type { Cal_event } from '$lib/types';
	import { decimal_currency_subunit_to_unit, construct_qps, booking_description_builder } from '$lib/helpers/helpers';

	export let STUDIO_OPERATING_HOURS: number; // TODO: Read from database
	export let STUDIO_OPENING_HOUR: number; // TODO: Read from database
	export let HOURLY_RATE: number; // TODO: Read from database

	export let selected_start_time: Date;
	export let available_hours: boolean[];

	// HTML attribute bindings bindings
	let checkboxes = new Array<HTMLInputElement>(STUDIO_OPERATING_HOURS);
	let submit_button: HTMLButtonElement;

	// HTML value bindings
	let is_checked = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(false);
	let first_name = '';
	let surname = '';
	let email = '';
	let phone = '';

	let rate_multiplier = 0;
	let booking_has_submit = false;

	let formatted_time = selected_start_time?.toLocaleDateString('en-GB', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	/**
	 * Updates the state of the checkboxes (whether they disabled or not) based on
	 * the state of the surrounding checkboxes. Image the checkboxes are a list:
	 * 1. Only the head, head -1, tail, and tail -1 checkboxes should be clickable
	 * 2. If no checkboxes are checked, every checkbox should be checkable
	 * 3. If an hour is unavailable, it should never be checkable
	 * 4. Checkboxes between the head and tail should never be checkable
	 * @param cs A boolean array indicating if a checkbox is clicked or not.
	 */
	function validate_form(cs: boolean[], fn: string, sn: string, e: string, p: string) {
		let mul = 0;
		const BOXES_ARE_TICKED = cs.filter((v) => v == true).length;

		// If the form can be submitted, allow submit button
		if (BOXES_ARE_TICKED && fn?.length && sn?.length && e?.length && p?.length) {
			submit_button?.removeAttribute('disabled');
		}
		// Disallow submit button
		else {
			submit_button?.setAttribute('disabled', 'true');
		}

		// Make some checkboxes unselectable
		if (BOXES_ARE_TICKED) {
			for (let i = 0; i < cs.length; i++) {
				checkboxes[i]?.setAttribute('disabled', 'true');
				mul += cs[i] ? 1 : 0;

				if (
					((cs[i + 1] && !cs[i]) || (cs[i] && !cs[i - 1]) || (!cs[i + 1] && cs[i]) || (!cs[i] && cs[i - 1])) &&
					available_hours[i]
				) {
					checkboxes[i]?.removeAttribute('disabled');
				}
			}
		}
		// Make all selectable BUT unavailable hours
		else {
			for (let i = 0; i < checkboxes.length; i++) {
				if (available_hours[i]) {
					checkboxes[i]?.removeAttribute('disabled');
				}
			}
		}

		rate_multiplier = mul;
	}

	/**
	 * This function takes in the form data and converts it to query string
	 * parameters that will be expected by the receiving route.
	 * @param fd Form data
	 * @returns Query parameters
	 * @todo Tidy up this damn function.
	 */
	function form_data_to_qp(fd: FormData) {
		let i = 0;
		let t = new Date(selected_start_time);
		let time: Cal_event = ['', ''];
		let data: { [key: string]: FormDataEntryValue } = {};

		// Loop through form data:
		// * if it was a checkbox, add the date time string
		// * else add immediately
		for (let [k, v] of fd) {
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

		const FULL_NAME = `${data.firstname} ${data.surname}`;
		const STUDIO_NAME = 'PHOTOMAFIA STUDIOS'; // TODO: Read this from somewhere

		const QPS = {
			cal_id: 'primary', // TODO: Read this value from somewhere
			title: `BOOKING - ${FULL_NAME}`,
			start_time: time[0],
			end_time: time[1],
			studio_name: STUDIO_NAME,
			booking_price: HOURLY_RATE * rate_multiplier,
			description: booking_description_builder(
				FULL_NAME,
				STUDIO_NAME,
				data.phone.toString(),
				data.email.toString(),
				data.message.toString()
			)
		};

		return construct_qps(QPS);
	}

	/**
	 * Intercepts the form submit and manipulates the request body before sending.
	 * @param e The submit event
	 */
	async function on_submit(e: SubmitEvent) {
		const qps = form_data_to_qp(new FormData(e.target as HTMLFormElement));
		const url_root = '/pay';
		window.location.assign(`${url_root}?${qps}`);
	}

	// Runs when is_checked updates
	$: validate_form(is_checked, first_name, surname, email, phone);
</script>

{#if available_hours.every((hour) => hour == false)}
	<h1>PHOTOMAFIA STUDIOS is unavailable on {formatted_time}</h1>
{:else if booking_has_submit}
	<h1>Submitting booking form... imagine a loading spinner...</h1>
{:else}
	<form
		style="text-align: center; background-color: grey; display: flex; flex-direction: column"
		on:submit|preventDefault={on_submit}
	>
		<h2>
			Book PHOTOMAFIA STUDIOS for {formatted_time}
		</h2>
		<label for="firstname">First Name(s):</label>
		<input type="text" bind:value={first_name} name="firstname" required />

		<label for="surname">Surname:</label>
		<input type="text" bind:value={surname} name="surname" required />

		<label for="email">Contact Email:</label>
		<input type="email" bind:value={email} name="email" required />

		<label for="phone">Phone Number:</label>
		<input type="tel" bind:value={phone} name="phone" required />

		<div id="radio_container">
			{#each available_hours as hour, i}
				<label
					for={(i + STUDIO_OPENING_HOUR).toString()}
					style={'background-color: '.concat(!hour ? 'red' : 'green')}
					id={(i + STUDIO_OPENING_HOUR).toString()}
					class="container"
				>
					{(i + STUDIO_OPENING_HOUR).toString()}:00
					<input
						type="checkbox"
						name={'checkbox_'.concat((i + STUDIO_OPENING_HOUR).toString())}
						disabled={!hour}
						bind:checked={is_checked[i]}
						bind:this={checkboxes[i]}
					/>
					<span class="hour_selector" />
				</label>
			{/each}
		</div>

		<label for="message">Additional notes:</label>
		<textarea name="message" />

		<div id="submit_row">
			<button type="submit" bind:this={submit_button} autocomplete="off" disabled="true">Submit</button>
			<h4>Cost: £{decimal_currency_subunit_to_unit(HOURLY_RATE * rate_multiplier)}</h4>
		</div>
	</form>
{/if}

<style>
	#radio_container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	#submit_row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
	}
</style>
