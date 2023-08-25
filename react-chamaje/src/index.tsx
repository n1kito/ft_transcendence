import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);
root.render(
	// <React.StrictMode>
	<>
		<App />
		{/* svg noise filter applied to the entire body element */}
		<svg className="filter-svg">
			<filter id="noise-filter">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="9"
					numOctaves="5"
					stitchTiles="stitch"
				/>
			</filter>
		</svg>
	{/* </React.StrictMode>, */}
	</>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
