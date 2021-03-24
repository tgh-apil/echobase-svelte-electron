import { writable } from 'svelte/store';

export const rootDirectory = writable('');
export const videoSource = writable('');
export const videoToEdit = writable('');
export const videoPathToEdit = writable('');
export const currentPage = writable('');