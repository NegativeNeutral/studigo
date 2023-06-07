<script lang="ts">
	import type { Cal_event } from '$lib/types';
	import { decimal_currency_subunit_to_unit, construct_qps, booking_description_builder } from '$lib/helpers/helpers';

	export let STUDIO_OPERATING_HOURS: number;
	export let STUDIO_OPENING_HOUR: number;
	export let HOURLY_RATE: number;
	export let STUDIO_NAME: string;
	export let CAL_ID: string;

	export let selected_start_time: Date | null;
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
		let t = new Date(selected_start_time as Date);
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

		const QPS = {
			cal_id: CAL_ID,
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
	<h1><b>{STUDIO_NAME}</b> is unavailable on {formatted_time}</h1>
{:else if booking_has_submit}
	<h1>Submitting booking form... imagine a loading spinner...</h1>
{:else}
	<form on:submit|preventDefault={on_submit} class="form">
		<p>
			Book <b>{STUDIO_NAME}</b> for <b>{formatted_time}</b>
		</p>
		<input placeholder="First Name" type="text" bind:value={first_name} name="firstname" required />
		<input placeholder="Surname" type="text" bind:value={surname} name="surname" required />
		<input placeholder="Contact Email" type="email" bind:value={email} name="email" required />
		<input placeholder="Phone Number" type="tel" bind:value={phone} name="phone" required />

		<div class="checkbox_master">
			{#each available_hours as hour_is_available, i}
				<div class={hour_is_available ? 'hour_selector_free' : 'hour_selector_busy'}>
					<label
						class="checkbox_labels"
						for={(i + STUDIO_OPENING_HOUR).toString()}
						id={(i + STUDIO_OPENING_HOUR).toString()}
					>
						{(i + STUDIO_OPENING_HOUR).toString()}:00
					</label>
					<input
						type="checkbox"
						name={'checkbox_'.concat((i + STUDIO_OPENING_HOUR).toString())}
						disabled={!hour_is_available}
						bind:checked={is_checked[i]}
						bind:this={checkboxes[i]}
					/>
				</div>
			{/each}
		</div>

		<textarea placeholder="Additional notes" name="message" />

		<div class="submit_row">
			<button type="submit" bind:this={submit_button} autocomplete="off" disabled="true">Submit</button>
			<h4>Cost: £{decimal_currency_subunit_to_unit(HOURLY_RATE * rate_multiplier)}</h4>
		</div>
	</form>
{/if}

<style>
	.submit_row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
	}

	p {
		word-wrap: normal;
	}

	.form {
		text-align: center;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border-radius: 1rem;
		border-radius: 0.5rem;
		border-color: black;
		border-style: solid;
		border-width: 1px;
		width: fit-content;
		max-width: 80vw;
	}

	.form input[type='text'],
	.form input[type='tel'],
	.form input[type='email'],
	.form textarea {
		margin: 0.5rem;
		text-indent: 10px;
		height: 1rem;
		border-radius: 0.5rem;
		border-color: black;
		border-style: solid;
		border-width: 1px;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
	}

	.form input::placeholder,
	.form textarea::placeholder {
		color: #111111;
		font-style: bold;
		font-size: 1rem;
	}

	.form textarea {
		height: 5rem;
		resize: none;
	}

	/**
	* CHECKBOXES
	*/

	.hour_selector_free,
	.hour_selector_busy {
		display: grid;
		grid-template: 1fr / 1fr;
		align-items: center;
		justify-items: center;
	}

	.hour_selector_free label,
	.hour_selector_busy label,
	.hour_selector_busy input,
	.hour_selector_free input {
		position: relative;
		grid-column: 1;
		grid-row: 1;
	}

	.hour_selector_free label,
	.hour_selector_busy label {
		z-index: 100;
		width: fit-content;
	}

	.hour_selector_busy input[type='checkbox'],
	.hour_selector_free input[type='checkbox'] {
		-webkit-appearance: none;
		appearance: none;
		background-color: white;
		margin: 0;

		font: inherit;
		color: currentColor;
		width: 100%;
		height: 2em;

		transform: translateY(-0.075em);

		display: grid;
		place-content: center;
	}

	.form input[type='checkbox']::before {
		content: '';
		transform: scale(0);
	}

	.form input[type='checkbox']:checked {
		background-color: rgb(20, 171, 20);
	}

	.form input[type='checkbox']:hover {
		background-color: rgb(12, 102, 12);
		cursor: grab;
	}

	.form input[type='checkbox']:disabled {
		background-color: #6666664b;
		cursor: default;
	}

	.hour_selector_free input[type='checkbox']:disabled:checked {
		background-color: purple;
	}

	.hour_selector_busy input[type='checkbox']:disabled {
		background-color: red;
		cursor: default;
	}

	.checkbox_master {
		border-color: black;
		border-style: solid;
		border-width: 1px;
		border-radius: 1rem;
		overflow: hidden;
		height: min-content;
		margin: 0.5rem;
	}
</style>
