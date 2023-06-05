import { json } from '@sveltejs/kit';
import { deconstruct_qps } from '$lib/helpers/helpers';
import { vercel_create_new_user } from '$lib/helpers/vercel/postgres_client';

import type { RequestHandler } from './$types';

/**
 * The function that handles any GET requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const GET = (async (event) => {
	const QPS = deconstruct_qps(event.url);
	return json({ success: vercel_create_new_user(QPS) });
}) satisfies RequestHandler;
