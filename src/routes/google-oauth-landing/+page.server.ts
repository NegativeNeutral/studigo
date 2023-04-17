import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { set_google_oauth2_credentials } from '$lib/google_helpers/oauth_client';

export const load = (async ({ url }) => {
	let code = url.searchParams.get('code');
	if (code) {
		await set_google_oauth2_credentials(code);
	}

	// TODO: Save this to a database also
	// TODO: Sanitise this also

	throw redirect(302, '/');

	return {};
}) satisfies PageServerLoad;
