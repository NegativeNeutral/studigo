import Stripe from 'stripe';
import { SECRET_STRIPE_KEY } from '$env/static/private';

// initialize Stripe
const stripe = new Stripe(SECRET_STRIPE_KEY, {
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

// handle POST /create-payment-intent
export async function POST() {
	// create the payment intent
	const paymentIntent = await stripe.paymentIntents.create({
		amount: 2000,
		// note, for some EU-only payment methods it must be EUR
		currency: 'usd',
		// specify what payment methods are allowed
		// can be card, sepa_debit, ideal, etc...
		payment_method_types: ['card']
	});

	// return the clientSecret to the client
	return {
		body: {
			clientSecret: paymentIntent.client_secret
		}
	};
}
