export type Cal_event = [string, string];

export type Google_cal_create_event = {
	title: string;
	description: string;
	cal_id: string;
	event_times: Cal_event;
};
