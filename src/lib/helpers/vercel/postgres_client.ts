import { createKysely } from '@vercel/postgres-kysely';
import { env } from '$env/dynamic/private';
import { studio_id_store } from '$lib/Store';
import type { Studio_owner } from '$lib/types';

/**
 * An interface that defines the structure of the `studio_owners` table
 */
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

/**
 * An interface that defines the table in our Database
 */
interface DB {
	studio_owners: Owners_table;
}

/**
 * The Postgres client
 */
const CLIENT = createKysely<DB>({
	connectionString: env.POSTGRES_URL
});

/**
 * Creates a new entry in the `studio_owners` table.
 * @param qps The studio owner object to insert
 * @returns The primary key of the inserted studio owner
 */
export async function vercel_create_new_studio_owner(qps: Studio_owner) {
	console.log('Inserting new user into vercel...');
	const RES = await CLIENT.insertInto('studio_owners').values(qps).returning('studio_id').executeTakeFirst();
	return RES == undefined ? -1 : (RES.studio_id as number);
}

/**
 * Writes the Google OAuth refresh token to the last saved user.
 * @param token The token to write
 */
export function vercel_save_google_oauth_refresh_token(token: string | null | undefined) {
	if (!token) {
		console.log('No refresh token, nothing to save');
		return;
	}

	let studio_id = 0;
	studio_id_store.subscribe((d) => (studio_id = d));

	const INSERT = {
		google_oauth_refresh_token: token
	};

	CLIENT.updateTable('studio_owners').set(INSERT).where('studio_id', '=', studio_id).executeTakeFirst();
}

/**
 * Gets info from the `studio_owner` table based on the `studio_id` parameter.
 * @param studio_id The ID of the studio owner you want to find
 * @returns The `Studio_owner` object
 */
export async function vercel_get_studio_owner_info(studio_id: number) {
	console.log(`Fetching STUDIO_ID '${studio_id}'`);
	try {
		const RES = (await CLIENT.selectFrom('studio_owners')
			.selectAll()
			.where('studio_id', '=', `${studio_id}`)
			.executeTakeFirst()) as Studio_owner;
		console.log(`Fetched '${RES.studio_name}'`);
		return RES;
	} catch (e) {
		console.log('bugger!');
		return {} as Studio_owner;
	}
}

export async function vercel_get_all_studios() {
	const RES = await CLIENT.selectFrom('studio_owners').select(['studio_name', 'studio_id']).execute();
	console.log(RES);
	return RES;
}
