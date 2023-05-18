<script lang="ts">
	import { loadStripe } from '@stripe/stripe-js';
	import { env } from '$env/dynamic/public';
	import { decimal_currency_subunit_to_unit } from '$lib/helpers/helpers';
	import { Elements, PaymentElement } from 'svelte-stripe';
	import { onMount } from 'svelte';
	import type { Stripe, StripeElements } from '@stripe/stripe-js';

	import type { PageData } from './$types';
	import { construct_qps } from '$lib/helpers/helpers';
	export let data: PageData;

	let stripe: Stripe;
	let elements: StripeElements;

	/**
	 * Handles form submission.
	 * @param e The form submission event
	 */
	async function form_submit(e: SubmitEvent) {
		const result = await stripe.confirmPayment({
			elements,
			redirect: 'if_required'
		});

		if (result.error) {
			// TODO: Handle the Stripe API error events
			console.error(result.error);
			return;
		}

		let resp = await fetch('/confirm-booking', {
			method: 'POST',
			body: JSON.stringify(data.cal_data)
		});

		const QPS = {
			start_time: data.cal_data.start_time,
			end_time: data.cal_data.end_time,
			studio_name: data.studio_name
		};

		if (resp.status == 200) {
			window.location.assign(`/confirm-booking?${construct_qps(QPS)}`);
		} else {
			// TODO: Handle error - show toast?
		}
	}

	onMount(async () => {
		stripe = (await loadStripe(env.PUBLIC_STRIPE_KEY as string)) as Stripe;
	});
</script>

<h1>Please pay for your booking</h1>

{#if stripe && data.client_secret}
	<h2>The sum to pay is £{decimal_currency_subunit_to_unit(data.amount)}</h2>
	<form on:submit|preventDefault={form_submit}>
		<Elements {stripe} clientSecret={data.client_secret} bind:elements>
			<PaymentElement />
		</Elements>

		<button>Pay</button>
	</form>
{:else}
	<h2>Hang on we're loading here...</h2>
{/if}
