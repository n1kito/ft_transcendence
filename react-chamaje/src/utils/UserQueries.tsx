export async function fetchUserData(accessToken: string) {
	// Feth the user data from the server
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
	} catch (error) {
		console.log('Error: ', error);
	}
}
