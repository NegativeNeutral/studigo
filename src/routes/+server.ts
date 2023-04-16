import { google } from 'googleapis';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

const oauth2Client = new google.auth.OAuth2({
	clientSecret: env.GCP_CLIENT_SECRET,
	clientId: env.GCP_CLIENT_ID,
	redirectUri: '/'
});

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = ['https://www.googleapis.com/auth/calendar.events'];

const url = oauth2Client.generateAuthUrl({
	// 'online' (default) or 'offline' (gets refresh_token)
	access_type: 'offline',

	// If you only need one scope you can pass it as a string
	scope: scopes
});

/** 
		TODO: Call this domain on the API
		`https://www.googleapis.com/calendar/v3/calendars/${calendar_name}/events?orderBy=updated&timeMax=${start_of_day}&timeMin=${end_of_day}`
		`Authorization: Bearer ${YOUR_ACCESS_TOKEN}`
	**/

export const GET = (async (event) => {
	return json({ url: url });
}) satisfies RequestHandler;
