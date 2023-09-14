import React, { useEffect, useState } from 'react';
import ShadowWrapper from '../../../../../../Shared/ShadowWrapper/ShadowWrapper';
import './GameLocatingBadge.css';
import chucky from '../../../../../../Profile/Components/TargetBadge/images/roulette/chucky.jpg';
import norminet from '../../../../../../Profile/Components/TargetBadge/images/roulette/norminet.jpg';
import scream from '../../../../../../Profile/Components/TargetBadge/images/roulette/scream.jpg';
import sophie from '../../../../../../Profile/Components/TargetBadge/images/roulette/chucky.jpg';
import theRing from '../../../../../../Profile/Components/TargetBadge/images/roulette/the-ring.jpg';
import xavier from '../../../../../../Profile/Components/TargetBadge/images/roulette/xavier.jpg';

// TODO: this backgrounda animation might be better to do as a css transition loop
// however it's difficult to do it in css transitions since the /images/ location
// is not setup in

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
						backgroundImage: `url(${imagesArray[imageIndex]})`,
					}}
				></div>
			</div>
		</ShadowWrapper>
	);
};

export default GameLocatingBadge;
