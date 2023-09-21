import React, { useContext, useEffect, useRef, useState } from 'react';
import './Profile.css';
import ProfilePicBadge from './Components/ProfilePicBadge/ProfilePicBadge';
import { UserContext, UserData } from '../../contexts/UserContext';
import placeholderImage from '../../images/placeholder-image.png';
import Title from './Components/Title/Title';
// import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
import ProfileSettings from './Components/ProfileSettings/ProfileSettings';
import ProfileStats from './Components/ProfileStats/ProfileStats';
import ProfileMissions from './Components/ProfileMissions/ProfileMissions';
import MatchHistory from './Components/MatchHistory/MatchHistory';
import TitleList from './Components/TitleList/TitleList';
import burgerIcon from './icons/burger-icon.svg';
import cdIcon from './icons/cd-icon.svg';
import coinsIcon from './icons/coins-icon.svg';
import computerIcon from './icons/computer-icon.svg';
import friesIcon from './icons/fries-icon.svg';
import giftIcon from './icons/gift-icon.svg';
import moneyIcon from './icons/money-icon.svg';
import rocketIcon from './icons/rocket-icon.svg';
import Button from '../Shared/Button/Button';
import useAuth from '../../hooks/userAuth';
import { profile } from 'console';
import AchievementBadge from './Components/AchievementBadge/AchievementBadge';
import Window from '../Window/Window';
import SettingsWindow from './Components/Shared/SettingsWindow/SettingsWindow';
import TwoFactorAuthentication from './Components/TwoFactorAuthentication/TwoFactorAuthentication';
import InputField from './Components/InputField/InputField';
import { useNavigate } from 'react-router-dom';
import { deleteFriend } from 'src/utils/FriendsQueries';
import { fetchUserData } from 'src/utils/UserQueries';

