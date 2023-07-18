import { deconstruct_qps } from '$lib/helpers/helpers';
import type { PageServerLoad } from './$types';

export const load = (({ url }) => {
	const QPS = deconstruct_qps(url);

	const START_DATE = new Date(QPS.start_time);
	const END_DATE = new Date(QPS.end_time);

	return {
		booked_date: START_DATE.toLocaleDateString('en-GB', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}),
		start_time: START_DATE.toLocaleTimeString(),
		end_time: END_DATE.toLocaleTimeString(),
		studio_name: QPS.studio_name
	};
}) satisfies PageServerLoad;
