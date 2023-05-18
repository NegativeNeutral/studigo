import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

const GOOGLE_OAUTH2_CLIENT = new google.auth.OAuth2({
	clientSecret: env.GCP_CLIENT_SECRET,
	clientId: env.GCP_CLIENT_ID,
	redirectUri: env.GCP_REDIRECT_URL
});

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

/**
 * Retrieve the URL that allows users to grant permissions to read and write
 * their Google Calendars.
 * @returns The Google OAuth URL
 */
export function google_get_oauth_req_url() {
	const url = GOOGLE_OAUTH2_CLIENT.generateAuthUrl({
		access_type: 'offline', // offline gets refresh token always
		scope: SCOPES
	});

	return url;
}

/**
 * Identify if OAuth credentials are set.
 * @returns `true` if OAuth is set, otherwise `false`
 */
export function google_get_is_oauth_set() {
	return GOOGLE_OAUTH2_CLIENT.credentials;
}

/**
 * Set the Google OAuth credentials.
 * @param code The OAuth code returned once a user has granted permissions. Used
 * to generate OAuth tokens
 */
export async function google_set_oauth2_credentials(code: string) {
	const { tokens } = await GOOGLE_OAUTH2_CLIENT.getToken(code);
	GOOGLE_OAUTH2_CLIENT.setCredentials(tokens);
	// TODO: Save tokens.access_token & tokens.refresh_token to a database
}

/**
 * Clears any set OAuth credentials.
 */
export async function google_remove_oauth2_credentials() {
	GOOGLE_OAUTH2_CLIENT.revokeCredentials();
}

/**
 * Retrieve a reference to the Google Calendar API object.
 * @returns A reference to the Google Calendar API object.
 */
export function google_get_calendar_api() {
	return google.calendar({
		version: 'v3',
		auth: GOOGLE_OAUTH2_CLIENT
	});
}
