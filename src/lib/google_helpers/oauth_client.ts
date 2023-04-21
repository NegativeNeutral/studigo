import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

const GOOGLE_OAUTH2_CLIENT = new google.auth.OAuth2({
	clientSecret: env.GCP_CLIENT_SECRET,
	clientId: env.GCP_CLIENT_ID,
	redirectUri: env.GCP_REDIRECT_URL
});

const CALENDAR_API = google.calendar({
	version: 'v3',
	auth: GOOGLE_OAUTH2_CLIENT
});

let is_oauth_set = false;

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export function google_get_auth_req_url() {
	const url = GOOGLE_OAUTH2_CLIENT.generateAuthUrl({
		access_type: 'offline', // offline gets refresh token always
		scope: SCOPES
	});

	return url;
}

export async function google_set_oauth2_credentials(code: string) {
	const { tokens } = await GOOGLE_OAUTH2_CLIENT.getToken(code);
	GOOGLE_OAUTH2_CLIENT.setCredentials(tokens);
	is_oauth_set = true;
	// TODO: Save tokens.access_token & tokens.refresh_token to a database
}

export async function google_get_dates(timeMin: string, timeMax: string) {
	if (is_oauth_set) {
		console.log('Fetching dates from Google API');

		let api_out = await CALENDAR_API.events.list({
			calendarId: 'lawrencewarren2@gmail.com',
			timeMin: timeMin,
			timeMax: timeMax
		});

		let events = api_out.data.items;
		let times: [string, string][] = [];

		events?.forEach((item) => {
			// TODO; If whole day is blocked out, item.start & item.date ONLY have date, not dateTime - handle it!
			times.push([
				item.start?.dateTime as string,
				item.end?.dateTime as string
			]);
		});

		return times;
	} else {
		console.log('No oauth!');
		// TODO: Handle this instance - hide resources
		return [];
	}
}

/**
		TODO: Call this domain on the API
		`https://www.googleapis.com/calendar/v3/calendars/${calendar_name}/events?orderBy=updated&timeMax=${start_of_day}&timeMin=${end_of_day}`
		`Authorization: Bearer ${YOUR_ACCESS_TOKEN}`
	**/
