import React from 'react';
import './App.css';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Stickerparticles from './components/Login/Components/Stickerparticles/Stickerparticles';
import roadconeIcon from './images/ROADCONE.svg';
import DesktopIcon from './components/Desktop/Components/DesktopIcon/DesktopIcon';
import Desktop from './components/Desktop/Desktop';
import { UserProvider } from './UserContext';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		errorElement: (
			<Layout>
				{/* <DesktopIcon name="Error :(" iconSrc={roadconeIcon} /> */}
			</Layout>
		),
		children: [
			{
				index: true,
				path: '/',
				element: <Login />,
			},
			{
				path: 'desktop',
				element: <Desktop />,
			},
			{
				path: 'friends',
				element: <Desktop />,
			},
		],
	},
]);

function App() {
	return (
		<UserProvider>
			<div className="App">
				<RouterProvider router={router} />
			</div>
		</UserProvider>
	);
}

export default App;
