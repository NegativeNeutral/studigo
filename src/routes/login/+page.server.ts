import type { PageServerLoad } from './$types';
import { google_get_auth_req_url } from '$lib/google_helpers/oauth_client';

export const load = (({}) => {
	return {
		google_auth_url: google_get_auth_req_url()
	};
}) satisfies PageServerLoad;
