import { createAuth0Client } from '@auth0/auth0-spa-js';
import type { Auth0Client, PopupLoginOptions } from '@auth0/auth0-spa-js';
import { user, isAuthenticated, popupOpen } from '$lib/Store';

/**
 * Creates the Auth0 Client object
 * @returns A promise of the Auth0 Client Object
 */
async function create_client(auth0_domain: string, auth0_client_id: string) {
	const auth0_client = await createAuth0Client({
		domain: auth0_domain,
		clientId: auth0_client_id
	});

	return auth0_client;
}

/**
 * A function that allows logging in, creating the login window as a redirected tab.
 * @param client The Auth0 Client object
 * @param options Any additional login options. Empty by default.
 */
async function login_with_redirect(client: Auth0Client, options: PopupLoginOptions = {}) {
	popupOpen.set(true);
	try {
		await client.loginWithRedirect(options);

		user.set((await client.getUser()) as object);
		isAuthenticated.set(true);
	} catch (e) {
		console.error(e);
	} finally {
		popupOpen.set(false);
	}
}

/**
 * A function that allows logging in, creating the login window as a popup.
 * @param client The Auth0 Client object
 * @param options Any additional login options. Empty by default.
 */
async function login_with_popup(client: Auth0Client, options: PopupLoginOptions = {}) {
	popupOpen.set(true);
	try {
		await client.loginWithPopup(options);

		user.set((await client.getUser()) as object);
		isAuthenticated.set(true);
	} catch (e) {
		// eslint-disable-next-line
		console.error(e);
	} finally {
		popupOpen.set(false);
	}
}

/**
 * Logs out from Auth0 and removes all data.
 * @param client The Auth0 client to logout from.
 */
function logout(client: Auth0Client) {
	return client.logout({
		openUrl() {
			window.location.replace('/'); // TODO: Figure out how this works
		}
	});
}

const auth = {
	create_client: create_client,
	login_with_popup: login_with_popup,
	login_with_redirect: login_with_redirect,
	logout: logout
};

export default auth;
