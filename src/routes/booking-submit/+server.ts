import { json } from '@sveltejs/kit';
import { obj_is_empty } from '$lib/helpers/helpers';
import { google_create_event } from '$lib/google_helpers/calendar_client';
import { google_get_is_oauth_set } from '$lib/google_helpers/oauth_client';

import type { RequestHandler } from './$types';

/**
 * The function that handles POST requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const POST = (async (event) => {
	const data = await event.request.json();

	const full_name = `${data.firstname} ${data.surname}`;
	const description = [
		`<b>${full_name}</b> booked PHOTOMAFIA STUDIOS via the StudiGo app 🎉`,
		``,
		`Contact Phone Number: <b>${data.phone}</b>`,
		`Contact Email: <b>${data.email}</b>`,
		`${data.message ? `Their message: '<i>${data.message}</i>'` : 'They left no extra message 😔'}`
	].join('\n');

	const send = {
		title: `BOOKING - ${full_name}`,
		description: description,
		event_times: data.event_times,
		cal_id: data.cal_id
	};

	// If object is empty, return error
	if (obj_is_empty(await google_get_is_oauth_set())) {
		console.error('StudiGo: No OAuth configured!');
		// TODO: Figure out what is even returned
		return json({ resp: undefined });
	} else {
		return json({ resp: await google_create_event(send) });
	}
}) satisfies RequestHandler;
