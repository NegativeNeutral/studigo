<script lang="ts">
	import { TelInput, normalizedCountries } from 'svelte-tel-input';
	import type { CountryCode, E164Number } from 'svelte-tel-input/types';

	export let phone_number_value: E164Number = '';
	let selected_country: CountryCode = 'GB';
	let phone_number_validity = true;
</script>

<div>
	<div class="select {!phone_number_validity ? 'invalid' : ''}">
		<select
			class={!phone_number_validity ? 'invalid' : ''}
			aria-label="Default select example"
			name="Country"
			bind:value={selected_country}
		>
			<option value={null} hidden={selected_country !== null}>Please select</option>
			{#each normalizedCountries as country (country.id)}
				<option
					value={country.iso2}
					selected={country.iso2 === selected_country}
					aria-selected={country.iso2 === selected_country}
				>
					{country.iso2} (+{country.dialCode})
				</option>
			{/each}
		</select>
	</div>

	<TelInput
		name="phone"
		bind:country={selected_country}
		bind:value={phone_number_value}
		bind:valid={phone_number_validity}
		class="basic-tel-input {!phone_number_validity && 'invalid'}"
		options={{
			autoPlaceholder: true,
			spaces: true,
			invalidateOnCountryChange: true
		}}
	/>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		vertical-align: middle;
		border-radius: 1rem;
		margin: 0.5rem;
	}

	.select {
		display: grid;

		cursor: grab;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
		text-align: right;
		font-size: 0.9rem;
		height: 1rem;
		text-indent: 5px;
		border-top-left-radius: 1rem;
		border-bottom-left-radius: 1rem;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		border: 1px solid;
		border-right: none;
		width: fit-content;
		margin: 0;
		align-items: center;
		padding: 1px;
	}

	.select::after {
		content: '';
		width: 0.8em;
		height: 0.5em;
		margin-right: 0.3em;
		background-color: grey;
		clip-path: polygon(100% 0%, 0 0%, 50% 100%);
		justify-self: end;
	}

	select,
	.select:after {
		grid-area: select;
	}

	select {
		appearance: none;
		background-color: transparent;
		border: none;
		padding: 0 1em 0 0;
		margin: 0;
		width: 100%;
		text-indent: 7px;
		font-family: inherit;
		cursor: inherit;
		line-height: inherit;
		font-size: 0.9rem;
		color: black;
	}

	div :global(.basic-tel-input::placeholder) {
		color: grey;
		font-style: italic;
		font-weight: bold;
		font-size: 0.8rem;
	}

	div :global(.basic-tel-input) {
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
		height: 1rem;
		text-indent: 3px;
		font-size: 0.9rem;
		flex-grow: 1;
		width: fit-content;
		padding: none;
		margin: none;
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
		border: 1px solid;
		outline: none;
	}

	div :global(.invalid) {
		border-color: red;
	}
</style>
