import { sql } from '@vercel/postgres';

export async function vercel_create_new_user() {
	await sql`INSERT INTO studigo-user-table VALUES ()`;
}

export async function vercel_save_refresh_token(token: string | null | undefined) {
	if (!token) {
		console.log('No refresh token, nothing to save');
		return;
	}

	const V = await sql`INSERT INTO studigo-user-table (refresh_token) VALUES (${token})`;
}
