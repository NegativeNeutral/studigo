<script lang="ts">
	export let selected_start_time: Date;
	export let hour_is_free: boolean[];
	export let STUDIO_OPENING_HOUR: number;
</script>

<form
	style="text-align: center; background-color: grey; display: flex; flex-direction: column"
	action="/booking-submit"
	method="post"
>
	<h2>
		Book PHOTOMAFIA STUDIOS for {selected_start_time?.toLocaleDateString(
			'en-GB',
			{
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}
		)}
	</h2>
	<label for="name">Name:</label>
	<input type="text" id="name" name="name" required />

	<label for="email">Email:</label>
	<input type="email" id="email" name="email" required />

	<div style="display: flex; flex-direction: column; align-items: center">
		{#each hour_is_free as hour, i}
			<div style="display: flex; flex-direction: row">
				{#if hour}
					<input
						type="checkbox"
						name="hour_to_book"
						id={(i + STUDIO_OPENING_HOUR).toString()}
						value={(i + STUDIO_OPENING_HOUR).toString()}
					/>
					<label
						for={(i + STUDIO_OPENING_HOUR).toString()}
						style="background-color: green"
					>
						{(i + STUDIO_OPENING_HOUR).toString()}:00
					</label>
				{:else if !hour}
					<p style="background-color: red; margin: 0; padding: 0">
						{(i + STUDIO_OPENING_HOUR).toString()}:00
					</p>
				{/if}
			</div>
		{/each}
	</div>
	<label for="message">Additional notes:</label>
	<textarea id="message" name="message" />
	<button type="submit">Submit</button>
</form>
