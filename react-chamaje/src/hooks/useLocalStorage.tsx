import { useState } from 'react';

// Define the type of the value that will be stored in local storage.
type StoredValue<T> = T | null;

// Custom hook to interact with browser's local storage.
// It allows reading and writing data in local storage with automatic synchronization to a state variable.
export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [StoredValue<T>, (value: T | ((prevValue: StoredValue<T>) => T)) => void] {
	// Define a state variable 'storedValue' to represent the value stored in local storage.
	// Initialize 'storedValue' with the value retrieved from local storage or the 'initialValue' if not found.
	const [storedValue, setStoredValue] = useState<StoredValue<T>>(() => {
		try {
			// Try to get the value from local storage using the provided 'key'.
			const item = window.localStorage.getItem(key);
			// If a value is found, parse it from JSON and use it as the initial state.
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			// If an error occurs during local storage access, log the error and use the 'initialValue' as the state.
			console.error('Error accessing local storage:', error);
			return initialValue;
		}
	});

	// Function to update the value in local storage and the state.
	const setValue = (value: T | ((prevValue: StoredValue<T>) => T)) => {
		try {
			// If 'value' is a function, call it with the current 'storedValue' to compute the new value to store.
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Update the state with the new value.
			setStoredValue(valueToStore);
			// Save the new value to local storage by converting it to JSON.
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			// If an error occurs during saving to local storage, log the error.
			console.error('Error saving to local storage:', error);
		}
	};

	// Return the stateful value and the function to set the value to provide access to the local storage data.
	return [storedValue, setValue];
}
