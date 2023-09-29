export async function fetchFriends(accessToken: string) {
	const response = await fetch('/api/user/friends', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		credentials: 'include',
	});
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message);
	}

	const data = await response.json();
	return data.friends;
}

export async function addFriend(searchedLogin: string, accessToken: string) {
	const response = await fetch(`api/user/${searchedLogin}/add`, {
		method: 'PUT',
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

export async function deleteFriend(searchedLogin: string, accessToken: string) {
	const response = await fetch(`api/user/${searchedLogin}/delete`, {
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
