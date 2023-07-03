import React, { useEffect } from 'react';
import './Background.css';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

const Background = () => {
	useEffect(() => {
		// select path and circle
		gsap.to('#circle1', {
			motionPath: {
				path: '#path-1',
				align: '#path-1',
				alignOrigin: [0.5, 0.5],
			},
			ease: 'none',
			duration: 60,
			repeat: -1,
		});
		gsap.to('#circle2', {
			motionPath: {
				path: '#path-2',
				align: '#path-2',
				alignOrigin: [0.5, 0.5],
			},
			ease: 'none',
			duration: 60,
			repeat: -1,
		});
		gsap.to('#circle3', {
			motionPath: {
				path: '#path-3',
				align: '#path-3',
				alignOrigin: [0.5, 0.5],
			},
			ease: 'none',
			duration: 60,
			repeat: -1,
		});
	});

	//
	return (
		<div id="bgwapper">
			<div id="noise"></div>
			<div id="blur"></div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="100ddvw"
				height="100dvh"
				viewBox="0 0 2044 1216"
				overflow="hidden"
				style={{ backgroundColor: '#aed0ff' }}
			>
				<g id="path1">
					<path
						id="path-1"
						data-name="path1"
						className="paths"
						d="m86.46,984.7C-2.75,864.52-167.87,279.23,491.41,330.97c659.28,51.73,223.46,585.54,592.61,734.86,369.15,149.32,803.73,82.3,886.45-210.46,0,0,116.05-467.96,55.56-590.24-60.5-122.28-623.48-475.01-853.11,123.46C943.28,987.05,411.16,1422.09,86.46,984.7Z"
					/>
				</g>
				<circle id="circle1" r="30rem" fill="#A757F8" />
				<circle id="circle2" r="30rem" fill="#F8576A" />
				<circle id="circle3" r="30rem" fill="#F8EF57" />
				<g id="path2">
					<path
						id="path-2"
						data-name="path2"
						className="paths"
						d="m540.03,51.62C711.39-1.44,1545.97-99.63,1472.2,292.45c-73.77,392.08-834.93,132.9-1047.85,352.43-212.92,219.54-117.36,477.99,300.11,527.18,0,0,667.27,69.02,841.64,33.04,174.36-35.98,677.33-370.79-176.04-507.36C536.67,561.18-83.66,244.73,540.03,51.62Z"
					/>
				</g>
				<g id="path3">
					<path
						id="path-3"
						data-name="path-3"
						className="paths"
						d="m1939.96,978.2c11.55,129.94-139.67,618.35-622.79,229.57-483.11-388.78,106.4-519.86-106.86-819.78C997.05,88.07,630.49-99.11,427.54,56.58c0,0-311.94,257.52-323.51,373.5-11.57,115.98,254.22,658.79,715.71,372.99,461.49-285.8,1078.19-297.77,1120.22,175.14Z"
					/>
				</g>
			</svg>
		</div>
	);
};

export default Background;
