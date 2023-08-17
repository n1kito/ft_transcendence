import React from 'react';
import './Stickerparticles.css';
import { useCallback } from 'react';
import Particles from 'react-particles';
import type { Container, Engine } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';
import niktaSticker from './nikita.png';
import omerSticker from './omer.png';

const Stickerparticles = () => {
	const particlesInit = useCallback(async (engine: Engine) => {
		await loadFull(engine);
	}, []);

	const particlesLoaded = useCallback(
		async (container: Container | undefined) => {
			// await console.log(container);
		},
		[],
	);
	return (
		<Particles
			id="tsparticles"
			init={particlesInit}
			loaded={particlesLoaded}
			options={{
				// background: {
				// 	color: {
				// 		value: '#0d47a1',
				// 	},
				// },
				fpsLimit: 120,
				interactivity: {
					events: {
						onClick: {
							enable: true,
							mode: 'push',
						},
						// onHover: {
						// 	enable: true,
						// 	mode: 'repulse',
						// },
						resize: true,
					},
					modes: {
						push: {
							quantity: 1,
						},
						repulse: {
							distance: 200,
							duration: 2,
						},
					},
				},
				particles: {
					color: {
						value: '#ffffff',
					},
					// links: {
					// 	color: '#ffffff',
					// 	distance: 150,
					// 	enable: true,
					// 	opacity: 0.5,
					// 	width: 1,
					// },
					collisions: {
						enable: true,
						overlap: {
							enable: false,
							retries: 5, // Adjust the number of collision retries as needed
						},
					},
					// collisions: {
					// 	enable: false,
					// },
					move: {
						enable: true,
						speed: 8, // Adjust the speed as needed
						direction: 'none',
						random: false,
						straight: false,
						outModes: {
							default: 'bounce', // Make the particles bounce off the canvas edges
						},
					},
					number: {
						// density: {
						// 	enable: true,
						// 	area: 800,
						// },
						value: 1,
					},
					rotate: {
						random: {
							enable: true,
							minimumValue: 0,
						},
						value: 0,
						animation: {
							enable: true,
							speed: 1,
							decay: 0,
							sync: true,
						},
						direction: 'random',
						path: false,
					},
					opacity: {
						value: 1,
					},
					shape: {
						type: 'image',
						options: {
							image: [
								{
									src: niktaSticker,
								},
								{
									src: omerSticker,
								},
							],
						},
					},
					size: {
						value: 70,
					},
				},
				detectRetina: true,
			}}
		/>
	);
};

export default Stickerparticles;
