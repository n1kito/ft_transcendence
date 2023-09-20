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

		// if (response.ok) {
		// 	const data = await response.json();
		// 	const mySocket = new WebSocketService(accessToken, data.id);
		// 	const updatedData = {
		// 		...data,
		// 		chatSocket: mySocket,
		// 	};
		// 	console.log('🍧 data:', data);
		// 	// Set the user data in the context
		// 	setUserData(updatedData);
		// 	setIsTwoFAEnabled(data.isTwoFactorAuthenticationEnabled);
		// } else {
		// 	logOut();
		// }
	} catch (error) {
		console.log('Error: ', error);
	}
}
