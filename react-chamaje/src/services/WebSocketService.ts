import { Socket, io } from 'socket.io-client';
import { AuthContext } from 'src/contexts/AuthContext';
import useAuth from 'src/hooks/userAuth';

interface callbackInterface {
	(data: any): void;
}
class WebSocketService {
	private socket: Socket;
	
	// private jwt: string;

	constructor(login: string) {
		console.log('\n\n CREATING SOCKET FOR ', login);
		this.socket = io({
			path: '/ws/',
			reconnection: false }) 

		// const { accessToken }  = useAuth();
		// this.jwt = accessToken;
		try {
			// Listen for the 'connect' event
			this.socket.on('connect', () => {
				console.log('connected ! ', this.socket);
				this.sendConnectionToServer(login);
			});

			this.socket.on("disconnect", (reason) => {

				console.log('REASON:', reason);
				if (reason != "io client disconnect" && reason != "io server disconnect") {
				
				  // the disconnection was initiated by the server, you need to reconnect manually
				  this.socket.connect();
				}
				else
					this.socket.disconnect();
				// else the socket will automatically try to reconnect
			  });
		} catch (e) {
			console.error(e, ': WebSocketService Constructor');
		}
	}

	getSocket(): Socket {
		return this.socket;
	}

	// Does this need to be in constructor ?
	sendConnectionToServer(data: string) {
		try {
			this.socket.emit('connectionToServer', data);
		} catch (e) {
			console.error(e, ': WebSocketService sendConnectionToServer');
		}
	}

	onUserLoggedIn(callback: callbackInterface, login: string) {
		this.socket.on('userLoggedIn', (data: string) => {
			callback(data);
			this.socket.emit('userLoggedInResponse', login);
		});
		console.log('onUserLoggedIn - login: ' + login);
	}

	onUserLoggedInResponse(callback: callbackInterface) {
		console.log('onUserLoggedInResponse');
		console.log('🔴🔴 SOCKET: ', this.socket);

		this.socket.on('userLoggedInResponse', callback);
	}

	endConnection(data: string) {
		console.log('endConnection ', data);
		this.socket.emit('endedConnection', data);
		this.socket.off('handleLoggedIn');
		this.socket.off('handleLoggedInResponse');
		// this.socket.disconnect();
	}
	
	onLogOut(callback: callbackInterface) {
		this.socket.on('onLogOut', callback);
	}
	
	// listenDisconnect(reason: string){
	// this.socket.on("disconnect", (reason) => {

	// 	console.log('REASON:', reason);
	// 	if (reason != "io client disconnect") {
	// 	  // the disconnection was initiated by the server, you need to reconnect manually
	// 	  this.socket.connect();
	// 	}
	// 	// else the socket will automatically try to reconnect
	//   });
	// }
}
export default WebSocketService;
