import { error } from 'console';

export async function fetchUserData(accessToken: string) {
	// Feth the user data from the server
	try {
		// user/me
		const response = await fetch('/api/user/me', {
			method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		if (response.ok) {
			return response;
			// const data = await response.json();
			// console.log(data);
			// // Set the user data in the context
			// const mySocket = new WebSocketService(data.login);
			// const updatedData = {
			//     ...data,
			//     chatSocket: mySocket,
			// };
			// setUserData(updatedData);

			// const socket = io({ path: '/ws/' });

			// On connection, sends to the server a 'connectionToServer'
			// message with its login so the server tells everyone a new
			// user just connected
			// socket.on('connect', () => {
			// 	console.log('\nConnected to server ! 🔌🟢\n ');
			// 	socket.emit('connectionToServer', data.login);
			// });

			// socket.on('startedConnection', (data) => {
			// 	console.log(data);
			// })

			// socket.on('message', (data) => {
			// 	console.log('Response from server: ', data);
			// });
		} else {
			// logOut();
			throw response;
		}
	} catch (error) {
		console.log('Error: ', error);
	}
}
