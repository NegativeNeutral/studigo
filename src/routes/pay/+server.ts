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

	const CONFIRM_TO_CUSTOMER = {
		from: 'FoundStu <booking-confirmed@foundstu.com>',
		to: DATA.customer_email,
		subject: 'You booked the Studio!',
		text: 'Thankyou for using FoundStu!',
		html: 'Thankyou for using FoundStu!'
	};

	const CONFIRM_TO_STUDIO = {
		from: 'FoundStu <booking-confirmed@foundstu.com>',
		to: DATA.studio_email,
		subject: 'You have a booking',
		text: 'Somebody booked your studio, well done on making loads of money!',
		html: 'Somebody booked your studio, well done on making loads of money!'
	};

	send_mail(CONFIRM_TO_CUSTOMER, (info) => {
		console.log(info);
	});

	send_mail(CONFIRM_TO_STUDIO, (info) => {
		console.log(info);
	});

	// TODO: Tidy this the fuck up, handle sending directly to me so I know what is booked when

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
