<script lang="ts">
	import { InlineCalendar, themes } from 'svelte-calendar';
	import type { PageData } from './$types';

	/**
		TODO: Call this domain on the API
		`https://www.googleapis.com/calendar/v3/calendars/${calendar_name}/events?orderBy=updated&timeMax=${start_of_day}&timeMin=${end_of_day}`
		`Authorization: Bearer ${YOUR_ACCESS_TOKEN}`
	**/

	export let data: PageData;

	const { dark: theme } = themes;
	const MONDAY = 1;
	const TODAY = new Date();
	const END = new Date();
	END.setMonth(END.getMonth() + 3);

	let store: any; // Hack
	$: selected = $store?.selected;

	let google_auth_url = data.google_auth_url;
</script>

<h1>Welcome to StudiGo</h1>

<a href={google_auth_url}>Sign into Google!</a>

<div style="display: flex; flex-direction: row">
	<InlineCalendar
		{theme}
		selected={TODAY}
		start={TODAY}
		end={END}
		startOfWeekIndex={MONDAY}
		bind:store
	/>

	<div style="background-color: grey">
		<p>{selected}</p>

		<div style="text-align: center; background-color: red">
			<h5>09:00</h5>
			<h5>10:00</h5>
			<h5>11:00</h5>
			<h5>12:00</h5>
			<h5>13:00</h5>
			<h5>14:00</h5>
			<h5>15:00</h5>
			<h5>16:00</h5>
		</div>
	</div>
</div>
