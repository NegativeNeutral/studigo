import { createKysely } from '@vercel/postgres-kysely';
import { env } from '$env/dynamic/private';
import { studio_id_store } from '$lib/Store';

interface Owners_table {
	studio_id: Generated<number>;
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

	const RES = await CLIENT.insertInto('studio_owners').values(INSERT).returning('studio_id').executeTakeFirst();
	return RES == undefined ? -1 : (RES.studio_id as number);
}

export async function vercel_save_refresh_token(token: string | null | undefined) {
	if (!token) {
		console.log('No refresh token, nothing to save');
		return;
	}

	let studio_id = 0;
	studio_id_store.subscribe((d) => (studio_id = d));

	const INSERT = {
		google_oauth_refresh_token: token
	};

	await CLIENT.updateTable('studio_owners').set(INSERT).where('studio_id', '=', studio_id).executeTakeFirst();
}
