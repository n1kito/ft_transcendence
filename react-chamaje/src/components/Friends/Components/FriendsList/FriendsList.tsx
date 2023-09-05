import React, { useContext, useEffect, useState } from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import useAuth from '../../../../hooks/userAuth';
import { UserContext } from '../../../../contexts/UserContext';
import { io } from 'socket.io-client';
import Window from 'src/components/Window/Window';
import { IFriendStruct } from 'src/components/Desktop/Desktop';

interface IFriendsListProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	nbFriendsOnline: number;
}


const FriendsList: React.FC<IFriendsListProps> = (props) => {
	

	return (
		<Window
			windowTitle="Friends"
			onCloseClick={props.onCloseClick}
			key="friends-list-window"
			windowDragConstraintRef={props.windowDragConstraintRef}
		>
			<div className="friendsList">
				{props.friends.map((friend, index) => (
					// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
					<FriendBadge
						key={index}
						badgeTitle={friend.login}
						badgeImageUrl={`http://localhost:3000${friend.image}`}
						onlineIndicator={friend.onlineStatus}
						isClickable={true}
					/>
				))}
			</div>
			<div className="bottomInfo">
				{' '}
				{props.friends.length} friends, {props.nbFriendsOnline} online{' '}
			</div>
		</Window>
	);
};

export default FriendsList;
