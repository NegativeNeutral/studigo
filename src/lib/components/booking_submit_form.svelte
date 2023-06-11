<script lang="ts">
	import { decimal_currency_subunit_to_unit, construct_qps, booking_description_builder } from '$lib/helpers/helpers';
	import Booking_form_hour_buttons from '$lib/components/booking_form_hour_buttons.svelte';
	import Tel_input from '$lib/components/tel_input.svelte';
	import Cost_summary from '$lib/components/cost_summary.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';

	import type { Cal_event } from '$lib/types';
	import type { E164Number } from 'svelte-tel-input/types';

	export let STUDIO_OPERATING_HOURS: number;
	export let STUDIO_OPENING_HOUR: number;
	export let HOURLY_RATE: number;
	export let STUDIO_NAME: string;
	export let CAL_ID: string;

	export let selected_start_time: Date | null;
	export let available_hours: boolean[];

	// HTML attribute bindings bindings
	let submit_button: HTMLButtonElement;
	let email_element: HTMLInputElement;

	// HTML value bindings
	let is_checked = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(false);
	let first_name = '';
	let surname = '';
	let email_value = '';
	let message = '';
	let phone_number_value: E164Number = '';

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
	function validate_form(cs: boolean[], fn: string, sn: string, e: string, p: E164Number) {
		const BOXES_ARE_TICKED = cs.filter((v) => v == true).length;

		// If the form can be submitted, allow submit button
		if (BOXES_ARE_TICKED && fn?.length && sn?.length && e?.length && p.length) {
			submit_button?.removeAttribute('disabled');
		}
		// Disallow submit button
		else {
			submit_button?.setAttribute('disabled', 'true');
		}
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

		const FULL_NAME = `${first_name} ${surname}`;

		const QPS = {
			cal_id: CAL_ID,
			title: `BOOKING - ${FULL_NAME}`,
			start_time: time[0],
			end_time: time[1],
			studio_name: STUDIO_NAME,
			booking_price: total_cost,
			description: booking_description_builder(FULL_NAME, STUDIO_NAME, phone_number_value, email_value, message)
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
	$: validate_form(is_checked, first_name, surname, email_value, phone_number_value);
</script>

{#if available_hours.every((hour) => hour == false)}
	<h1><b>{STUDIO_NAME}</b> is unavailable on {formatted_time}</h1>
{:else if booking_has_submit}
	<Circle size="60" color="#444444" unit="px" duration="1s" />
{:else}
	<form on:submit|preventDefault={on_submit} class="form">
		<p>
			Book <b>{STUDIO_NAME}</b> for <b>{formatted_time}</b>
		</p>
		<input placeholder="First Name" type="text" bind:value={first_name} name="firstname" required />
		<input placeholder="Surname" type="text" bind:value={surname} name="surname" required />
		<input
			placeholder="Contact Email"
			type="email"
			bind:value={email_value}
			bind:this={email_element}
			name="email"
			required
		/>

		<Tel_input bind:phone_number_value />
		<Booking_form_hour_buttons
			{available_hours}
			{STUDIO_OPERATING_HOURS}
			{STUDIO_OPENING_HOUR}
			bind:is_checked
			bind:rate_multiplier
		/>

		<textarea placeholder="Additional notes" name="message" bind:value={message} />

		<hr />
		<Cost_summary bind:total_cost {HOURLY_RATE} {rate_multiplier} />
		<button type="submit" bind:this={submit_button} autocomplete="off" disabled="true"
			>Proceed to payment (£{decimal_currency_subunit_to_unit(total_cost)})</button
		>
	</form>
{/if}

<style>
	hr {
		width: 100%;
		height: 0.1vh;
		background-color: black;
		border-color: black;
		border-radius: 1rem;
	}

	p {
		word-wrap: normal;
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
