import { json } from '@sveltejs/kit';
import { deconstruct_qps, convert_qps_to_studio_owner } from '$lib/helpers/helpers';
import { vercel_create_new_studio_owner } from '$lib/helpers/vercel/postgres_client';
import { studio_id_store } from '$lib/Store';

import type { RequestHandler } from './$types';

/**
 * The function that handles any GET requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const GET = (async (event) => {
	const QPS = convert_qps_to_studio_owner(deconstruct_qps(event.url));
	const STUDIO_ID = await vercel_create_new_studio_owner(QPS);

	if (STUDIO_ID > 0) {
		studio_id_store.set(STUDIO_ID);
		// TODO: using stores on the server is not thread safe. This store is global.
		// If there was multiple users trying to subscribe at once, we may enter race
		// conditions. We can't push state through the google oauth setup, so maybe
		// We could store this studio_id on the local machine as a cookie, quickly read
		// it upon navigating to google-oauth-landing and then send it back to the server
		// to add to the user, or we could get google oauth first and then handle user
		// creation. Either way this is not a suitable long term strategy. Stores
		// On the server is bad idea.
	} else {
		// TODO: Handle error
	}

	return json({ studio_id: STUDIO_ID });
}) satisfies RequestHandler;
