<script lang="ts">
	import { decimal_currency_subunit_to_unit, construct_qps, booking_description_builder } from '$lib/helpers/helpers';
	import Booking_form_hour_buttons from './children/booking_form_hour_buttons.svelte';
	import Tel_input from './children/tel_input.svelte';
	import Cost_summary from './children/cost_summary.svelte';
	import People_coming_input from './children/people_coming_input.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';

	import type { Cal_event, Booking_form_inputs } from '$lib/types';

	export let STUDIO_OPERATING_HOURS: number;
	export let STUDIO_OPENING_HOUR: number;
	export let HOURLY_RATE: number;
	export let STUDIO_NAME: string;
	export let CAL_ID: string;
	export let fly_direction: number;
	export let show_calendar: boolean;

	export let selected_start_time: Date | null;
	export let available_hours: boolean[];

	// HTML attribute bindings bindings
	let submit_button: HTMLButtonElement;
	let email_element: HTMLInputElement;

	// HTML value bindings
	let form_values = {
		is_checked: new Array<boolean>(STUDIO_OPERATING_HOURS).fill(false),
		first_name: '',
		surname: '',
		email_value: '',
		phone_number_value: '',
		people_coming: undefined,
		booking_reason: '',
		message: ''
	} as Booking_form_inputs;

	let rate_multiplier = 0;
	let booking_has_submit = false;

	let total_cost = 0;

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
	function validate_form(form_values: Booking_form_inputs) {
		for (let k in form_values) {
			switch (k) {
				// Handles the boolean array - checks if any of the values are true
				case 'is_checked':
					if (!(form_values[k as keyof Booking_form_inputs] as boolean[]).includes(true)) {
						return false;
					}
					break;

				// Handles the number - checks if the value is less than 1
				case 'people_coming':
					const X = form_values[k as keyof Booking_form_inputs] as number | undefined;
					console.log(X);
					if (X == undefined || X < 1) {
						return false;
					}
					break;

				// Is not a required input
				case 'message':
					break;

				// Handles every other string or string adjacent type = checks if no length
				default:
					if ((form_values[k as keyof Booking_form_inputs] as string).length < 1) {
						console.log(`${k} is undefined`);
						return false;
					}
			}
		}

		return true;
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

		// Loop through form data:
		// * if it was a checkbox, add the date time string
		// * else add immediately
		for (let [k, v] of fd) {
			if (/^checkbox/.test(k)) {
				t.setHours(parseInt(k.replace('checkbox_', '')) + i);
				time[i] = t.toISOString();
				i++;
			}
		}

		// If only one checkbox was ticked & active
		if (i == 1) {
			t.setHours(t.getHours() + 1);
			time[1] = t.toISOString();
		}

		const FULL_NAME = `${form_values.first_name} ${form_values.surname}`;

		const QPS = {
			cal_id: CAL_ID,
			title: `BOOKING - ${FULL_NAME}`,
			start_time: time[0],
			end_time: time[1],
			studio_name: STUDIO_NAME,
			booking_price: total_cost,
			description: booking_description_builder(
				FULL_NAME,
				STUDIO_NAME,
				form_values.phone_number_value,
				form_values.email_value,
				form_values.people_coming,
				form_values.booking_reason,
				form_values.message
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

	onMount(async () => {
		email_element.addEventListener('focusout', (event) => {
			if (email_element.validity.valid) {
				email_element.style.removeProperty('border-color');
			} else {
				email_element.style.setProperty('border-color', 'red');
			}
		});
	});

	// Runs when is_checked updates
	$: validate_form(form_values)
		? submit_button?.removeAttribute('disabled')
		: submit_button?.setAttribute('disabled', 'true');
</script>

{#if available_hours.every((hour) => hour == false)}
	<h1><b>{STUDIO_NAME}</b> is unavailable on {formatted_time}</h1>
	<button
		class="back_button"
		on:click|preventDefault={() => {
			fly_direction = -1;
			show_calendar = true;
			selected_start_time = null;
		}}>&#8249;</button
	>
{:else if booking_has_submit}
	<Circle size="60" color="#444444" unit="px" duration="1s" />
{:else}
	<form on:submit|preventDefault={on_submit} class="form">
		<span class="top_row">
			<button
				class="back_button"
				on:click|preventDefault={() => {
					fly_direction = -1;
					show_calendar = true;
					selected_start_time = null;
				}}>&#8249;</button
			>
			<p>
				Book <b>{formatted_time}</b>
			</p>
		</span>
		<input placeholder="First Name" type="text" bind:value={form_values.first_name} name="firstname" required />
		<input placeholder="Surname" type="text" bind:value={form_values.surname} name="surname" required />
		<input
			placeholder="Contact Email"
			type="email"
			bind:value={form_values.email_value}
			bind:this={email_element}
			name="email"
			required
		/>

		<Tel_input bind:phone_number_value={form_values.phone_number_value} />
		<Booking_form_hour_buttons
			{available_hours}
			{STUDIO_OPERATING_HOURS}
			{STUDIO_OPENING_HOUR}
			bind:is_checked={form_values.is_checked}
			bind:rate_multiplier
		/>

		<People_coming_input bind:people_coming={form_values.people_coming} />

		<textarea
			placeholder="Describe why you're booking the studio"
			name="booking_reason"
			bind:value={form_values.booking_reason}
			required
		/>
		<textarea placeholder="(Optional) Any additional messages" name="message" bind:value={form_values.message} />

		<hr />
		<Cost_summary bind:total_cost {HOURLY_RATE} {rate_multiplier} />
		<button type="submit" bind:this={submit_button} autocomplete="off" disabled="true"
			>Proceed to payment (£{decimal_currency_subunit_to_unit(total_cost)})</button
		>
	</form>
{/if}

<style>
	.top_row p {
		word-wrap: normal;
		padding: 0;
		margin: 0;
	}
	.top_row button:enabled {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #00000000;
		border: 0;
		box-shadow: none;
		font-size: 3rem;
		padding: 0;
		color: grey;
		text-align: center;
		vertical-align: middle;
	}

	.top_row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	hr {
		width: 100%;
		height: 0.1vh;
		background-color: black;
		border-color: black;
		border-radius: 1rem;
	}

	form {
		text-align: center;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border-radius: 1rem;
		border-color: black;
		border-style: solid;
		border-width: 1px;
		width: fit-content;
		max-width: 80vw;
	}

	textarea {
		padding-top: 0.5em;
		padding-right: 0.5em;
		padding-bottom: 0.5em;
	}

	form > input[type='text'],
	form > input[type='email'],
	form > textarea {
		padding: 1px;
		border-color: black;
		border-style: solid;
		border-width: 1px;
		border-radius: 1rem;
		margin: 0.5rem;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
		padding-left: 0.5em;
		height: 1rem;
		font-size: 0.9rem;
	}

	form > input::placeholder,
	form > textarea::placeholder {
		color: grey;
		font-style: italic;
		font-weight: bold;
		font-size: 0.8rem;
	}

	form > textarea {
		padding-top: px;
		height: 5rem;
		resize: none;
	}

	button {
		border-color: black;
		border-style: solid;
		border-width: 1px;
		border-radius: 1rem;
		margin: 0.5rem;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
		font-size: 0.9rem;
		font-weight: bold;
	}

	button:enabled {
		background-color: #0089c4;
		cursor: grab;
	}
</style>
