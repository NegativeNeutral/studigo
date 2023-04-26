import {
	google_get_is_oauth_set,
	google_get_calendar_api
} from '$lib/google_helpers/oauth_client';
import type { Cal_event } from '$lib/types';

const CALENDAR_API = google_get_calendar_api();

export async function google_get_dates(timeMin: string, timeMax: string) {
	if (!google_get_is_oauth_set()) {
		console.log('No oauth!');
		// TODO: Handle this instance sensibly
		return [];
	}
	console.log(`Fetching ${timeMin} from Google API`);

	let events = await CALENDAR_API.events
		.list({
			calendarId: 'lawrencewarren2@gmail.com', // TODO: Custom calendar ID
			timeMin: timeMin,
			timeMax: timeMax
		})
		.then((p) => {
			return p.data.items;
		});

	let times: Cal_event[] = [];

	events?.forEach((item) => {
		times.push([
			item.start?.dateTime
				? (item.start?.dateTime as string)
				: (item.start?.date as string),
			item.end?.dateTime
				? (item.end?.dateTime as string)
				: (item.end?.date as string)
		]);
	});

	return times;
}

export async function google_create_event(timeMin: string, timeMax: string) {
	if (!google_get_is_oauth_set()) {
		console.log('No oauth!');
		// TODO: Handle this instance sensibly
		return;
	}

	console.log(`Creating Google Calendar event from ${timeMin} to ${timeMax}`);

	// TODO: Fill this out properly
	let idk = await CALENDAR_API.events.insert({
		calendarId: 'lawrencewarren2@gmail.com',
		requestBody: {
			start: {
				date: timeMin
			},
			end: {
				date: timeMax
			}
		}
	});
}
