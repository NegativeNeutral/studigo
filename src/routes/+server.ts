import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { google_get_dates } from '$lib/google_helpers/calendar_client';

/**
 * The function that handles any GET requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const GET = (async (event) => {
	const dateMin = event.url.searchParams.get('dateMin') || '';
	const dateMax = event.url.searchParams.get('dateMax') || '';
	let times = await google_get_dates(dateMin, dateMax);
	return json({ times: times });
}) satisfies RequestHandler;
