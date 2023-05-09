import { json } from '@sveltejs/kit';
import { google_get_event_times } from '$lib/google_helpers/calendar_client';
import { obj_is_empty } from '$lib/helpers/helpers';
import { google_get_is_oauth_set } from '$lib/google_helpers/oauth_client';

import type { RequestHandler } from './$types';
import type { Cal_event } from '$lib/types';

/**
 * The function that handles any GET requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const GET = (async (event) => {
	const calID = event.url.searchParams.get('calID') || '';
	const dateMin = event.url.searchParams.get('dateMin') || '';
	const dateMax = event.url.searchParams.get('dateMax') || '';
	let times: Cal_event[];

	// If object is empty, return error
	if (obj_is_empty(await google_get_is_oauth_set())) {
		console.error('StudiGo: No OAuth configured!');
		times = [['error', 'error']];
	} else {
		times = await google_get_event_times(calID, dateMin, dateMax);
	}

	return json({ times: times });
}) satisfies RequestHandler;
