import type { PageServerLoad } from './$types';
import { get_google_auth_req_url } from '$lib/google_helpers/oauth_client';

export const load = (({ url }) => {
	return {
		google_auth_url: get_google_auth_req_url(),
		google_oauth_code: url.searchParams.get('code')
	};
}) satisfies PageServerLoad;
