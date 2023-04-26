import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * The function that handles any GET requests
 * @returns a Response object, containing a JSON object with the requested data
 */
export const POST = (async (event) => {
	// TODO: Fill this in
	return json({});
}) satisfies RequestHandler;
