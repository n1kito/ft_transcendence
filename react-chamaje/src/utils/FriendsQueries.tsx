export async function fetchFriends(accessToken: string) {
	try {
		const response = await fetch('/api/user/friends', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});

		if (response.ok) {
			const data = await response.json();
			return data.friends;
			return response.json();
		}
	} catch (error) {
		throw error;
	}
}

export async function addFriend(searchedLogin: string, accessToken: string) {
	try {
		const response = await fetch(`api/user/${searchedLogin}/add`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		if (!response.ok) {
			const data = await response.json();
			console.warn('--------------', data);
			// alert(message);
			throw new Error(data.message);
		}
		// const data = await response.json();
		// console.warn(data);
		return response.json();
	} catch (error) {
		throw error;
	}
}
