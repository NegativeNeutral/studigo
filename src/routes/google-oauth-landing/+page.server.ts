import { redirect } from '@sveltejs/kit';
import { google_set_oauth2_credentials } from '$lib/google_helpers/oauth_client';

import type { PageServerLoad } from '../$types';

export const load = (async ({ url }) => {
	const OAUTH_CODE = url.searchParams.get('code');
	if (OAUTH_CODE) {
		await google_set_oauth2_credentials(OAUTH_CODE);
	}

	// TODO: If code is null, have sensible handling...
	throw redirect(302, '/');
}) satisfies PageServerLoad;
