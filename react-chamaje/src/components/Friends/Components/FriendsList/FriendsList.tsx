import React, { useEffect, useState } from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';

interface IFriendStruct {
	login: string;
	image: string;
}

const FriendsList = () => {
	const [friends, setFriends] = useState<IFriendStruct[]>([]);

	useEffect(() => {
		// TODO: instead of just storing them in a State, the user context should simply be updated so all other components that use it can be re-rendered (I think)
		fetch('http://localhost:3000/user/friends', {
			method: 'GET',
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => setFriends(data));
	}, []);

	return (
		<div>
			<div className="friendsList">
				{friends.map((friend, index) => (
					// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
					<FriendBadge
						key={index}
						badgeTitle={friend.login}
						badgeImageUrl={`http://localhost:3000${friend.image}`}
						onlineIndicator={true}
						clickable={true}
					/>
				))}
			</div>
			<div className="bottomInfo">3 friends, 1 online</div>
		</div>
	);
};

export default FriendsList;
