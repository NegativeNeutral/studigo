import { env } from '$env/dynamic/private';
import { google_get_is_oauth_set, google_refresh_oauth2 } from '$lib/helpers/google/oauth_client';
import { vercel_get_studio_owner_info } from '$lib/helpers/vercel/postgres_client';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const RES = await vercel_get_studio_owner_info(parseInt(env.PHOTOMAFIA_STUDIO_OWNER_ID as string));
	const REFRESH_TOKEN_IS_VALID = await google_refresh_oauth2(RES?.google_oauth_refresh_token);

	return {
		path: url.pathname,
		is_oauth_set: google_get_is_oauth_set() && REFRESH_TOKEN_IS_VALID,
		studio_opening_hour: RES?.studio_opening_hour,
		studio_operating_hours: RES?.studio_operating_hours,
		hourly_rate: RES?.studio_rate,
		studio_name: RES?.studio_name,
		cal_id: 'primary'
	};
}) satisfies PageServerLoad;
