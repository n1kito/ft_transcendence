import React from 'react';
import './App.css';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		errorElement: <Layout><div>Error ! Make a cute component.</div></Layout>,
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
