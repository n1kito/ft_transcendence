async function refreshAccessToken(refreshToken: string): Promise<string> {
	try {
		console.log('function refreshAccessToken');
		const response = await fetch('http://localhost:3000/login/refresh-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				refreshToken,
			}),
			credentials: 'include', // request is sent with cookies
		});
		console.log('refreshAccessToken');
		const data = await response.json();
		const newAccessToken = data.accessToken;
		return newAccessToken;
	} catch (error) {
		throw new Error('Failed to refresh access token');
	}
}

export default refreshAccessToken;
