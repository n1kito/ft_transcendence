/**************************************************************************************/
/* User                                                                   	          */
/**************************************************************************************/
export async function fetchUserData(accessToken: string) {
	try {
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
	} catch (error) {}
}
export async function fetchProfileData(
	searchedLogin: string,
	accessToken: string,
) {
	try {
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
	} catch (error) {
		throw error;
	}
}

export async function deleteMyProfile(accessToken: string) {
	try {
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
	} catch (error) {
		throw error;
	}
}
