<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>You've booked {data.studio_name} 🎉</h1>
<h3>You have the space booked on the {data.booked_date}, from {data.start_time} until {data.end_time}</h3>
<h4><i>Have fun!</i></h4>
<a href="/">Back to StudiGo</a>
