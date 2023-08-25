import React, { useContext, useEffect, useState } from 'react';
import './TargetBadge.css';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import mysteryBox from './images/mysteryBox.png';
import chucky from './images/roulette/chucky.jpg';
import norminet from './images/roulette/norminet.jpg';
import scream from './images/roulette/scream.jpg';
import sophie from './images/roulette/sophie.jpg';
import theRing from './images/roulette/the-ring.jpg';
import xavier from './images/roulette/xavier.jpg';
import jee from './images/jee.jpeg';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';
import OnlineIndicator from '../Shared/OnlineIndicator/OnlineIndicator';
import { UserContext } from '../../../../contexts/UserContext';

const rouletteImages = [chucky, norminet, scream, sophie, theRing, xavier];

interface ITargetBadgeProps {
	isOwnProfile: boolean;
	targetLogin: string;
}

const TargetBadge: React.FC<ITargetBadgeProps> = ({
	isOwnProfile,
	targetLogin,
}) => {
	const [imageIndex, setImageIndex] = useState(0);
	const [badgeImage, setBadgeImage] = useState<string | undefined>(mysteryBox);
	const [badgeTitle, setBadgeTitle] = useState('Target');
	const [isAnimationRunning, setIsAnimationRunning] = useState(false);
	const [targetHasBeenAssigned, setTargetHasBeenAssigned] = useState(false);
	const [hasStartedRoulette, setHasStartedRoulette] = useState(false);
	const [isShaking, setIsShaking] = useState(false);
	const { userData, setUserData } = useContext(UserContext);

	// const rouletteImages = Object.values(rouletteImageImports);

	const updateBackgroundImage = () => {
		setImageIndex((prevIndex) => (prevIndex + 1) % rouletteImages.length);
	};

	const startRoulette = () => {
		setHasStartedRoulette(true); // Set to true when starting roulette
		setIsAnimationRunning(true);
		const endTime = Date.now() + 3000;
		const interval = 100;

		const updateLoop = () => {
			if (Date.now() < endTime) {
				updateBackgroundImage();
				setTimeout(updateLoop, interval);
			} else {
				// Roulette animation is complete, change badgeImage to your desired image here
				setTimeout(() => {
					setBadgeImage(userData?.targetImage || undefined);
					setBadgeTitle('Target');
					setIsAnimationRunning(false);
					setTargetHasBeenAssigned(true);
					// TODO: update user context to say the target has been already assigned
					// and the effect should not run again. But this does not work.
					// setUserData({
					// 	...userData,
					// 	targetHasBeenAssigned: true,
					// });
				}, 1000);
			}
		};

		updateLoop();
	};

	const handleClick = () => {
		if (!isAnimationRunning) {
			setBadgeTitle('Locating...');
			startRoulette();
		}
	};

	const openUserProfile = () => {
		console.log('this should open you targets profile');
	};

	useEffect(() => {
		setBadgeImage(rouletteImages[imageIndex]);
	}, [imageIndex, rouletteImages]);

	// Set the default badgeImage state when the component mounts
	useEffect(() => {
		setBadgeImage(mysteryBox);
	}, []);

	useEffect(() => {
		if (!hasStartedRoulette) {
			const shakeInterval = setInterval(() => {
				setIsShaking(true);
				const shakeDuration = 1000; // Shake for 1 seconds
				setTimeout(() => {
					setIsShaking(false);
				}, shakeDuration);
			}, 10000); // Start shaking every 10 seconds

			// Clean up interval on unmount or when hasStartedRoulette changes to true
			return () => clearInterval(shakeInterval);
		}
	}, [hasStartedRoulette]);

	return (
		<div
			onClick={
				targetHasBeenAssigned || !isOwnProfile ? openUserProfile : handleClick
			}
			className={`target-badge ${
				isAnimationRunning ? 'animationRunning' : ''
			} ${isShaking ? 'shake' : ''} ${
				targetHasBeenAssigned || !isOwnProfile ? 'black-badge-visible' : ''
			}`}
		>
			<FriendBadge
				isClickable={true}
				badgeTitle={badgeTitle}
				badgeImageUrl={badgeImage}
				onlineIndicator={targetHasBeenAssigned}
			/>
			{targetHasBeenAssigned && <BlackBadge>{targetLogin}</BlackBadge>}
		</div>
	);
};

export default TargetBadge;
