import React, { useContext, useEffect, useRef, useState } from 'react';
import { deleteFriend } from 'src/utils/FriendsQueries';
import { turnOffTwoFactorAuthentication } from 'src/utils/TwoFactorAuthQueries';
import { deleteMyProfile } from 'src/utils/UserQueries';
import { IUserData } from '../../../../shared-lib/types/user';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import Button from '../Shared/Button/Button';
import Window from '../Window/Window';
import MatchHistory from './Components/MatchHistory/MatchHistory';
import ProfileMissions from './Components/ProfileMissions/ProfileMissions';
import ProfilePicBadge from './Components/ProfilePicBadge/ProfilePicBadge';
import ProfileSettings from './Components/ProfileSettings/ProfileSettings';
import ProfileStats from './Components/ProfileStats/ProfileStats';
import SettingsWindow from './Components/Shared/SettingsWindow/SettingsWindow';
import Title from './Components/Title/Title';
import TitleList from './Components/TitleList/TitleList';
import TwoFactorAuthentication from './Components/TwoFactorAuthentication/TwoFactorAuthentication';
import './Profile.css';

// TODO: find a way to make the shaddow wrapper widht's 100% so if fills the sidebar
export interface ProfileProps {
	login: string | undefined;
	setLogin?: React.Dispatch<React.SetStateAction<string>>;
	isMyFriend: boolean | false;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
	nbOnline: number;
	setNbOnline: React.Dispatch<React.SetStateAction<number>>;
	setShowFriendProfile?: React.Dispatch<React.SetStateAction<boolean>>;
	setDeletedFriend?: React.Dispatch<React.SetStateAction<string>>;
	setAddedFriend?: React.Dispatch<React.SetStateAction<string>>;
}

const Profile: React.FC<ProfileProps> = ({
	login,
	setLogin,
	isMyFriend,
	windowDragConstraintRef,
	onCloseClick,
	nbOnline,
	setNbOnline,
	setDeletedFriend,
	setAddedFriend,
}) => {
	const { accessToken, isTwoFAEnabled, setIsTwoFAEnabled, logOut } = useAuth();
	const { userData, updateUserData } = useContext(UserContext);
	const [profileData, setProfileData] = useState<IUserData | null>(null); // Declare profileData state
	const isOwnProfile = login == userData?.login;

	// Settings panel
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [settingsMode, setSettingsMode] = useState('');

	const [twoFactorAuthWindowisOpen, setTwoFactorAuthWindowIsOpen] =
		useState(false);

	const isInProcessRef = useRef(false);

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
			await fetchProfileData();
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
		turnOffTwoFactorAuthentication(accessToken)
			.then(() => {
				setIsTwoFAEnabled(false);
			})
			.catch((error) => {
				console.error(error);
			});
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
			turnOffTwoFactorAuthentication(accessToken).catch((error) => {
				console.error(error);
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

	/**************************************************************************************/
	/* Delete Profile Settings                                                            */
	/**************************************************************************************/

	const deleteProfile = async () => {
		deleteMyProfile(accessToken)
			.then(async () => {
				logOut();
			})
			.catch((error) => {
				console.error(error);
			});
	};

	/**************************************************************************************/
	/* Friends                                                                            */
	/**************************************************************************************/

	// sends request to delete friend
	const handleDeleteFriend = async () => {
		if (login && setDeletedFriend)
			deleteFriend(login, accessToken)
				.then(async () => {
					nbOnline--;
					setNbOnline(nbOnline);
					setSettingsPanelIsOpen(false);
					setDeletedFriend(login);
					onCloseClick();
				})
				.catch((error) => {
					console.error(error);
				});
	};

	const handleAddFriend = async () => {
		if (setAddedFriend && login) {
			setSettingsPanelIsOpen(false);
			setAddedFriend(login);
			onCloseClick();
		}
	};

	useEffect(() => {
		return () => {
			// cleanup on unmount
			if (login && setLogin) setLogin('');
		};
	});

	/**************************************************************************************/
	/* Change Avatar                                                                      */
	/**************************************************************************************/
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState('');

	const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedFile(null);
		const file = event.target.files ? event.target.files[0] : null;
		if (file) {
			// Check the file type
			if (!/(\.jpeg|\.jpg|\.png)$/i.test(file.name)) {
				setFileError('File must be a .jpeg, .jpg, or .png image.');
			} else if (file.size > 1024 * 1024 * 4) {
				setFileError('File size must be less than 4 MB.');
			} else {
				// Reset any previous file error
				setFileError('');
				// Set the selected file
				setSelectedFile(file);
			}
		}
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
			const data = await response.json();
			if (response.ok) {
				console.log(data.image, userData);

				const updatedUserData = {
					...userData,
					image: `/api/images/${data.image}`,
				};
				updateUserData(updatedUserData);
				setProfileData(updatedUserData);
				setSettingsPanelIsOpen(false);
			} else {
				setFileError(data.message);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		return () => {
			// cleanup on unmount
			if (fileError) setFileError('');
		};
	});

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
								targetImage={profileData.targetImage || ''}
								rivalLogin={profileData.rivalLogin || ''}
								rivalImage={profileData.rivalImage || ''}
								targetDiscoveredByUser={profileData.targetDiscoveredByUser}
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
							{fileError && (
								<div className="change-avatar-error">{fileError}</div>
							)}
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

					{settingsMode === 'Add Friend' && (
						<div className="delete-settings-wrapper">
							<Button
								baseColor={[111, 60, 84]}
								onClick={() => {
									handleAddFriend();
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
