import { google_get_oauth_req_url } from '$lib/helpers/google/oauth_client';

import type { PageServerLoad } from './$types';

export const load = (() => {
	return {
		google_auth_url: google_get_oauth_req_url()
	};
}) satisfies PageServerLoad;
