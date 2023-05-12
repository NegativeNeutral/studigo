import Stripe from 'stripe';
import { SECRET_STRIPE_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';

// initialize Stripe
const STRIPE = new Stripe(SECRET_STRIPE_KEY, {
	/**
	 * This library's types only reflect the latest API version.
	 *
	 * We recommend upgrading your account's API Version to the latest version
	 * if you wish to use TypeScript with this library.
	 *
	 * If you wish to remain on your account's default API version,
	 * you may pass `null` or another version instead of the latest version,
	 * and add a `@ts-ignore` comment here and anywhere the types differ between API versions.
	 *
	 * @docs https://stripe.com/docs/api/versioning
	 */
	apiVersion: '2022-11-15',

	/**
	 * Optionally indicate that you are using TypeScript.
	 * This currently has no runtime effect other than adding "TypeScript" to your user-agent.
	 */
	typescript: true,

	/**
	 * Enables automatic network retries with exponential backoff, up to the specified number of retries (default 0).
	 * Idempotency keys - https://stripe.com/docs/api/idempotent_requests - are added where appropriate to prevent duplication.
	 * @docs https://github.com/stripe/stripe-node#network-retries
	 */
	maxNetworkRetries: 5

	/**
	 * Specify the host to use for API Requests.
	 */
	// host?: string; // TODO: Define this
});

export const load = (async ({ url, fetch }) => {
	const cal_id = url.searchParams.get('cal_id') || '';
	const event_times = url.searchParams.get('event_times') || '';
	const description = url.searchParams.get('description') || '';
	const title = url.searchParams.get('title') || '';
	const full_name = url.searchParams.get('full_name') || '';

	console.log(`
cal_id = ${cal_id}
event_times = ${event_times}
description = ${description}
full_name = ${full_name}
title = ${title}
	`);

	// create the payment intent
	const payment_intent = await STRIPE.paymentIntents.create({
		amount: 100,
		currency: 'gbp',
		automatic_payment_methods: {
			enabled: true
		}
	});

	// return the clientSecret to the client
	return {
		client_secret: payment_intent.client_secret,
		cal_data: {
			cal_id: cal_id,
			event_times: event_times,
			description: description,
			full_name: full_name,
			title: title
		}
	};
}) satisfies PageServerLoad;
