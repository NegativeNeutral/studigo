export type Cal_event = [string, string];

export type Google_cal_create_event = {
	title: string;
	description: string;
	cal_id: string;
	event_times: Cal_event;
};

export type Studio_owner = {
	first_name: string;
	surname: string;
	studio_name: string;
	studio_address: string;
	studio_email: string;
	studio_phone_number: string;
	studio_rate: number;
	studio_opening_hour: number;
	studio_operating_hours: number;
	google_oauth_refresh_token: string;
};
