import React from 'react';
import {
	BrowserRouter,
	// createBrowserRouter,
	Route,
	// Router,
	// RouterProvider,
	Routes,
} from 'react-router-dom';
import './App.css';
import DesktopIcon from './components/Desktop/Components/DesktopIcon/DesktopIcon';
import Desktop from './components/Desktop/Desktop';
import Layout from './components/Layout/Layout';
import Login from './components/Login/Login';
import RetrieveAccessToken from './components/RetrieveAccessToken/RetrieveAccessToken';
import AuthContextProvider from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { GameProvider } from './contexts/GameContext';
import IconContextProvider from './contexts/IconContext';
import { UserProvider } from './contexts/UserContext';
import { WindowProvider } from './contexts/WindowContext';
import roadconeIcon from './images/ROADCONE.svg';
import {
	showComponentIfLoggedIn,
	showComponentIfNotLoggedIn,
} from './utils/authUtils';

// These are functions that will return a component passed as parameter depending on user authentification status
const ProtectedLogin = showComponentIfNotLoggedIn(Login);
const ProtectedDesktop = showComponentIfLoggedIn(Desktop);

function App() {
	return (
		<AuthContextProvider>
			<UserProvider>
				<div className="App">
					<ChatProvider>
						<BrowserRouter>
							<GameProvider>
								<Layout>
									<IconContextProvider>
										<WindowProvider>
											<Routes>
												<Route path="/" element={<ProtectedLogin />} />
												<Route path="/desktop" element={<ProtectedDesktop />} />
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
																return;
															}}
														/>
													}
												/>
											</Routes>
										</WindowProvider>
									</IconContextProvider>
								</Layout>
							</GameProvider>
						</BrowserRouter>
					</ChatProvider>
				</div>
			</UserProvider>
		</AuthContextProvider>
	);
}

export default App;
