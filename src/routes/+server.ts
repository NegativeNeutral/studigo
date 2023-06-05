import { json } from '@sveltejs/kit';
import { google_get_event_times } from '$lib/helpers/google/calendar_client';
import {  deconstruct_qps } from '$lib/helpers/helpers';
import { google_get_is_oauth_set } from '$lib/helpers/google/oauth_client';

import type { RequestHandler } from './$types';
import type { Cal_event } from '$lib/types';

/**
 * The function that handles any GET requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const GET = (async (event) => {
	const QPS = deconstruct_qps(event.url);
	let times: Cal_event[];

	// If object is empty, return error
	if (await google_get_is_oauth_set()) {
		console.error('StudiGo: No OAuth configured!');
		times = [['error', 'error']];
	} else {
		times = await google_get_event_times(QPS.cal_id, QPS.date_min, QPS.date_max);
	}

	return json({ times: times });
}) satisfies RequestHandler;
