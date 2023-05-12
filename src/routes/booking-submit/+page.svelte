<script lang="ts">
	import { loadStripe } from '@stripe/stripe-js';
	import { env } from '$env/dynamic/public';
	import { Elements, PaymentElement } from 'svelte-stripe';
	import { onMount } from 'svelte';
	import type { Stripe, StripeElements } from '@stripe/stripe-js';

	import type { PageData } from './$types';
	export let data: PageData;

	let cal = data.cal_data;

	let stripe: Stripe;
	let elements: StripeElements;

	onMount(async () => {
		stripe = (await loadStripe(env.PUBLIC_STRIPE_KEY as string)) as Stripe;
	});
</script>

<h1>You booked the date!</h1>

<a href="/">Back to main page</a>

{#if stripe && data.client_secret}
	<Elements {stripe} clientSecret={data.client_secret} bind:elements>
		<PaymentElement />
	</Elements>
{/if}
