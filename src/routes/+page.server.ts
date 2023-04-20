import type { PageServerLoad } from './$types';
import {
	get_google_auth_req_url as google_get_auth_req_url,
	get_dates as google_get_dates
} from '$lib/google_helpers/oauth_client';

export const load = (({ url }) => {
	return {
		google_auth_url: google_get_auth_req_url(),
		google_oauth_code: url.searchParams.get('code'),
		dates_code: google_get_dates()
	};
}) satisfies PageServerLoad;
