import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

const GOOGLE_OAUTH2_CLIENT = new google.auth.OAuth2({
	clientSecret: env.GCP_CLIENT_SECRET,
	clientId: env.GCP_CLIENT_ID,
	redirectUri: env.GCP_REDIRECT_URL
});

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export function get_google_auth_req_url() {
	const url = GOOGLE_OAUTH2_CLIENT.generateAuthUrl({
		// 'online' (default) or 'offline' (gets refresh_token)
		access_type: 'offline',

		// If you only need one scope you can pass it as a string
		scope: SCOPES
	});

	return url;
}

export async function set_google_oauth2_credentials(code: string) {
	const { tokens } = await GOOGLE_OAUTH2_CLIENT.getToken(code);
	GOOGLE_OAUTH2_CLIENT.setCredentials(tokens);
	// TODO: Save tokens.access_token & tokens.refresh_token to a database
}

/**
		TODO: Call this domain on the API
		`https://www.googleapis.com/calendar/v3/calendars/${calendar_name}/events?orderBy=updated&timeMax=${start_of_day}&timeMin=${end_of_day}`
		`Authorization: Bearer ${YOUR_ACCESS_TOKEN}`
	**/
