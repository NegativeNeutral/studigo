import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

const GOOGLE_OAUTH2_CLIENT = new google.auth.OAuth2({
	clientSecret: env.GCP_CLIENT_SECRET,
	clientId: env.GCP_CLIENT_ID,
	redirectUri: env.GCP_REDIRECT_URL
});

let is_oauth_set = false;

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export function google_get_oauth_req_url() {
	const url = GOOGLE_OAUTH2_CLIENT.generateAuthUrl({
		access_type: 'offline', // offline gets refresh token always
		scope: SCOPES
	});

	return url;
}

export function google_get_is_oauth_set() {
	return is_oauth_set;
}

export async function google_set_oauth2_credentials(code: string) {
	const { tokens } = await GOOGLE_OAUTH2_CLIENT.getToken(code);
	GOOGLE_OAUTH2_CLIENT.setCredentials(tokens);
	is_oauth_set = true;
	// TODO: Save tokens.access_token & tokens.refresh_token to a database
}

export function google_get_calendar_api() {
	return google.calendar({
		version: 'v3',
		auth: GOOGLE_OAUTH2_CLIENT
	});
}
