import React, { useContext, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './Components/DesktopIcon/DesktopIcon';
import cupcakeIcon from './Components/DesktopIcon/images/CUPCAKE.svg';
import Window from '../Window/Window';
import { useNavigate } from 'react-router-dom';
import FriendsList from '../Friends/Components/FriendsList/FriendsList';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	const [openFriendsWindow, setOpenedFriendsWindows] = useState(false);
	const navigate = useNavigate();

	const friendsClickHandler = () => {
		setOpenedFriendsWindows(true);
		navigate('/friends');
	};

	return (
		<div className="desktopWrapper">
			<DesktopIcon
				name="Game"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Friends"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Chat"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			{/* {openFriendsWindow && <Window windowTitle="Friends"><FriendsList /></Window>}*/}
			<Window windowTitle="Friends" links={[{ name: 'Add friend', url: '#' }, { name: 'See online friends', url: '#' }, { name: 'Do something', url: '#' }]}>
				<FriendsList />
			</Window>
		</div>
	);
};

export default Desktop;
