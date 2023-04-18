import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { set_google_oauth2_credentials } from '$lib/google_helpers/oauth_client';

export const load = (async ({ url }) => {
	let code = url.searchParams.get('code');
	if (code) {
		await set_google_oauth2_credentials(code);
	}

	// TODO: If code is null, have sensible handling...

	throw redirect(302, '/'); // TODO: Redirect to new route that allows selecting of calendar
}) satisfies PageServerLoad;
