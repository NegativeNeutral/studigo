import type { PageServerLoad } from './$types';
import { google_get_dates } from '$lib/google_helpers/oauth_client';

export const load = (({}) => {
	return {
		dates_code: google_get_dates()
	};
}) satisfies PageServerLoad;
