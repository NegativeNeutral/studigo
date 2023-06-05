import { json } from '@sveltejs/kit';
import { google_create_event } from '$lib/helpers/google/calendar_client';
import { google_get_is_oauth_set } from '$lib/helpers/google/oauth_client';

import type { RequestHandler } from '../$types';
import type { Cal_event } from '$lib/types';

/**
 * The function that handles POST requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const POST = (async (event) => {
	const data = await event.request.json();

	const send = {
		title: data.title,
		description: data.description,
		event_times: [data.start_time, data.end_time] as Cal_event,
		cal_id: data.cal_id
	};

	// If object is empty, return error
	if (!google_get_is_oauth_set()) {
		console.error('StudiGo: No OAuth configured!');
		// TODO: Figure out what is even returned
		return json({ resp: undefined });
	} else {
		return json({ resp: await google_create_event(send) });
	}
}) satisfies RequestHandler;
