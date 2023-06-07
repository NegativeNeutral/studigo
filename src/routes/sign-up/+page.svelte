<script lang="ts">
	import type { PageData } from './$types';
	import { construct_qps } from '$lib/helpers/helpers';

	export let data: PageData;
	let google_auth_url = data.google_auth_url;

	async function on_submit(e: SubmitEvent) {
		const FD = new FormData(e.target as HTMLFormElement);
		let data: { [key: string]: FormDataEntryValue } = {};

		for (let [k, v] of FD) {
			switch (k) {
				case 'studio_opening_hour':
					data[k] = parseInt(v as string).toString();
					break;
				case 'studio_closing_hour':
					const v2 = parseInt(FD.get('studio_opening_hour') as string);
					const v1 = parseInt(v as string);
					const vF = v1 - v2;
					if (vF <= 1) {
						// TODO: Give visual feedback in this case
						return;
					}
					data['studio_operating_hours'] = vF.toString();
					break;

				default:
					data[k] = v;
					break;
			}
		}

		const URL = `sign-up?${construct_qps(data)}`;
		let p = await fetch(URL, { method: 'GET' }); // promise
		let o = await p.json();

		if (o.studio_id > 0) {
			window.location.assign(`${google_auth_url}`);
		} else {
			// TODO: Give feedback onscreen about failure, do not proceed
		}
	}
</script>

<form on:submit|preventDefault={on_submit} style="text-align: center; display: flex; flex-direction: column">
	<label for="first_name">First Name(s):</label>
	<input type="text" name="first_name" required />

	<label for="surname">Surname:</label>
	<input type="text" name="surname" required />

	<label for="studio_name">Studio Name:</label>
	<input type="text" name="studio_name" required />

	<label for="studio_address">Studio Address:</label>
	<input type="text" name="studio_address" required />

	<label for="studio_rate">Studio Hourly Rate (in pounds):</label>
	<input type="text" name="studio_rate" required />

	<label for="studio_email">Studio Contact Email:</label>
	<input type="email" name="studio_email" required />

	<label for="studio_phone_number">Studio Phone Number:</label>
	<input type="tel" name="studio_phone_number" required />

	<label for="studio_opening_hour">Studio Opening Hour (24h):</label>
	<input type="text" name="studio_opening_hour" required />

	<label for="studio_closing_hour">Studio Closing Hour (24h):</label>
	<input type="text" name="studio_closing_hour" required />

	<div id="submit_row">
		<button type="submit">Submit</button>
	</div>
</form>
