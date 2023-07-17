import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load = (async () => {
	return { auth0_domain: env.AUTH0_DOMAIN, auth0_client_id: env.AUTH0_CLIENT_ID };
}) satisfies PageServerLoad;
