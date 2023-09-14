import React, { useContext, useEffect, useRef, useState } from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import useAuth from '../../../../hooks/userAuth';
import { UserContext } from '../../../../contexts/UserContext';
import { io } from 'socket.io-client';
import Window from 'src/components/Window/Window';
import { IFriendStruct } from 'src/components/Desktop/Desktop';
import Profile from 'src/components/Profile/Profile';

interface IFriendsListProps {
	onCloseClick: () => void;
	onBadgeClick: (friendLogin: string) => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	nbFriendsOnline: number;
}

const FriendsList: React.FC<IFriendsListProps> = ({
	friends,
	nbFriendsOnline,
	onCloseClick,
	windowDragConstraintRef,
	onBadgeClick,
}) => {
	return (
		<Window
			windowTitle="Friends"
			onCloseClick={onCloseClick}
			key="friends-list-window"
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<div className="friendsList">
				{friends.map((friend, index) => (
					// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
					<FriendBadge
						key={index}
						badgeTitle={friend.login}
						badgeImageUrl={`http://localhost:3000${friend.image}`}
						onlineIndicator={friend.onlineStatus}
						isClickable={true}
						onClick={() => {
							alert(friend.login);
							onBadgeClick(friend.login);
						}}
					/>
				))}
			</div>
			<div className="bottomInfo">
				{' '}
				{friends.length} friends, {nbFriendsOnline} online{' '}
			</div>
		</Window>
	);
};

export default FriendsList;
