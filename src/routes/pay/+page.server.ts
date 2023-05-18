import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { deconstruct_qps } from '$lib/helpers/helpers';
import type { PageServerLoad } from '../$types';

// initialize Stripe
const STRIPE = new Stripe(env.SECRET_STRIPE_KEY as string, {
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
	 * Enables automatic network retries with exponential back off, up to the specified number of retries (default 0).
	 * Impotency keys - https://stripe.com/docs/api/idempotent_requests - are added where appropriate to prevent duplication.
	 * @docs https://github.com/stripe/stripe-node#network-retries
	 */
	maxNetworkRetries: 5

	/**
	 * Specify the host to use for API Requests.
	 */
	// host?: string; // TODO: Define this
});

export const load = (async ({ url }) => {
	const QPS = deconstruct_qps(url);

	// create the payment intent
	const payment_intent = await STRIPE.paymentIntents.create({
		amount: 100, // TODO: Set dynamic amount
		currency: 'gbp',
		automatic_payment_methods: {
			enabled: true
		}
	});

	// return the clientSecret to the client
	return {
		client_secret: payment_intent.client_secret,
		amount: payment_intent.amount,
		studio_name: QPS.studio_name,
		cal_data: {
			cal_id: QPS.cal_id,
			start_time: QPS.start_time,
			end_time: QPS.end_time,
			description: QPS.description,
			title: QPS.title
		}
	};
}) satisfies PageServerLoad;
