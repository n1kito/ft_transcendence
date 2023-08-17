import React, { useEffect } from 'react';
import './App.css';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import io from 'socket.io-client';
import {
	BrowserRouter,
	// createBrowserRouter,
	Route,
	// Router,
	// RouterProvider,
	Routes,
	useNavigate,
} from 'react-router-dom';
import Desktop from './components/Desktop/Desktop';
import { UserProvider } from './contexts/UserContext';
import AuthContextProvider from './contexts/AuthContext';
import DesktopIcon from './components/Desktop/Components/DesktopIcon/DesktopIcon';
import roadconeIcon from './images/ROADCONE.svg';
import {
	showComponentIfLoggedIn,
	showComponentIfNotLoggedIn,
} from './utils/authUtils';
import RetrieveAccessToken from './components/RetrieveAccessToken/RetrieveAccessToken';
import { UserSocket } from './services/UserSocket';

// These are functions that will return a component passed as parameter depending on user authentification status
const ProtectedLogin = showComponentIfNotLoggedIn(Login);
const ProtectedDesktop = showComponentIfLoggedIn(Desktop);

function App() {
	// TODO: this is a test when using websockets, it will not stay here
	// useEffect(() => {
	// 	console.log('trying to setup socket connection');
	// 	const socket = io({ path: '/ws/' });

	// 	socket.on('connect', () => {
	// 		console.log('Connected to server ! 🔌🟢 ');
	// 		socket.emit('message', { message: 'Hellow from React !' });
	// 	});

	// 	socket.on('message', (data) => {
	// 		console.log('Response from server: ', data);
	// 	});
	// 	return () => {
	// 		socket.disconnect();
	// 	};
	// }, []);
	useEffect(() => {
		const statusUpdate = new UserSocket();
		statusUpdate.updateOnlineStatus(false);
	}, []);
	// end of the websocket test
	return (
		<AuthContextProvider>
			<UserProvider>
				<div className="App">
					<BrowserRouter>
						<Layout>
							<Routes>
								<Route path="/" element={<ProtectedLogin />} />
								<Route path="/desktop" element={<ProtectedDesktop />} />
								<Route path="/friends" element={<ProtectedDesktop />} />
								<Route
									path="/retrieve-token"
									element={<RetrieveAccessToken />}
								/>
								{/* <Route path="/" element={<Login />} />
								<Route path="/desktop" element={<Desktop />} />
								<Route path="/friends" element={<Desktop />} /> */}
								<Route
									path="*"
									element={
										<DesktopIcon name="Error :(" iconSrc={roadconeIcon} />
									}
								/>
							</Routes>
						</Layout>
					</BrowserRouter>
				</div>
			</UserProvider>
		</AuthContextProvider>
	);
}

export default App;

{
	/* <Route path="/" element={<ProtectedLogin />} />
								<Route path="/desktop" element={<ProtectedDesktop />} />
								<Route path="/friends" element={<ProtectedDesktop />} /> */
}
