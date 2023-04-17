import type { PageLoad } from './$types';

export const load = (({ url }) => {
	return {
		url: url.searchParams.get('code')
	};
}) satisfies PageLoad;
