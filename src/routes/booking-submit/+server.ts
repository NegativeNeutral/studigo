import { redirect, json } from '@sveltejs/kit';
import { google_create_event } from '$lib/google_helpers/calendar_client';
import type { RequestHandler } from './$types';

/**
 * The function that handles POST requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const POST = (async (event) => {
	const data = await event.request.json();

	let full_name = `${data.firstname} ${data.surname}`;

	let description = `<b>${full_name}</b> booked PHOTOMAFIA STUDIOS via the StudiGo app 🎉

Contact Phone Number: <b>${data.phone}</b>
Contact Email: <b>${data.email}</b>
${data.message ? `Their message: '<i>${data.message}</i>'` : 'They left no extra message 😔'}`;

	let send = {
		title: `BOOKING - ${full_name}`,
		description: description,
		event_times: data.event_times,
		cal_id: data.cal_id
	};

	let resp = await google_create_event(send);
	return json({ resp: resp });
	// throw redirect(302, '/booking-submit');
}) satisfies RequestHandler;
