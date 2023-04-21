import {
	google_get_is_oauth_set,
	google_get_calendar_api
} from '$lib/google_helpers/oauth_client';

const CALENDAR_API = google_get_calendar_api();

export async function google_get_dates(timeMin: string, timeMax: string) {
	if (google_get_is_oauth_set()) {
		console.log('Fetching dates from Google API');

		let events = await CALENDAR_API.events
			.list({
				calendarId: 'lawrencewarren2@gmail.com',
				timeMin: timeMin,
				timeMax: timeMax
			})
			.then((p) => { return p.data.items; });

		let times: [string, string][] = [];

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
	} else {
		console.log('No oauth!');
		// TODO: Handle this instance
		return [];
	}
}
