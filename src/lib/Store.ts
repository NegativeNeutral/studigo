import { writable } from 'svelte/store';

export const studio_id_store = writable(-1);

export const isAuthenticated = writable(false);
export const user = writable({});
export const popupOpen = writable(false);
export const error = writable();
