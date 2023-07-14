import { redirect } from '@sveltejs/kit';
import { google_set_oauth2_credentials } from '$lib/helpers/google/oauth_client';
import { deconstruct_qps } from '$lib/helpers/helpers';

import type { PageServerLoad } from '../$types';

export const load = (async ({ url }) => {
	const QPS = deconstruct_qps(url);
	console.log(QPS);
	if (QPS.code) {
		await google_set_oauth2_credentials(QPS.code);
	}

	// TODO: If code is null, have sensible handling...
	throw redirect(302, '/');
}) satisfies PageServerLoad;
