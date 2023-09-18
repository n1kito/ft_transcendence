export async function findUserByLogin(login: string, accessToken: string) {
	try {
		const response = await fetch('api/user/byLogin/' + login, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Could not find user');
		return response.json();
	} catch (e) {
		console.error('Could not find user: ', e);
		throw new Error('' + e);
	}
}

// export async fetchFriend = async () => {
//     try {
//         const response = await fetch('/api/user/friends', {
//             method: 'GET',
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//             credentials: 'include',
//         });

//         if (response.ok) {
//             const data = await response.json();
//             return data.friends;
//         }
//     } catch (error) {
//         console.error('Error fetching friends:', error);
//         throw error; // Rethrow the error to handle it elsewhere if needed
//     }
// };
