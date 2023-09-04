import React, { useContext, useEffect, useState } from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import useAuth from '../../../../hooks/userAuth';
import { UserContext } from '../../../../contexts/UserContext';
import { io } from 'socket.io-client';

interface IFriendStruct {
	id: number;
	login: string;
	image: string;
	onlineStatus: boolean;
}
let nbOnline: number = 0;

const FriendsList = () => {
	const [friends, setFriends] = useState<IFriendStruct[]>([]);
	const { accessToken } = useAuth();
	const { userData } = useContext(UserContext);

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

	// listens for a 'userLoggedIn' message and compares its id with the id
	// of its friends to know which ones are connected
	// emits back a response so the friend that just connected knows the
	// current user is connected too
	useEffect(() => {
		const handleLoggedIn = (data: number) => {
			setFriends((prevFriends) =>
				prevFriends.map((friend) => {
					if (
						friend.id === data &&
						(friend.onlineStatus === false || friend.onlineStatus === undefined)
					) {
						nbOnline++;
						return { ...friend, onlineStatus: true };
					} else {
						return friend;
					}
				}),
			);
		};
		userData?.chatSocket?.onClientLogIn(handleLoggedIn);
	}, [userData]);

	// listens for a 'ClientLogInResponse' to check on connection which friends
	// were connected
	useEffect(() => {
		const handleLoggedInResponse = (data: number) => {
			setFriends((prevFriends) =>
				prevFriends.map((friend) => {
					if (
						friend.id === data &&
						(friend.onlineStatus === false || friend.onlineStatus === undefined)
					) {
						nbOnline++;
						return { ...friend, onlineStatus: true };
					} else {
						return friend;
					}
				}),
			);
		};
		userData?.chatSocket?.onClientLogInResponse(handleLoggedInResponse);
	}, [userData]);

	// listen for a `ClientLogOut` to
	useEffect(() => {
		const handleLoggedOut = (data: number) => {
			setFriends((prevFriends) =>
				prevFriends.map((friend) => {
					if (friend.id === data && friend.onlineStatus === true) {
						nbOnline--;
						return { ...friend, onlineStatus: false };
					} else {
						return friend;
					}
				}),
			);
		};
		userData?.chatSocket?.onLogOut(handleLoggedOut);
	}, [userData]);

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
			<div className="bottomInfo">
				{' '}
				{userData?.friends.length} friends, {nbOnline} online{' '}
			</div>
		</div>
	);
};

export default FriendsList;
