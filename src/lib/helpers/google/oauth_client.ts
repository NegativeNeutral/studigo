import { google } from 'googleapis';
import { env } from '$env/dynamic/private';
import { vercel_save_google_oauth_refresh_token } from '$lib/helpers/vercel/postgres_client';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const GOOGLE_OAUTH2_CLIENT = new google.auth.OAuth2({
	clientSecret: env.GCP_CLIENT_SECRET,
	clientId: env.GCP_CLIENT_ID,
	redirectUri: env.GCP_REDIRECT_URL
});

GOOGLE_OAUTH2_CLIENT.forceRefreshOnFailure = true;

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
	console.log('Checking if OAuth is set');
	return !!GOOGLE_OAUTH2_CLIENT.credentials;
}

/**
 * Set the Google OAuth credentials. If a refresh_token is generated, save this
 * to long term storage.
 * @param code The OAuth code returned once a user has granted permissions. Used
 * to generate OAuth tokens
 */
export async function google_set_oauth2_credentials(code: string) {
	const { tokens } = await GOOGLE_OAUTH2_CLIENT.getToken(code);
	vercel_save_google_oauth_refresh_token(tokens.refresh_token);
	GOOGLE_OAUTH2_CLIENT.setCredentials(tokens);
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

/**
 * Refreshes the OAuth access token, using the refresh token.
 * @param refresh_token The OAuth2 refresh token, stored in the `studio_owners`
 * table
 * @returns `True` if oauth is set, else `false`
 */
export async function google_refresh_oauth2(refresh_token: string | undefined) {
	if (refresh_token == undefined) {
		await GOOGLE_OAUTH2_CLIENT.refreshAccessToken();
		return google_get_is_oauth_set();
	}

	GOOGLE_OAUTH2_CLIENT.setCredentials({ refresh_token: refresh_token });
	const OUT = await GOOGLE_OAUTH2_CLIENT.refreshAccessToken();
	GOOGLE_OAUTH2_CLIENT.setCredentials({ refresh_token: refresh_token, access_token: OUT.credentials.access_token });
	return google_get_is_oauth_set();
}
