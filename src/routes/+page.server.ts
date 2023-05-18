import { google_get_is_oauth_set } from '$lib/helpers/google/oauth_client';
import type { PageServerLoad } from './$types';

export const load = (({ url }) => {
	return {
		path: url.pathname,
		is_oauth_set: google_get_is_oauth_set()
	};
}) satisfies PageServerLoad;
