import React from 'react';
import './App.css';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
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
import IconContextProvider from './contexts/IconContext';
import { GameProvider } from './contexts/GameContext';

// These are functions that will return a component passed as parameter depending on user authentification status
const ProtectedLogin = showComponentIfNotLoggedIn(Login);
const ProtectedDesktop = showComponentIfLoggedIn(Desktop);

function App() {
	return (
		<AuthContextProvider>
			<UserProvider>
				<div className="App">
					<BrowserRouter>
						<GameProvider>
							<Layout>
								<IconContextProvider>
									<Routes>
										<Route path="/" element={<ProtectedLogin />} />
										{/* <Route path="/desktop" element={<ProtectedDesktop />} /> */}
										{/* <Route path="/friends" element={<ProtectedDesktop />} /> */}
										{/* <Route path="/" element={<Login />} /> */}
										<Route path="/desktop" element={<Desktop />} />
										{/* <Route path="/friends" element={<Desktop />} /> */}
										<Route
											path="/retrieve-token"
											element={<RetrieveAccessToken />}
										/>
										<Route
											path="*"
											element={
												<DesktopIcon
													name="Error :("
													id={-1}
													iconSrc={roadconeIcon}
													onDoubleClick={() => {
														/* TODO: redirect to the homepage ? */
													}}
												/>
											}
										/>
									</Routes>
								</IconContextProvider>
							</Layout>
						</GameProvider>
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
