/**
 * Determines if a JavaScript Object is empty or not.
 * @param obj Any JavaScript object
 * @returns `true` if `obj` is empty, else `false`
 */
export function obj_is_empty(obj: object) {
	return JSON.stringify(obj) === '{}';
}

/**
 * Extracts all query parameters from a URL string and returns them as an
 * object, where each query parameter key is an object key, and that
 * query parameters value fills the corresponding object key's value.
 * @param url A URL to extract the query parameters from
 * @returns An object containing a key-value mapping of the query parameters
 */
export function deconstruct_qps(url: URL) {
	const obj: { [key: string]: string } = {};

	for (const [k, v] of url.searchParams.entries()) {
		obj[k] = v;
	}

	return obj;
}

/**
 * Extracts all key-value pairs from an object and returns them as a query
 * parameter string, where each object key is an query parameter key, and that
 * object parameters value fills the corresponding query parameter key's value.
 * @param obj The object to extract the key-value pairs from
 * @returns A string, formatted as URL query parameters
 */
export function construct_qps(obj: object) {
	const array: string[] = [];

	for (const [k, v] of Object.entries(obj)) {
		array.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
	}

	return array.join('&');
}

/**
 * Builds the description string, to created in a calendar.
 * @param full_name The full name of the person who made the booking
 * @param studio_name The name of the studio that was booked
 * @param phone_number The phone number of the person who made the booking
 * @param email The email address of the person who made the booking
 * @param message [OPTIONAL] - An additional message left by the booker
 * @returns A string which has formatted all of the parameters into a reasonable
 * format.
 */
export function booking_description_builder(
	full_name: string,
	studio_name: string,
	phone_number: string,
	email: string,
	message = 'They left no extra message 😔'
) {
	return [
		`<b>${full_name}</b> booked ${studio_name} via the StudiGo app 🎉`,
		``,
		`Contact Phone Number: <b>${phone_number}</b>`,
		`Contact Email: <b>${email}</b>`,
		`Their message: '<i>${message === '' ? 'They left no extra message 😔' : message}</i>'`
	].join('\n');
}

/**
 * Takes in a number representing the lowest denomination of a decimal currency,
 * and returns a currency-formatted string of that value.
 *
 * For example, given an input of 5000, it will return "50.00".
 * @param num A number representing the lowest denomination of a currency. If we
 * were talking about the US currency, the input number represents cents: to get
 * a string formatted to appear as one dollar ("1.00") you must input 100.
 * @returns A currency-formatted string, always to 2 decimal places.
 */
export function decimal_currency_subunit_to_unit(num: number) {
	return (num / 100).toFixed(2);
}
