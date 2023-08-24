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
        this.socket = io({ path: '/ws/' });
        
        // const { accessToken }  = useAuth();
        // this.jwt = accessToken;
		try {
			// Listen for the 'connect' event
			this.socket.on('connect', () => {
				console.log('connected ! ', this.socket);
				this.sendConnectionToServer(login);
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
		this.socket.on('userLoggedInResponse', callback);
	}

    endConnection(data: string) {
        this.socket.emit('endedConnection', data);
        this.socket.off('handleLoggedIn')
        this.socket.off('handleLoggedInResponse')
        this.socket.disconnect();
    }

    onLogOut(callback: callbackInterface) {
        this.socket.on('onLogOut', callback);
    }
}
export default WebSocketService;
