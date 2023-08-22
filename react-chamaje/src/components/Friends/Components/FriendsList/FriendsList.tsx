import React, { useContext, useEffect, useState } from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import useAuth from '../../../../hooks/userAuth';
import { UserContext } from '../../../../contexts/UserContext';
import { io } from 'socket.io-client';

interface IFriendStruct {
	login: string;
	image: string;
	onlineStatus: boolean;
}

const FriendsList = () => {
	const [friends, setFriends] = useState<IFriendStruct[]>([]);
	const { accessToken } = useAuth();
	const userContext = useContext(UserContext);

	useEffect(() => {
		// TODO: instead of just storing them in a State, the user context should simply be updated so all other components that use it can be re-rendered (I think)
		// TODO: if the user is not auth the map method cannot iterate since the friends variable is not an array. Should not be an issue since only logged in users can access the desktop but it might be better to think ahead for this
		fetch('/api/user/friends', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => setFriends(data));

		}, []);

	useEffect(() => {
		const socket = io({ path: '/ws/'});
		socket.on('startedConnection', (data) => {
			console.log(friends);
			friends.map( (friend) => {
				console.log('🟢friend.login: ' + friend.login + 'VS data : ' + data);
				if (friend.login === data)
				{
					console.log('YOU FOUND YOUR FRIEND');
					friend.onlineStatus = true;
					setFriends(friends);
				}
			})
		})
	}, [friends])	

	return (
		<div>
			<div className="friendsList">
				{friends.map((friend, index) => (
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
			<div className="bottomInfo">3 friends, 1 online</div>
		</div>
	);
};

export default FriendsList;
