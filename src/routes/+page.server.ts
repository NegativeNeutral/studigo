import type { PageServerLoad } from './$types';


export const load = (({url}) => {
  
	return {
		path: url.pathname
	};
}) satisfies PageServerLoad;
