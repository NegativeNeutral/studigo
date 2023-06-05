import { createKysely } from '@vercel/postgres-kysely';
import { env } from '$env/dynamic/private';
import { obj_is_empty } from '$lib/helpers/helpers';

interface Owners_table {
	person_id: Generated<number>;
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
}

interface DB {
	studio_owners: Owners_table;
}

const CLIENT = createKysely<DB>({
	connectionString: env.POSTGRES_URL
});

export async function vercel_create_new_user(qps: { [key: string]: string }) {
	const INSERT = {
		first_name: qps.first_name,
		surname: qps.surname,
		studio_name: qps.studio_name,
		studio_address: qps.studio_address,
		studio_email: qps.email,
		studio_phone_number: qps.phone,
		studio_rate: parseInt(qps.studio_rate),
		studio_opening_hour: parseInt(qps.opening_hour),
		studio_operating_hours: parseInt(qps.operating_hours),
		google_oauth_refresh_token: '0'
	};

	const RES = await CLIENT.insertInto('studio_owners').values(INSERT).execute();

	return RES.every((r) => {
		obj_is_empty(r);
	});
}

export async function vercel_save_refresh_token(token: string | null | undefined) {
	if (!token) {
		console.log('No refresh token, nothing to save');
		return;
	}

	// TODO: STOP SQL INJECTIONS
	// await CLIENT.sql`INSERT INTO studigo-user-table (refresh_token) VALUES (${token})`;
}
