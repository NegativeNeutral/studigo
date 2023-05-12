<script lang="ts">
	import { loadStripe } from '@stripe/stripe-js';
	import { env } from '$env/dynamic/public';
	import { Elements, PaymentElement } from 'svelte-stripe';
	import { onMount } from 'svelte';
	import type { Stripe, StripeElements } from '@stripe/stripe-js';
	import type { Google_cal_create_event } from '$lib/types';

	import type { PageData } from './$types';
	export let data: PageData;

	let stripe: Stripe;
	let elements: StripeElements;

	async function form_submit(e: SubmitEvent) {
		const result = await stripe.confirmPayment({
			elements,
			redirect: 'if_required'
		});

		if (result.error) {
			console.error('Booooo, error');
			console.error(result.error);
		} else {
			console.log('Yoooo it liked, worked');
			// TODO: Submit form to Google
		}
	}

	onMount(async () => {
		stripe = (await loadStripe(env.PUBLIC_STRIPE_KEY as string)) as Stripe;
	});
</script>

<h1>Please pay for your booking</h1>

{#if stripe && data.client_secret}
	<form on:submit|preventDefault={form_submit}>
		<Elements {stripe} clientSecret={data.client_secret} bind:elements>
			<PaymentElement />
		</Elements>

		<button>Pay</button>
	</form>
{:else}
	<h2>Hang on we're loading here...</h2>
{/if}
