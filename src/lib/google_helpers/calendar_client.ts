import { google_get_calendar_api } from '$lib/google_helpers/oauth_client';
import type { Cal_event, Google_cal_create_event } from '$lib/types';

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
export async function google_get_event_times(calID: string, timeMin: string, timeMax: string) {
	console.log(`Fetching ${timeMin} to ${timeMax} from Google API`);

	try {
		let events = await CALENDAR_API.events
			.list({
				calendarId: calID,
				timeMin: timeMin,
				timeMax: timeMax
			})
			.then((p) => {
				return p.data.items || [];
			});

		let times: Cal_event[] = [];

		events.forEach((item) => {
			times.push([
				item.start?.dateTime ? (item.start?.dateTime as string) : (item.start?.date as string),
				item.end?.dateTime ? (item.end?.dateTime as string) : (item.end?.date as string)
			]);
		});

		return times;
	} catch (e) {
		// Log the first line of the error
		console.error(`StudiGo: ${(e as string).match(/^.*$/m)![0]}`);
		return [['error', 'error']] as Cal_event[];
	}
}

/**
 * A function to create an event in a Google Calendar.
 * @param data An object containing all of the information needed to create the
 * event.
 * @returns The object returned from the Google API.
 */
export async function google_create_event(data: Google_cal_create_event) {
	console.log(`Creating event for ${data.event_times[0]} until ${data.event_times[1]} via Google API`);

	return await CALENDAR_API.events.insert({
		calendarId: data.cal_id,
		requestBody: {
			start: {
				dateTime: data.event_times[0]
			},
			end: {
				dateTime: data.event_times[1]
			},
			description: data.description,
			summary: data.title
		}
	});
}
