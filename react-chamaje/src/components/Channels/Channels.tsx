import React, { useState } from 'react';
import './Channels.css';
import { IPrivateMessagesProps } from '../PrivateMessages/PrivateMessages';
import Window from '../Window/Window';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Button from '../Shared/Button/Button';
import Title from '../Profile/Components/Title/Title';
import InputField from '../Profile/Components/InputField/InputField';

const Channels: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
}) => {
	const chatsList = [''];
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [settingsMode, setSettingsMode] = useState('');

	return (
		<Window
			windowTitle="Channels"
			useBeigeBackground={true}
			onCloseClick={onCloseClick}
			key="channels-window"
			windowDragConstraintRef={windowDragConstraintRef}
			links={[
				{
					name: 'New channel',
					onClick: () => {
						setSettingsMode('create');
						setSettingsPanelIsOpen(true);
					},
				},
				{
					name: 'Join channel',
					onClick: () => {
						setSettingsMode('join');
						setSettingsPanelIsOpen(true);
					},
				},
			]}
		>
			<div className="channels-list-wrapper">
				{chatsList.length > 0 ? (
					<>
						<FriendBadge
							isClickable={true}
							badgeTitle="Norminet"
							isChannelBadge={true}
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="Another channel"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
						<FriendBadge
							isClickable={true}
							isChannelBadge={true}
							badgeTitle="This channel title is waaaaaaaay too long"
						/>
					</>
				) : (
					<FriendBadge
						isEmptyBadge={true}
						isChannelBadge={true}
						onClick={() =>
							setTimeout(() => {
								setSettingsPanelIsOpen(true);
							}, 100)
						}
					/>
				)}
			</div>
			{settingsPanelIsOpen && (
				<SettingsWindow settingsWindowVisible={setSettingsPanelIsOpen}>
					<Title highlightColor="yellow">Channel name</Title>
					<div className="settings-form">
						<InputField></InputField>
						<Button
							onClick={() => {
								window.alert('This would create the channel');
							}}
						>
							{settingsMode} channel
						</Button>
					</div>
				</SettingsWindow>
			)}
		</Window>
	);
};

export default Channels;
