import React, { MouseEventHandler, useEffect } from 'react';
import './DesktopIcon.css';
import { useIconContext } from '../../../../contexts/IconContext';

export interface IconProps {
	name: string;
	iconSrc: string;
	id: number;
	onDoubleClick: React.MouseEventHandler<HTMLDivElement>;
}

const DesktopIcon: React.FC<IconProps> = ({
	name,
	iconSrc,
	id,
	onDoubleClick,
}) => {
	let displayName = name;
	if (displayName.length > 8) displayName = name.slice(0, 8) + '...';

	const { selectedIcon, setSelectedIcon } = useIconContext();

	const isSelected = selectedIcon === id;

	const handleSingleClick = () => {
		setSelectedIcon(id);
	};

	const handleDoubleClick = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>,
	) => {
		onDoubleClick(event);
		setSelectedIcon(-1);
	};

	// TODO: issue with this code is that an event listener is added to the document element for each icon
	useEffect(() => {
		const handleClickOutsideOfIcon = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!isSelected && !target.closest('.desktopIconWrapper')) {
				setSelectedIcon(-1);
			}
		};

		// Add event listener to the document when the component mounts
		document.addEventListener('click', handleClickOutsideOfIcon);

		// Cleanup the event listener when the component unmounts
		return () => {
			document.removeEventListener('click', handleClickOutsideOfIcon);
		};
	}, [isSelected, setSelectedIcon]);

	return (
		<div
			className={`desktopIconWrapper ${isSelected ? 'selected-icon' : ''}`}
			title={name}
			onClick={handleSingleClick}
			onDoubleClick={handleDoubleClick}
		>
			<img src={iconSrc} draggable={false}></img>
			<span>{displayName}</span>
		</div>
	);
};

export default DesktopIcon;
