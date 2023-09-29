import React, { useEffect, useState } from 'react';
import ShadowWrapper from '../../../../../../Shared/ShadowWrapper/ShadowWrapper';
import './GameLocatingBadge.css';
import chucky from '../../../../../../Profile/Components/TargetBadge/images/roulette/chucky.jpg';
import norminet from '../../../../../../Profile/Components/TargetBadge/images/roulette/norminet.jpg';
import scream from '../../../../../../Profile/Components/TargetBadge/images/roulette/scream.jpg';
import sophie from '../../../../../../Profile/Components/TargetBadge/images/roulette/sophie.jpg';
import theRing from '../../../../../../Profile/Components/TargetBadge/images/roulette/the-ring.jpg';
import xavier from '../../../../../../Profile/Components/TargetBadge/images/roulette/xavier.jpg';

const GameLocatingBadge = () => {
	const [imageIndex, setImageIndex] = useState(0);

	const imagesArray = [chucky, norminet, scream, sophie, theRing, xavier];

	useEffect(() => {
		setTimeout(() => {
			setImageIndex(imageIndex == imagesArray.length - 1 ? 0 : imageIndex + 1);
		}, 500);
	}, [imageIndex]);

	return (
		<ShadowWrapper shadow={false} isClickable={false}>
			<div className="game-locating-badge-wrapper">
				<div
					className="game-locating-badge-background"
					style={{
						backgroundImage: `url(${imagesArray[0]})`,
						opacity: `${imageIndex >= 0 ? 1 : 0}`,
					}}
				></div>
				<div
					className="game-locating-badge-background"
					style={{
						backgroundImage: `url(${imagesArray[1]})`,
						opacity: `${imageIndex >= 1 ? 1 : 0}`,
					}}
				></div>
				<div
					className="game-locating-badge-background"
					style={{
						backgroundImage: `url(${imagesArray[2]})`,
						opacity: `${imageIndex >= 2 ? 1 : 0}`,
					}}
				></div>
				<div
					className="game-locating-badge-background"
					style={{
						backgroundImage: `url(${imagesArray[3]})`,
						opacity: `${imageIndex >= 3 ? 1 : 0}`,
					}}
				></div>
				<div
					className="game-locating-badge-background"
					style={{
						backgroundImage: `url(${imagesArray[4]})`,
						opacity: `${imageIndex >= 4 ? 1 : 0}`,
					}}
				></div>
				<div
					className="game-locating-badge-background"
					style={{
						backgroundImage: `url(${imagesArray[5]})`,
						opacity: `${imageIndex >= 5 ? 1 : 0}`,
					}}
				></div>
			</div>
		</ShadowWrapper>
	);
};

export default GameLocatingBadge;
