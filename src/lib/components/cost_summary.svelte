<script lang="ts">
	import { decimal_currency_subunit_to_unit } from '$lib/helpers/helpers';

	export let HOURLY_RATE: number;
	export let rate_multiplier: number;

	$: current_hourly_cost = HOURLY_RATE * rate_multiplier;

	export let total_cost = 0;

	function stripe_calculate_payment_fee(cost: number) {
		return cost * 0.015 + 20;
	}

	function studigo_calculate_payment_fee(cost: number) {
		return cost * 0.05;
	}

	$: total_cost =
		current_hourly_cost +
		stripe_calculate_payment_fee(current_hourly_cost) +
		studigo_calculate_payment_fee(current_hourly_cost);
</script>

<h4>Payment breakdown</h4>
<table>
	<tr>
		<td>Studio time</td>
		<td>(£{decimal_currency_subunit_to_unit(HOURLY_RATE)} × {rate_multiplier})</td>
		<td>£{decimal_currency_subunit_to_unit(HOURLY_RATE * rate_multiplier)}</td>
	</tr>
	<tr>
		<td>Payment fee</td>
		<td />
		<td>£{decimal_currency_subunit_to_unit(stripe_calculate_payment_fee(current_hourly_cost))}</td>
	</tr>
	<tr>
		<td>StudiGo fee</td>
		<td />
		<td>£{decimal_currency_subunit_to_unit(studigo_calculate_payment_fee(current_hourly_cost))}</td>
	</tr>
	<tr>
		<td>Total</td>
		<td />
		<td>£{decimal_currency_subunit_to_unit(total_cost)}</td>
	</tr>
</table>

<style>
	h4 {
    margin-top: 0.5rem;
		margin-bottom: 1rem;
	}

	table {
		margin-bottom: 1vh;
		align-self: center;
		border-collapse: collapse;
		border: none;
	}

	td,
	tr {
		border-collapse: collapse;
		border: none;
	}

	td:nth-child(1) {
		padding-left: 1vh;
		font-weight: bold;
		text-align: right;
	}

	td:nth-child(2) {
		color: grey;
		font-size: 0.7rem;
		vertical-align: bottom;
	}

	td:nth-child(3) {
		padding-left: 1vh;
		padding-right: 1vh;
		text-align: left;
	}

	tr:last-child {
		background-color: grey;
		font-size: 1.1rem;
	}

	tr:last-child > td:first-child {
		border-top-left-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}

	tr:last-child > td:last-child {
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;
	}
</style>
