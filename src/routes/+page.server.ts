import { google_get_is_oauth_set } from '$lib/helpers/google/oauth_client';
import type { PageServerLoad } from './$types';

export const load = (({ url }) => {
	// TODO: Don't hard code these values
	return {
		path: url.pathname,
		is_oauth_set: google_get_is_oauth_set(),
		studio_opening_hour: 9,
		studio_operating_hours: 8,
		hourly_rate: 5500,
		studio_name: 'PHOTOMAFIA STUDIOS',
		cal_id: 'default'
	};
}) satisfies PageServerLoad;
