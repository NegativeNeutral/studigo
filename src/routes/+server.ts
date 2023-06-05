import { json } from '@sveltejs/kit';
import { google_get_event_times } from '$lib/helpers/google/calendar_client';
import { deconstruct_qps } from '$lib/helpers/helpers';
import { google_get_is_oauth_set } from '$lib/helpers/google/oauth_client';

import type { RequestHandler } from './$types';
import type { Cal_event } from '$lib/types';

let is_first_load = true;

/**
 * The function that handles any GET requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const GET = (async (event) => {
	const QPS = deconstruct_qps(event.url);

	// If object is empty, return error
	if (!is_first_load && google_get_is_oauth_set()) {
		console.error('StudiGo: No OAuth configured!');
		return json({ times: [['error', 'error']] as Cal_event[] });
	}

	is_first_load = false;
	return json({ times: await google_get_event_times(QPS.cal_id, QPS.date_min, QPS.date_max) });
}) satisfies RequestHandler;
