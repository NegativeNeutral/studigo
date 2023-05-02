import {
	google_get_is_oauth_set,
	google_get_calendar_api
} from '$lib/google_helpers/oauth_client';
import type { Cal_event } from '$lib/types';
import type { calendar_v3 } from 'googleapis';

const CALENDAR_API = google_get_calendar_api();

/**
 * This asynchronous function takes two RFC 3339 timestamps and a Google
 * Calendar ID, and returns an array of tuples containing the start time and
 * times of all of the events between the two timestamps, that exist on the
 * calendar with the provided calendar ID.
 * @param calID The ID of the Google Calendar to fetch the events from.
 * @param timeMin The time from which to start searching for calendar events.
 * @param timeMax The time from which to stop searching for calendar events.
 * @returns An array of tuples, each tuple containing the start and end time of
 * an event. Taking the form:
 * [
 * 	[event_1_start, event_1_end],
 * 	[event_2_start, event_2_end],
 * 	...
 * ]
 */
export async function google_get_event_times(
	calID: string,
	timeMin: string,
	timeMax: string
) {
	if (!google_get_is_oauth_set()) {
		console.log('No oauth!');
		// TODO: Handle this instance sensibly
		return [];
	}
	console.log(`Fetching ${timeMin} from Google API`);
	let events: calendar_v3.Schema$Event[] = [];

	try {
		events = await CALENDAR_API.events
			.list({
				calendarId: calID,
				timeMin: timeMin,
				timeMax: timeMax
			})
			.then((p) => {
				return p.data.items || [];
			});
	} catch {
		// TODO: Do something here - error with Google
		console.error('FUCK BALLS');
		return [['error', 'error']] as Cal_event[];
	}

	let times: Cal_event[] = [];

	events.forEach((item) => {
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
