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

// These are functions that will return a component passed as parameter depending on user authentification status
const ProtectedLogin = showComponentIfNotLoggedIn(Login);
const ProtectedDesktop = showComponentIfLoggedIn(Desktop);

function App() {
	return (
		<AuthContextProvider>
			<UserProvider>
				<div className="App">
					<BrowserRouter>
						<Layout>
							<Routes>
								<Route path="/" element={<ProtectedLogin />} />
								{/* <Route path="/desktop" element={<ProtectedDesktop />} />
								<Route path="/friends" element={<ProtectedDesktop />} /> */}
								<Route path="/desktop" element={<Desktop />} />
								<Route path="/friends" element={<Desktop />} />
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
