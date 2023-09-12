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

// TODO: find a way to make the shaddow wrapper widht's 100% so if fills the sidebar
export interface ProfileProps {
	login: string;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
}

const Profile: React.FC<ProfileProps> = ({
	login,
	windowDragConstraintRef,
	onCloseClick,
}) => {
	const { accessToken, isTwoFAEnabled, setIsTwoFAEnabled } = useAuth();
	const { userData } = useContext(UserContext);
	const [profileData, setProfileData] = useState<UserData | null>(null); // Declare profileData state
	const isOwnProfile = login == userData?.login;

	// Settings panel
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);

	const [twoFactorAuthWindowisOpen, setTwoFactorAuthWindowIsOpen] =
		useState(false);

	const [TwoFactorAuthEnableMode, setTwoFactorAuthEnableMode] = useState(false);

	const isInProcessRef = useRef(false);

	const [deleteProfileWindowisOpen, setDeleteProfileWindowisOpen] =
		useState(false);

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
				setProfileData(tempProfileData);
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
	}, []);

	/**************************************************************************************/
	/* two-factor Authentication Settings                                                 */
	/**************************************************************************************/

	// enable two-factor authentication and open a new window
	// displaying generated qr code and inputfield where
	// the code given by google authenticator must be entered
	const enableTwoFactorAuthentication = async () => {
		console.log('process is starting!');
		setTwoFactorAuthWindowIsOpen(true);
		isInProcessRef.current = true;
		console.log('enable2FA, REF:', isInProcessRef);
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

	// const openDeleteProfileSettingsPanel = () => {
	// 	setDeleteProfileWindowisOpen(true);
	// };

	return (
		<Window
			windowTitle={login || 'window title'}
			links={[
				{ name: 'Delete profile', onClick: openSettingsPanel },
				{ name: 'Two-Factor Authentication', onClick: openSettingsPanel },
				// { name: 'Link3', onClick: () => null },
			]}
			useBeigeBackground={true}
			onCloseClick={onCloseClick}
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
							/>
							<Title bigTitle={true}>{profileData.login}</Title>
							<TitleList profileData={profileData} />
							{isOwnProfile && <ProfileSettings />}

							{isOwnProfile && (
								<div className="profile-buttons">
									{userData && userData.login == login && (
										<Button baseColor={[308, 80, 92]}>change password</Button>
									)}
									{userData && !(userData.login == login) && (
										<Button baseColor={[308, 80, 92]}>add friend</Button>
									)}
									<Button baseColor={[0, 80, 92]}>
										<svg
											className="trashcan-sgv"
											xmlns="http://www.w3.org/2000/svg"
											height="1em"
											viewBox="0 0 448 512"
										>
											<path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
										</svg>
									</Button>
								</div>
							)}
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
					<Title highlightColor="yellow">Two-Factor Authentication</Title>
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
					{twoFactorAuthWindowisOpen && (
						<TwoFactorAuthentication
							// qrCode={qrcode}
							// setQrCode={setQrcode}
							setTwoFactorAuthWindowisOpen={setTwoFactorAuthWindowIsOpen}
						/>
					)}
				</SettingsWindow>
			)}
		</Window>
	);
};

export default Profile;
