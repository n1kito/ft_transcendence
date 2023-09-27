/* ********************************************************************* */
/* ******************************* CHAT ******************************** */
/* ********************************************************************* */

export async function fetchChats(accessToken: string) {
	try {
		const response = await fetch('/api/user/me/chats', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else
			throw new Error('Something went wrong fetching private message rooms');
	}
}

export async function leaveChat(accessToken: string, chatId: number) {
	try {
		const response = await fetch('api/chat/leaveChat', {
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
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error('' + e.message);
		} else throw new Error('Something went wrong leaving chat');
	}
}

export async function getChatInfo(accessToken: string, chatId: number) {
	try {
		const response = await fetch('api/chat/chatInfo/' + chatId, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong');
	}
}

export async function blockUserQuery(accessToken: string, userId: number) {
	try {
		const response = await fetch('api/user/blockUser', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				userId: userId,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong');
	}
}

export async function unblockUserQuery(accessToken: string, userId: number) {
	try {
		const response = await fetch('api/user/unblockUser', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				userId: userId,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong');
	}
}

export async function getBlockedUsers(accessToken: string) {
	try {
		const response = await fetch('api/user/me/blockedUsers', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) {
			console.error('watsup');
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong');
	}
}
/* ********************************************************************* */
/* ***************************** CHANNELS ****************************** */
/* ********************************************************************* */

export async function fetchChannels(accessToken: string) {
	try {
		const response = await fetch('/api/user/me/chats', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong fetching channels');
	}
}

// creates a channel that is private by default
export async function createChannel(
	accessToken: string,
	channelName: string,
	password?: string,
) {
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
				isProtected: password ? true : false,
				name: channelName,
				isOwner: true,
				isAdmin: true,
				password: password || null,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong');
	}
}

export async function joinChannel(
	accessToken: string,
	channelName: string,
	password?: string,
) {
	try {
		const response = await fetch('api/chat/joinChannel', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				name: channelName,
				password: password || null,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			console.error(responseError.message);
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong joining channel');
	}
}

export async function inviteToChannelQuery(
	accessToken: string,
	channelId: number,
	secondUserId: number,
) {
	try {
		const response = await fetch('api/chat/invite', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				channelId: channelId,
				secondUserId: secondUserId,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			console.error(responseError.message);
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong joining channel');
	}
}

export async function makePrivate(
	accessToken: string,
	chatId: number,
	toPrivate: boolean,
) {
	try {
		const response = await fetch('api/chat/setPrivate', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				chatId: chatId,
				toPrivate: toPrivate,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong making private');
	}
}

export async function makeAdmin(
	accessToken: string,
	chatId: number,
	targetId: number,
) {
	try {
		const response = await fetch('api/chat/makeAdmin', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				chatId: chatId,
				targetId: targetId,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong making admin');
	}
}

export async function ban(
	accessToken: string,
	chatId: number,
	targetId: number,
) {
	try {
		const response = await fetch('api/chat/ban', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				chatId: chatId,
				targetId: targetId,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong banning user');
	}
}

export async function mute(
	accessToken: string,
	chatId: number,
	targetId: number,
) {
	try {
		const response = await fetch('api/chat/mute', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				chatId: chatId,
				targetId: targetId,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong muting user');
	}
}

export async function getAdminRights(accessToken: string, chatId: number) {
	try {
		const response = await fetch('/api/chat/getOwnAdminInfo/' + chatId, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			console.error('Error getting your admin informations: ' + e.message);
			throw new Error('' + e.message);
		} else
			throw new Error('Something went wrong getting your admin informations');
	}
}

export async function setNewPassword(
	accessToken: string,
	chatId: number,
	newPassword: string,
) {
	try {
		const response = await fetch('api/chat/setPassword', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				chatId: chatId,
				password: newPassword.length > 0 ? newPassword : null,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			console.log(responseError, responseError);
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			console.error('Error setting password: ' + e.message);
			throw new Error('' + e.message);
		} else throw new Error('Something went wrong setting password');
	}
}

export async function kick(
	accessToken: string,
	chatId: number,
	targetId: number,
) {
	try {
		const response = await fetch('api/chat/kick', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				chatId: chatId,
				targetId: targetId,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error('' + e.message);
		} else throw new Error('Something went wrong kicking the user');
	}
}

/* ********************************************************************* */
/* ************************* PRIVATE MESSAGES ************************** */
/* ********************************************************************* */

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
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else
			throw new Error('Something went wrong creating private message room');
	}
}

export async function findPrivateMessage(
	secondUserId: number,
	userId: number,
	accessToken: string,
) {
	try {
		if (secondUserId === userId) {
			throw new Error('Stop talking with yourself');
		}
		const response = await fetch(
			'api/chat/findPrivateMessage/' + secondUserId,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				credentials: 'include',
			},
		);
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong finding private message room');
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
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong fetching messages');
	}
}

export async function sendMessageQuery(
	accessToken: string,
	message: string,
	chatId: number,
	secondUserId?: number,
	isNotif?: string,
	targetId?: number,
	channelInvitation?: string,
) {
	try {
		console.log({
			message: message,
			chatId: chatId,
			userId: secondUserId,
			isNotif: isNotif,
			targetId: targetId,
			channelInvitation: channelInvitation,
		});
		const response = await fetch('/api/chat/sendMessage', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				message: message,
				chatId: chatId,
				userId: secondUserId,
				isNotif: isNotif,
				targetId: targetId,
				channelInvitation: channelInvitation,
			}),
		});
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong sending messages');
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
		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message);
		}
		return response.json();
	} catch (e) {
		if (e instanceof Error && typeof e.message === 'string') {
			throw new Error(e.message);
		} else throw new Error('Something went wrong finding user');
	}
}
