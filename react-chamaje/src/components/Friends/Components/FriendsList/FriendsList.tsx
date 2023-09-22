import React, { useContext, useEffect, useRef, useState } from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import useAuth from '../../../../hooks/userAuth';
import { UserContext } from '../../../../contexts/UserContext';
import { io } from 'socket.io-client';
import Window from 'src/components/Window/Window';
import { IFriendStruct } from 'src/components/Desktop/Desktop';
import Profile from 'src/components/Profile/Profile';
import SettingsWindow from 'src/components/Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Title from 'src/components/Profile/Components/Title/Title';
import InputField from 'src/components/Profile/Components/InputField/InputField';
import Button from 'src/components/Shared/Button/Button';
import { addFriend, fetchFriends } from 'src/utils/FriendsQueries';

interface IFriendsListProps {
	onCloseClick: () => void;
	onBadgeClick: (friendLogin: string) => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	setFriends: React.Dispatch<React.SetStateAction<IFriendStruct[]>>;
	nbFriendsOnline: number;
}

const FriendsList: React.FC<IFriendsListProps> = ({
	friends,
	nbFriendsOnline,
	onCloseClick,
	windowDragConstraintRef,
	onBadgeClick,
	setFriends,
}) => {
	const { userData, updateUserData } = useContext(UserContext);
	const { accessToken } = useAuth();
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [searchedLogin, setSearchedLogin] = useState('');
	const [searchUserError, setSearchUserError] = useState('');
	const [isFriendAdded, setIsFriendAdded] = useState(false);

	// input validation before sending request
	const handleLoginChange = (username: string) => {
		setSearchedLogin(username);
		// allowed characters for username
		const usernameRegex = /^[A-Za-z0-9-_\\.]*$/;
		// if input is empty set error to prevent sending useless requests
		if (!username) setSearchUserError(' ');
		// check if username is valid
		else if (!usernameRegex.test(username))
			return setSearchUserError('only letters and numbers');
		// wait until minimun length before sending request
		else if (username.length < 4) setSearchUserError(' ');
		else {
			setSearchUserError('');
		}
	};

	// on `Add Friend` button click, send request to add
	// `searchedLogin` as friend.
	const handleAddFriend = async () => {
		addFriend(searchedLogin, accessToken)
			.then(async (data) => {
				setSettingsPanelIsOpen(false);
				// check if friend to be added is not already in the friends list
				if (!friends.some((friend) => friend.login === data.login)) {
					// create friend object for <IFriendStruct>
					const newFriend = {
						id: data.id,
						login: data.login,
						image: data.image,
						onlineStatus: false,
					};
					// add the new friend to the existing friends list
					const updatedFriends = [...friends, newFriend];
					// update the state with the updated friends list
					setFriends(updatedFriends);
					// ping to update online status
					userData?.chatSocket?.sendServerConnection();
				}
			})
			.catch((error) => {
				setSearchUserError(error.message);
			});
	};

	// if user click outside the settings window
	// (meaning going back to the main window)
	// removes error message
	useEffect(() => {
		if (searchUserError) setSearchUserError('');
	}, [settingsPanelIsOpen]);

	return (
		<Window
			windowTitle="Friends"
			onCloseClick={onCloseClick}
			key="friends-list-window"
			windowDragConstraintRef={windowDragConstraintRef}
			links={[
				{
					name: 'Add friend',
					onClick: () => {
						setSettingsPanelIsOpen(true);
					},
				},
			]}
		>
			<div className="friendsList">
				{friends &&
					friends.map((friend, index) => (
						// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
						<FriendBadge
							key={index}
							badgeTitle={friend.login}
							badgeImageUrl={`/api/images/${friend.image}`}
							onlineIndicator={friend.onlineStatus}
							isClickable={true}
							onClick={() => {
								onBadgeClick(friend.login);
							}}
						/>
					))}
			</div>
			{settingsPanelIsOpen && (
				<SettingsWindow settingsWindowVisible={setSettingsPanelIsOpen}>
					<Title highlightColor="yellow">Username</Title>
					<div className="search-login-form">
						<InputField
							onChange={handleLoginChange}
							error={searchUserError}
							maxlength={8}
						></InputField>

						<Button
							onClick={() => {
								handleAddFriend();
							}}
							disabled={!!searchUserError}
						>
							Add friend
						</Button>
					</div>
				</SettingsWindow>
			)}
			<div className="bottomInfo">
				{' '}
				{friends.length} friends, {nbFriendsOnline} online{' '}
			</div>
		</Window>
	);
};

export default FriendsList;