// TODO: find a way to make the shaddow wrapper widht's 100% so if fills the sidebar
export interface ProfileProps {
	login: string | undefined;
	setLogin?: React.Dispatch<React.SetStateAction<string>>;
	isMyFriend: boolean | false;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
	nbOnline: number;
	setNbOnline: React.Dispatch<React.SetStateAction<number>>;
	nbFriendsOnline: number;
	setShowFriendProfile?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Profile: React.FC<ProfileProps> = ({
	login,
	setLogin,
	isMyFriend,
	windowDragConstraintRef,
	onCloseClick,
	nbOnline,
	setNbOnline,
	nbFriendsOnline,
	setShowFriendProfile,
}) => {
	const { accessToken, isTwoFAEnabled, setIsTwoFAEnabled, logOut } = useAuth();
	const { userData, updateUserData } = useContext(UserContext);
	const [profileData, setProfileData] = useState<UserData | null>(null); // Declare profileData state
	const isOwnProfile = login == userData?.login;

	// Settings panel
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [settingsMode, setSettingsMode] = useState('');

	const [twoFactorAuthWindowisOpen, setTwoFactorAuthWindowIsOpen] =
		useState(false);

	const [TwoFactorAuthEnableMode, setTwoFactorAuthEnableMode] = useState(false);

	const isInProcessRef = useRef(false);

	const [deleteProfileWindowisOpen, setDeleteProfileWindowisOpen] =
		useState(false);
	const navigate = useNavigate();
	const [changedAvatar, setChangedAvatar] = useState(false);

	// TODO: fetch profile data should be a separate service so we don't rewrite the function in multiple components

	/**************************************************************************************/
	/* Profile Data                                                                       */
	/**************************************************************************************/
	const fetchProfileData = async () => {
		try {
			const response = await fetch(`/api/user/${login}`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				const tempProfileData = await response.json();
				const updatedProfileData = {
					...tempProfileData,
					image: `/api/images/${tempProfileData.image}`,
				};
				setProfileData(updatedProfileData);
			}
		} catch (error) {
			console.error('Error: ', error);
		}
	};

	useEffect(() => {
		// If we're not on our own profile, fetch our friend's information
		Promise.resolve().then(async () => {
			if (!isOwnProfile) {
				await fetchProfileData();
			} else {
				setProfileData(userData);
			}
		});
		return () => {
			setProfileData(null);
			if (login && setLogin) setLogin('');
		};
	}, [login]);

	useEffect(() => {
		if (isOwnProfile && userData?.login !== profileData?.login) {
			setProfileData(userData);
		}
	}, [userData]);

	/**************************************************************************************/
	/* two-factor Authentication Settings                                                 */
	/**************************************************************************************/

	// enable two-factor authentication and open a new window
	// displaying generated qr code and inputfield where
	// the code given by google authenticator must be entered
	const enableTwoFactorAuthentication = async () => {
		setTwoFactorAuthWindowIsOpen(true);
		isInProcessRef.current = true;
	};

	// disable two-factor authentication
	const disableTwoFactorAuthentication = async () => {
		try {
			const response = await fetch('api/login/2fa/turn-off', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				setIsTwoFAEnabled(false);
			} else if (response.status === 500) {
				const messageError = await response.json();
				console.error(messageError);
			}
		} catch (error) {
			throw new Error('internal error');
		}
	};

	// if 2Fa is correctly enable, means 2FA window must unmount and
	// end 2FA process by its reference
	useEffect(() => {
		setTwoFactorAuthWindowIsOpen(false);
		isInProcessRef.current = false;
	}, [isTwoFAEnabled]);

	// before closing tab by refreshing action, in case the user has not finished
	// being verified by google authentication, turn-off 2FA mode.
	const handleTabClosing = () => {
		// if still in authentication process
		if (isInProcessRef.current) {
			// turn-off 2FA to prevent setting the user as verified
			disableTwoFactorAuthentication().catch((error) => {
				console.error('Error disabling 2FA: ', error);
			});
		}
	};

	// add event listener for page refreshing
	useEffect(() => {
		window.addEventListener('unload', handleTabClosing);
		return () => {
			window.removeEventListener('unload', handleTabClosing);
		};
	});

	// on click, open 2FA window
	const openSettingsPanel = () => {
		setSettingsPanelIsOpen(!settingsPanelIsOpen);
	};

	/**************************************************************************************/
	/* Delete Profile Settings                                                            */
	/**************************************************************************************/

	const deleteProfile = async () => {
		try {
			const response = await fetch('api/user/me/delete', {
				method: 'DELETE',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				logOut();
			} else if (response.status === 500) {
				const messageError = await response.json();
				console.error(messageError);
			}
		} catch (error) {
			throw new Error('internal error');
		}
	};

	/**************************************************************************************/
	/* Friends                                                                            */
	/**************************************************************************************/
	const [isFriendDeleted, setIsFriendDeleted] = useState(false);

	const handleDeleteFriend = async () => {
		if (login)
			deleteFriend(login, accessToken)
				.then(async (data) => {
					nbFriendsOnline--;
					setNbOnline(nbFriendsOnline);
					setSettingsPanelIsOpen(false);
					onCloseClick();
				})
				.catch((error) => {
					console.error(error);
				});
	};

	useEffect(() => {
		return () => {
			if (login && setLogin) setLogin('');
		};
	});

	/**************************************************************************************/
	/* Change Avatar                                                                      */
	/**************************************************************************************/
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files ? event.target.files[0] : null;
		setSelectedFile(file);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log(selectedFile);
	};

	const uploadNewAvatar = async () => {
		try {
			if (!selectedFile) throw new Error('no file selected');
			// create form data
			const formData = new FormData();
			// Add the selected file to the FormData
			formData.append('file', selectedFile);
			const response = await fetch('api/user/upload', {
				method: 'PUT',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: formData,
			});
			if (response.ok) {
				const data = await response.json();
				console.log(data.image, userData);

				const updatedUserData = {
					...userData,
					image: `/api/images/${data.image}`,
				};
				updateUserData(updatedUserData);
				setProfileData(updatedUserData);
				setChangedAvatar(true);
				setSettingsPanelIsOpen(false);
			} else if (response.status === 500) {
				const messageError = await response.json();
				console.error(messageError);
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Window
			windowTitle={login || 'window title'}
			links={
				isOwnProfile
					? [
							{
								name: 'Two-Factor Authentication',
								onClick: () => {
									setSettingsMode('Two-Factor Authentication');
									setSettingsPanelIsOpen(true);
								},
							},
							{
								name: 'Delete profile',

								onClick: () => {
									setSettingsMode('Delete Profile');
									setSettingsPanelIsOpen(true);
								},
							},
					  ]
					: [
							isMyFriend
								? {
										name: 'Delete Friend',
										onClick: () => {
											setSettingsMode('Delete Friend');
											setSettingsPanelIsOpen(true);
										},
								  }
								: {
										name: 'Add Friend',
										onClick: () => {
											setSettingsMode('Add Friend');
											setSettingsPanelIsOpen(true);
										},
								  },
					  ]
			}
			useBeigeBackground={true}
			onCloseClick={() => {
				onCloseClick();
				// setProfileData(null);
			}}
			key="profile-window"
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<div className="profile-wrapper">
				{profileData ? (
					<>
						<div className="profile-sidebar">
							<ProfilePicBadge
								picture={profileData.image}
								isModifiable={isOwnProfile}
								setSettingsPanelIsOpen={setSettingsPanelIsOpen}
								setSettingsMode={setSettingsMode}
							/>
							<Title bigTitle={true}>{profileData?.login}</Title>
							<TitleList profileData={profileData} />
							{isOwnProfile && <ProfileSettings />}
						</div>
						<div className="profile-content">
							<ProfileStats profileData={profileData} />
							<ProfileMissions
								profileLogin={profileData.login}
								targetLogin={profileData.targetLogin || ''}
								rivalLogin={profileData.rivalLogin || ''}
								targetDiscoveredByUser={
									profileData.targetDiscoveredByUser || false
								}
							/>
							<MatchHistory profileData={profileData} />
						</div>
					</>
				) : (
					<p>Error loading profile contents</p>
				)}
			</div>
			{settingsPanelIsOpen && (
				<SettingsWindow
					windowTitle="Settings"
					settingsWindowVisible={setSettingsPanelIsOpen}
				>
					<Title highlightColor="yellow">
						{settingsMode === 'Delete Profile' ||
						settingsMode === 'Delete Friend'
							? `${settingsMode} ?`
							: `${settingsMode}`}
					</Title>
					{settingsMode === 'Change Avatar' && (
						<form className="select-file" onSubmit={handleSubmit}>
							<input
								className="change-avatar-file"
								type="file"
								onChange={handleFileInput}
							/>
							<Button
								onClick={uploadNewAvatar}
								disabled={selectedFile ? false : true}
							>
								upload
							</Button>
						</form>
					)}
					{settingsMode === 'Two-Factor Authentication' && (
						<Button
							baseColor={isTwoFAEnabled ? [40, 100, 80] : [111, 60, 84]}
							onClick={
								isTwoFAEnabled
									? disableTwoFactorAuthentication
									: enableTwoFactorAuthentication
							}
							disabled={!!twoFactorAuthWindowisOpen}
						>
							{isTwoFAEnabled ? 'disable' : 'enable'}
						</Button>
					)}
					{twoFactorAuthWindowisOpen && (
						<TwoFactorAuthentication
							setTwoFactorAuthWindowisOpen={setTwoFactorAuthWindowIsOpen}
						/>
					)}

					{settingsMode === 'Delete Profile' && (
						<div className="delete-settings-wrapper">
							<Button
								baseColor={[111, 60, 84]}
								onClick={() => {
									deleteProfile();
								}}
							>
								yes
							</Button>
							<Button
								baseColor={[40, 100, 80]}
								onClick={() => {
									setSettingsPanelIsOpen(false);
								}}
							>
								no
							</Button>
						</div>
					)}

					{settingsMode === 'Delete Friend' && (
						<div className="delete-settings-wrapper">
							<Button
								baseColor={[111, 60, 84]}
								onClick={() => {
									handleDeleteFriend();
								}}
							>
								yes
							</Button>
							<Button
								baseColor={[40, 100, 80]}
								onClick={() => {
									setSettingsPanelIsOpen(false);
								}}
							>
								no
							</Button>
						</div>
					)}
				</SettingsWindow>
			)}
		</Window>
	);
};

export default Profile;
