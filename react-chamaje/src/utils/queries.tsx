/* ********************************************************************* */
/* ******************************* CHAT ******************************** */
/* ********************************************************************* */

export async function leaveChat(accessToken: string, chatId: number) {
	try {
		const response = await fetch('api/chat/leaveChannel', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				chatId: chatId,
			}),
		});
		if (!response.ok) throw new Error('Error leaving chat - response');
		return response.json();
	} catch (e) {
		console.error('Error leaving chat - queries catch: ', e);
		throw new Error('' + e);
	}
}

/* ********************************************************************* */
/* ***************************** CHANNELS ****************************** */
/* ********************************************************************* */

export async function fetchChannels(accessToken: string) {
	try {
		const response = await fetch('/api/user/me/channels', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Could not fetch channel rooms');
		return response.json();
	} catch (e) {
		console.error('Error fetching channel: ', e);
		throw new Error('' + e);
	}
}

// creates a channel that is private by default
export async function createChannel(accessToken: string, channelName: string) {
	try {
		const response = await fetch('api/chat/createChat/', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				isChannel: true,
				isPrivate: true,
				isProtected: false,
				name: channelName,
			}),
		});
		if (!response.ok) throw new Error('Error creating channel');
		return response.json();
	} catch (e) {
		console.error('Error creating channel: ' + e);
		throw new Error('' + e);
	}
}

export async function joinChannel(accessToken: string, channelName: string) {
	try {
	} catch (e) {
		console.error('Error joinning channel: ' + e);
		throw new Error('' + e);
	}
}

/* ********************************************************************* */
/* ************************* PRIVATE MESSAGES ************************** */
/* ********************************************************************* */

export async function fetchPrivateMessages(accessToken: string) {
	try {
		const response = await fetch('/api/user/me/privateMessages', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Could not fetch private message rooms');
		return response.json();
	} catch (e) {
		console.error('Error fetching private message rooms: ' + e);
		throw new Error('' + e);
	}
}

export async function createChatPrivateMessage(
	correspondantId: number,
	userId: number,
	accessToken: string,
) {
	try {
		if (correspondantId === userId) {
			throw new Error('Stop talking with yourself');
		}
		const response = await fetch('api/chat/createChat/', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				isChannel: false,
				isPrivate: true,
				isProtected: false,
				userId: correspondantId,
			}),
		});
		if (!response.ok) throw new Error('Error creating chat');
		return response.json();
	} catch (e) {
		console.error('Error creating private message room: ' + e);
		throw new Error('' + e);
	}
}

/* ********************************************************************* */
/* ***************************** MESSAGES ****************************** */
/* ********************************************************************* */
export async function fetchMessages(chatId: number, accessToken: string) {
	try {
		const response = await fetch('api/chat/chatMessages/' + chatId, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Could not fetch messages');
		return response.json();
	} catch (e) {
		console.error('Error fetching messages: ' + e);
		throw new Error('' + e);
	}
}

export async function sendMessageQuery(
	accessToken: string,
	message: string,
	chatId: number,
) {
	try {
		const response = await fetch('/api/chat/sendMessage', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({ message: message, chatId: chatId }),
		});
		if (!response.ok) {
			throw new Error('Could not send message');
		}

		// return response.json();
	} catch (e) {
		console.error('Error sending message: ' + e);
		throw new Error('' + e);
	}
}

/* ********************************************************************* */
/* ******************************* USER ******************************** */
/* ********************************************************************* */
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
