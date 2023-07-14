<script lang="ts">
	export let people_coming: number;
</script>

<div>
	<label for="people_coming">People attending:</label>
	<input
		type="number"
		pattern="\d*"
		placeholder="1"
		on:keypress={(e) =>
			['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key) ? true : e.preventDefault()}
		bind:value={people_coming}
		id="people_coming"
		name="people_coming"
		required
	/>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		vertical-align: middle;
		border-radius: 1rem;
		align-content: stretch;
		border-color: black;
		border-style: solid;
		border-width: 1px;
		border-radius: 1rem;
		margin: 0.5rem;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
	}

	label {
		border-color: transparent;

		color: grey;
		font-style: italic;
		font-weight: bold;
		font-size: 0.8rem;
		width: max-content;

		text-indent: 7px;
		border-style: solid;
		padding-right: 7px;
		height: 1rem;
	}

	input {
		border-color: transparent;
		background-color: transparent;
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;

		width: 3rem;

		font-size: 0.9rem;
		height: 1rem;
		flex-grow: 1;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
