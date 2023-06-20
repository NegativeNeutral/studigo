<script lang="ts">
	export let available_hours: boolean[];

	export let STUDIO_OPERATING_HOURS: number;
	export let STUDIO_OPENING_HOUR: number;

	let checkboxes = new Array<HTMLInputElement>(STUDIO_OPERATING_HOURS);

	export let is_checked = new Array<boolean>(STUDIO_OPERATING_HOURS).fill(false);
	export let rate_multiplier = 0;

	/**
	 * Updates the state of the checkboxes (whether they disabled or not) based on
	 * the state of the surrounding checkboxes. Image the checkboxes are a list:
	 * 1. Only the head, head -1, tail, and tail -1 checkboxes should be clickable
	 * 2. If no checkboxes are checked, every checkbox should be checkable
	 * 3. If an hour is unavailable, it should never be checkable
	 * 4. Checkboxes between the head and tail should never be checkable
	 * @param cs A boolean array indicating if a checkbox is clicked or not.
	 */
	function validate_buttons(cs: boolean[]) {
		let mul = 0;
		const BOXES_ARE_TICKED = cs.filter((v) => v == true).length;

		// Make some checkboxes unselectable
		if (BOXES_ARE_TICKED) {
			for (let i = 0; i < cs.length; i++) {
				checkboxes[i]?.setAttribute('disabled', 'true');
				mul += cs[i] ? 1 : 0;

				if (
					((cs[i + 1] && !cs[i]) || (cs[i] && !cs[i - 1]) || (!cs[i + 1] && cs[i]) || (!cs[i] && cs[i - 1])) &&
					available_hours[i]
				) {
					checkboxes[i]?.removeAttribute('disabled');
				}
			}
		}
		// Make all selectable BUT unavailable hours
		else {
			for (let i = 0; i < checkboxes.length; i++) {
				if (available_hours[i]) {
					checkboxes[i]?.removeAttribute('disabled');
				}
			}
		}

		rate_multiplier = mul;
	}

	// Runs when is_checked updates
	$: validate_buttons(is_checked);
</script>

<div class="checkbox_master">
	{#each available_hours as hour_is_available, i}
		<div class={hour_is_available ? 'hour_selector_free' : 'hour_selector_busy'}>
			<input
				type="checkbox"
				name={'checkbox_'.concat((i + STUDIO_OPENING_HOUR).toString())}
				disabled={!hour_is_available}
				bind:checked={is_checked[i]}
				bind:this={checkboxes[i]}
			/>
			<label
				class="checkbox_labels"
				for={(i + STUDIO_OPENING_HOUR).toString()}
				id={(i + STUDIO_OPENING_HOUR).toString()}
			>
				{(i + STUDIO_OPENING_HOUR).toString()}:00
			</label>
		</div>
	{/each}
</div>

<style>
	/**
	* CHECKBOXES
	*/
	.checkbox_master {
		border-color: black;
		border-style: solid;
		border-width: 1px;
		border-radius: 1rem;
		margin: 0.5rem;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;

		height: min-content;
		overflow: hidden;
	}

	.hour_selector_free,
	.hour_selector_busy {
		display: grid;
		grid-template: 1fr / 1fr;
		align-items: center;
		justify-items: center;
	}

	.hour_selector_free label,
	.hour_selector_busy label,
	.hour_selector_busy input,
	.hour_selector_free input {
		position: relative;
		grid-column: 1;
		grid-row: 1;
	}

	.hour_selector_free label,
	.hour_selector_busy label {
		z-index: 100;
		width: fit-content;
		pointer-events: none;
	}

	.hour_selector_busy input[type='checkbox'],
	.hour_selector_free input[type='checkbox'] {
		-webkit-appearance: none;
		appearance: none;
		background-color: white;
		margin: 0;

		transition: background-color 0.2s;

		font: inherit;
		color: currentColor;
		width: 100%;
		height: 2em;

		transform: translateY(-0.075em);

		display: grid;
		place-content: center;
	}

	input[type='checkbox']::before {
		content: '';
		transform: scale(0);
	}

	input[type='checkbox']:checked {
		background-color: green;
	}

	input[type='checkbox']:disabled {
		background-color: grey;
		cursor: default;
		/* box-shadow: inset 5px 5px 0 aqua; */
	}

	input[type='checkbox']:disabled + label {
		text-decoration-line: line-through;
	}

	.hour_selector_free > input[type='checkbox']:disabled:checked + label {
		text-decoration-line: none;
	}

	.hour_selector_busy label {
		text-decoration-line: line-through;
	}

	.hour_selector_free input[type='checkbox']:disabled:checked {
		background-color: purple;
	}

	.hour_selector_busy input[type='checkbox']:disabled {
		background-color: red;
		cursor: default;
	}

	@media (hover: hover) {
		input[type='checkbox']:enabled:hover {
			background-color: pink;
			cursor: grab;
		}

		input[type='checkbox']:enabled:checked:hover {
			background-color: darkgreen;
			cursor: grab;
		}
	}
</style>
