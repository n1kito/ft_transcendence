import { Socket, io } from "socket.io-client";
import { AuthContext } from "src/contexts/AuthContext";
import useAuth from "src/hooks/userAuth";


interface onUserLoggedInInterface {
    (data: any) : void;
}
class WebSocketService {
    private socket: Socket;
    // private jwt: string;
    private jwt: string;

	constructor(jwt: string) {

        const { accessToken } = useAuth()
		this.socket = io({ path: '/ws/' });
        
        try {
            // Listen for the 'connect' event
            this.socket.on('connect', () => {
                console.log('connected ! ', this.socket);
                this.sendConnectionToServer();
            });
        } catch (e) {
            console.error(e, ': WebSocketService Constructor');
        }
	}
    
    getSocket(): Socket {
        return this.socket;
    }

    // Does this need to be in constructor ?
    sendConnectionToServer() {
        try {
            this.socket.emit('connectionToServer', this.jwt);
        } catch (e) {
            console.error(e, ': WebSocketService sendConnectionToServer');
        }    
    }

    onUserLoggedIn(callback: onUserLoggedInInterface) {
		this.socket.on('userLoggedIn', callback);
        this.socket.emit('userLoggedInResponse', this.jwt);
    }

    onUserLoggedInResponse(callback: onUserLoggedInInterface) {
		this.socket.on('userLoggedInResponse', callback);
    }
}
export default WebSocketService;