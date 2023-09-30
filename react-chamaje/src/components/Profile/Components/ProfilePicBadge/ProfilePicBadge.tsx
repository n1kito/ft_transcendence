import React from 'react';
import './ProfilePicBadge.css';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import pen from './images/edit-pen-svgrepo-com.svg';

export interface ProfilePicBadgeProps {
	picture: string;
	isModifiable?: boolean;
	setSettingsPanelIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	setSettingsMode?: React.Dispatch<React.SetStateAction<string>>;
}

const ProfilePicBadge: React.FC<ProfilePicBadgeProps> = ({
	picture,
	isModifiable = false,
	setSettingsPanelIsOpen,
	setSettingsMode,
}) => {
	return (
		<div className="profile-pic-badge-wrapper">
			<ShadowWrapper shadow={true}>
				<div
					className="picture-container"
					style={{
						backgroundImage: `url('${picture}')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				></div>
				{isModifiable && (
					<div className="modify-button">
						<ShadowWrapper
							shadow={true}
							isClickable={true}
							onClick={() => {
								setSettingsPanelIsOpen
									? setSettingsPanelIsOpen(true)
									: undefined;
								setSettingsMode ? setSettingsMode('Change Avatar') : '';
							}}
						>
							<img src={pen}></img>
						</ShadowWrapper>
					</div>
				)}
			</ShadowWrapper>
		</div>
	);
};

export default ProfilePicBadge;
