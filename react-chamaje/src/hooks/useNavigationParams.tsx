import { useLocation, useNavigate } from 'react-router-dom';

type UseNavigationParamsReturnType = {
	params: URLSearchParams;
	setNavParam: (name: string, value?: string) => void;
	resetNavParams: () => void;
	removeNavParam: (name: string) => void;
	getNavParam: (name: string) => string | null;
};

export const useNavigationParams = (): UseNavigationParamsReturnType => {
	const navigate = useNavigate();
	const location = useLocation();

	// Creates a URLSearchParams object given any existing query string that is
	// in the url
	const params = new URLSearchParams(location.search);

	// Function that gets called by any component that wants to update the URL
	// parameters
	const setNavParam = (name: string, value?: string) => {
		// Set the new parameters onto our URLSearchParams object
		params.set(name, value ?? '');
		// Navigate to the new URL
		navigate(`${location.pathname}?${params.toString()}`);
	};

	// Resets the parameters of the url and navigates to the home page
	const resetNavParams = () => {
		params.forEach((value, name) => {
			params.delete(name);
		});
		navigate(location.pathname);
	};

	const removeNavParam = (name: string) => {
		params.delete(name);
		// Navigate to the new URL
		navigate(`${location.pathname}?${params.toString()}`);
	};

	// Allows us to retrieve a parameter by name
	const getNavParam = (name: string): string | null => {
		return params.get(name);
	};

	// Return the URLSearchParams object so components can read current URL parameters
	// and can modify URL parameters with setParams()
	return { params, setNavParam, resetNavParams, removeNavParam, getNavParam };
};
