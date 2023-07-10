import React from 'react';
import './App.css';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Stickerparticles from './components/Stickerparticles/Stickerparticles';
import roadconeIcon from './images/ROADCONE.svg';
import DesktopIcon from './components/DesktopIcon/DesktopIcon';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		errorElement: (
			<Layout>
				<DesktopIcon name="Error :(" iconSrc={roadconeIcon} />
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
				element: <div>Desktop</div>,
			},
		],
	},
]);

function App() {
	return (
		<div className="App">
			<RouterProvider router={router} />
		</div>
	);
}

export default App;
