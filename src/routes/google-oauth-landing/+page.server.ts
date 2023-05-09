import { redirect } from '@sveltejs/kit';
import { google_set_oauth2_credentials } from '$lib/google_helpers/oauth_client';

import type { PageServerLoad } from '../$types';

export const load = (async ({ url }) => {
	let code = url.searchParams.get('code');
	if (code) {
		await google_set_oauth2_credentials(code);
	}

	// TODO: If code is null, have sensible handling...

	throw redirect(302, '/'); // TODO: Redirect to new route that allows selecting of calendar
}) satisfies PageServerLoad;
