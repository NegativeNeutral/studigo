import { json } from '@sveltejs/kit';
import { google_create_event } from '$lib/helpers/google/calendar_client';
import { google_get_is_oauth_set } from '$lib/helpers/google/oauth_client';
import { send_mail } from '$lib/helpers/email/email';

import type { RequestHandler } from './$types';
import type { Cal_event } from '$lib/types';

/**
 * The function that handles POST requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const POST = (async (event) => {
	const DATA = await event.request.json();

	const START_DATE = new Date(DATA.start_time);
	const END_DATE = new Date(DATA.end_time);
	const booked_date = START_DATE.toLocaleDateString('en-GB', {
		timeZone: 'Europe/London',
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const start_time = START_DATE.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' });
	const end_time = END_DATE.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' });

	// TODO: Update messages & use HTML template
	const CUSTOMER_MESSAGE = `The booking is on ${booked_date}, starting at ${start_time} and ending at ${end_time}.

	${DATA.description}
	`;

	const STUDIO_MESSAGE = `The booking is on ${booked_date}, starting at ${start_time} and ending at ${end_time}.

	${DATA.description}
	`;

	const CONFIRM_TO_CUSTOMER = {
		from: 'FoundStu <booking-confirmed@foundstu.com>',
		to: DATA.customer_email,
		subject: 'You booked a studio!',
		text: CUSTOMER_MESSAGE,
		html: CUSTOMER_MESSAGE
	};

	const CONFIRM_TO_STUDIO = {
		from: 'FoundStu <booking-confirmed@foundstu.com>',
		to: DATA.studio_email,
		subject: DATA.title,
		text: STUDIO_MESSAGE,
		html: STUDIO_MESSAGE
	};

	send_mail(CONFIRM_TO_CUSTOMER, () => {});
	send_mail(CONFIRM_TO_STUDIO, () => {});

	const CAL_EVENT = {
		title: DATA.title,
		description: DATA.description,
		event_times: [DATA.start_time, DATA.end_time] as Cal_event,
		cal_id: DATA.cal_id
	};

	// If object is empty, return error
	if (!google_get_is_oauth_set()) {
		console.error('StudiGo: No OAuth configured!');
		// TODO: Figure out what is even returned
		return json({ resp: undefined }, { status: 501 });
	}

	return json({ resp: await google_create_event(CAL_EVENT) });
}) satisfies RequestHandler;
