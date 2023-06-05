<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let google_auth_url = data.google_auth_url;

	function on_submit() {
		const url_root = `${google_auth_url}`;
		const qps = '';
		window.location.assign(`${url_root}?${qps}`);
	}

	/* TODO:
	 * Create the database from the query page on the site
	 * Have this form read in all the data, and then write this data to the database
	 * Then redirect to the google grant permissions page
	 * Once google permissions are granted, write that data also to the database
	 * Configure the landing page to read from the database correctly
	 **/
</script>

<form on:submit|preventDefault={on_submit} style="text-align: center; display: flex; flex-direction: column">
	<label for="firstname">First Name(s):</label>
	<input type="text" name="firstname" required />

	<label for="surname">Surname:</label>
	<input type="text" name="surname" required />

	<label for="studio_name">Studio name:</label>
	<input type="text" name="studio_name" required />

	<label for="studio_address">Studio address:</label>
	<input type="text" name="studio_address" required />

	<label for="studio_rate">Studio hourly rate (in pounds):</label>
	<input type="text" name="studio_rate" required />

	<label for="email">Studio Contact Email:</label>
	<input type="email" name="email" required />

	<label for="phone">Studio Phone Number:</label>
	<input type="tel" name="phone" required />

	<div id="submit_row">
		<button type="submit">Submit</button>
	</div>
</form>
