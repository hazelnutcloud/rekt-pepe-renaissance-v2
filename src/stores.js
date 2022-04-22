import { writable } from 'svelte/store';

export const shouldShowActions = writable(false);
export const appVersionIndex = writable(0);