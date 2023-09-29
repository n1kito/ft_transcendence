/**************************************************************************************/
/* User                                                                   	          */
/**************************************************************************************/
export async function fetchUserData(accessToken: string) {
	const response = await fetch(`/api/user/${'me'}`, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message);
	}
	return response.json();
}
export async function fetchProfileData(
	searchedLogin: string,
	accessToken: string,
) {
	const response = await fetch(`/api/user/${searchedLogin}`, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data);
	}
	return response.json();
}

export async function deleteMyProfile(accessToken: string) {
	const response = await fetch('api/user/me/delete', {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message);
	}
	return response.json();
}
