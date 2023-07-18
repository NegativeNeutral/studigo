import { vercel_get_all_studios } from '$lib/helpers/vercel/postgres_client';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const O = vercel_get_all_studios();
	return { all_studios: O };
}) satisfies PageServerLoad;
