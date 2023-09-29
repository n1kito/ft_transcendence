import DOMPurify from 'dompurify';
import React, {
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import useAuth from 'src/hooks/userAuth';
import {
	blockUserQuery,
	createChatPrivateMessage,
	findPrivateMessage,
	findUserByLogin,
	getAdminRights,
	getChatInfo,
	inviteToChannelQuery,
	leaveChat,
	makePrivate,
	sendMessageQuery,
	setNewPassword,
	unblockUserQuery,
} from 'src/utils/queries';
import { UserContext } from '../../contexts/UserContext';
import InputField from '../Profile/Components/InputField/InputField';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import mysteryBox from '../Profile/Components/TargetBadge/images/mysteryBox.png';
import Title from '../Profile/Components/Title/Title';
import Button from '../Shared/Button/Button';
import Window from '../Window/Window';
import './ChatWindow.css';
import ChatBubble from './Components/ChatBubble/ChatBubble';
import ChatGameInvite from './Components/ChatGameInvite/ChatGameInvite';
// import { IChatStruct } from '../PrivateMessages/PrivateMessages';
import { ChatContext, IMessage, IUserAction } from 'src/contexts/ChatContext';
import { GameContext } from 'src/contexts/GameContext';
import { useNavigationParams } from 'src/hooks/useNavigationParams';
import ChatNotification from './Components/ChatNotification/ChatNotification';

export interface IChatWindowProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	name: string;
	chatId: number;
	messages: IMessage[];
	isChannel?: boolean;
	setChatWindowIsOpen: Dispatch<SetStateAction<boolean>>;
	setMessages: Dispatch<SetStateAction<IMessage[]>>;
	setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
	setProfileLogin: React.Dispatch<React.SetStateAction<string>>;
}

interface IChatInfo {
	isChannel: boolean;
	isPrivate: boolean;
	isProtected: boolean;
}

const dateFormatOptions: Intl.DateTimeFormatOptions = {
	year: '2-digit',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hour12: true,
};

const ChatWindow: React.FC<IChatWindowProps> = ({
	name,
	onCloseClick,
	windowDragConstraintRef,
	chatId,
	messages,
	setMessages,
	isChannel = false,
	setChatWindowIsOpen,
	setShowFriendProfile,
	setProfileLogin,
}) => {
	/* ********************************************************************* */
	/* ******************************* FRONT ******************************* */
	/* ********************************************************************* */

	const [textareaIsFocused, setTextareaIsFocused] = useState(false);
	const [textareaIsEmpty, setTextareaIsEmpty] = useState(true);
	const [textareaContent, setTextareaContent] = useState('');
	const [pwdContent, setPwdContent] = useState('');

	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [settingPwdError, setSettingPwdError] = useState('');
	const [settingPwdSuccess, setSettingPwdSuccess] = useState('');

	const [channelIsPrivate, setChannelIsPrivate] = useState(false);
	const [isOwner, setIsOwner] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const [secondUserId, setSecondUserId] = useState(0);

	const [isInviting, setIsInviting] = useState(false);
	const [searchedLogin, setSearchedLogin] = useState('');
	const [searchUserError, setSearchUserError] = useState('');
	const [searchUserSuccess, setSearchUserSuccess] = useState('');
	const [inviteToPlayMsg, setInviteToPlayMsg] = useState<IMessage>();

	const { userData } = useContext(UserContext);
	const {
		chatData,
		updateChatList,
		getNewChatsList,
		updateBlockedUsers,
		getNewBlockedUsers,
	} = useContext(ChatContext);
	const chatContentRef = useRef<HTMLDivElement>(null);

	const { updateGameData } = useContext(GameContext);
	const { setNavParam } = useNavigationParams();

	/* ********************************************************************* */
	/* ***************************** WEBSOCKET ***************************** */
	/* ********************************************************************* */

	// listen for makeAdmin messages
	useEffect(() => {
		if (!chatData.socket) {
			return;
		}
		const onMakeAdmin = (data: IUserAction) => {
			if (data.userId === userData?.id && data.chatId === chatId) {
				setIsAdmin(true);
			}
		};
		chatData.socket?.onMakeAdmin(onMakeAdmin);
		return () => {
			chatData.socket?.offMakeAdmin(onMakeAdmin);
		};
	}, [chatId]);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = event.target.value;
		setTextareaContent(newValue);
		setTextareaIsEmpty(newValue === '');
	};

	// On enter, send the message if not empty
	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (!textareaIsEmpty) sendMessage();
		}
	};

	const handlePwdInput = (newValue: string) => {
		// const newValue = event.target.value;
		setPwdContent(newValue);
	};

	// get the user to the last message
	useEffect(() => {
		const container = chatContentRef.current;
		container?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	/* ************************** links functions ************************** */
	const openSettingsPanel = () => {
		setSettingsPanelIsOpen(!settingsPanelIsOpen);
		setSettingPwdSuccess('');
		setSettingPwdError('');
	};
	/* ********************************************************************* */
	/* ********************** channel links functions ********************** */

	const inviteToChannel = () => {
		setIsInviting(true);
		setSearchUserError('');
		setSearchUserSuccess('');
	};
	const handleLoginChange = (login: string) => {
		setSearchedLogin(login);
		setSearchUserError('');
		setSearchUserSuccess('');
	};

	// find the user by login and create the chat
	const inviteUserToChannel = () => {
		if (searchedLogin) {
			findUserByLogin(searchedLogin, accessToken)
				// .then((response) => response.json())
				.then(async (data) => {
					if (data.message) {
						throw new Error('User not found');
					}
					// if the user is found, create the PM and update the PM list
					if (!userData) {
						return;
					}
					// invite to the Channel and create a chat with the user if it did not already exist
					inviteToChannelQuery(accessToken, chatId, data.id)
						.then(() => {
							createChatPrivateMessage(data.id, userData.id, accessToken)
								.then((creationData) => {
									sendMessageQuery(
										accessToken,
										'',
										creationData.chatId,
										undefined,
										'invite',
										data.id,
										name,
									)
										.then(() => {
											setSearchUserSuccess('Invitation sent');
											chatData.socket?.sendMessage(
												'',
												creationData.chatId,
												userData.login,
												'',
												'invite',
												data.id,
												searchedLogin,
												name,
											);
										})
										.catch((e) => {
											setSearchUserError(e.message);
											console.error('Could not send invitation: ', e.message);
										});
								})
								.catch((e) => {
									if (
										e.message ===
										'You already have a conversation with that person'
									) {
										findPrivateMessage(data.id, userData.id, accessToken)
											.then((finderData) => {
												sendMessageQuery(
													accessToken,
													'',
													finderData.chatId,
													undefined,
													'invite',
													data.id,
													name,
												)
													.then(() => {
														chatData.socket?.sendMessage(
															'',
															finderData.chatId,
															userData.login,
															'',
															'invite',
															data.id,
															searchedLogin,
															name,
														);
														setSearchUserSuccess('Invitation sent');
													})
													.catch((e) => {
														console.error(
															'Could not send invitation: ',
															e.message,
														);
													});
											})
											.catch((e) => {
												console.error(
													'Could not find private message: ',
													e.message,
												);
											});
									} else {
										console.error('Could not create chat: ', e.message);
									}
								});
						})
						.catch((e) => {
							setSearchUserError(e.message);
							console.error('Could not invite user');
						});
				})
				.catch((e: string) => {
					console.error(e);
					setSearchUserError('Could not find user');
				});
		}
	};

	const leaveChannel = () => {
		leaveChat(accessToken, chatId)
			.then(async () => {
				const updatedChatsList = chatData.chatsList.filter(
					(channel) => channel.chatId !== chatId,
				);
				chatData.socket?.leaveRoom(chatId);
				getNewChatsList(updatedChatsList);
				setChatWindowIsOpen(false);
			})
			.catch((e) => {
				if (e.message === 'You are not in this chat') {
					setChatWindowIsOpen(false);
				}
				console.error('Error leaving channel: ', e.message);
			});
	};

	/* ********************************************************************* */
	/* ************************* PM links functions ************************ */
	const leavePM = () => {
		leaveChat(accessToken, chatId)
			.then(async () => {
				// fetchPrivateMessages(accessToken)
				// 	.then((data) => setChatsList(data))
				// 	.catch((e) => {
				// 		console.error('Error fetching private messages: ', e);
				// 	});
				const updatedChatsList = chatData.chatsList.filter(
					(privateMessage) => privateMessage.chatId !== chatId,
				);
				getNewChatsList(updatedChatsList);
				chatData.socket?.leaveRoom(chatId);
				setChatWindowIsOpen(false);
			})
			.catch((e) => {
				console.error('Error leaving chat - chatWindow: ', e);
			});
	};

	const inviteToPlay = () => {
		// get userID to invite
		for (const current of chatData.chatsList) {
			if (current.chatId === chatId) {
				for (const pCurrent of current.participants) {
					if (pCurrent !== userData?.id) {
						sendMessageQuery(
							accessToken,
							'',
							chatId,
							pCurrent,
							'play',
							pCurrent,
						)
							.then(() => {
								chatData.socket?.sendMessage(
									'',
									chatId,
									userData ? userData?.login : '',
									'',
									'play',
									pCurrent,
									name,
								);
								updateGameData({
									opponentInfo: { login: name || '', image: '' },
								});
								setNavParam('game');
							})
							.catch((e) => {
								console.error('Could not send invitation: ', e.message);
							});
					}
				}
			}
		}
	};

	const blockUser = () => {
		// get the userID to block
		for (const current of chatData.chatsList) {
			if (current.chatId === chatId) {
				for (const pCurrent of current.participants) {
					if (pCurrent !== userData?.id) {
						if (!isBlocked) {
							blockUserQuery(accessToken, pCurrent)
								.then(() => {
									updateBlockedUsers([
										{ userBlockedId: pCurrent, blockedAt: new Date() },
									]);
									setIsBlocked(true);
								})
								.catch((e) => {
									console.error('Could not block user: ', e.message);
								});
						} else {
							unblockUserQuery(accessToken, pCurrent)
								.then(() => {
									const updatedBlockedUsers = chatData.blockedUsers.filter(
										(user) => user.userBlockedId !== secondUserId,
									);
									getNewBlockedUsers(updatedBlockedUsers);
									setIsBlocked(true);
								})
								.catch((e) => {
									console.error('Could not block user: ', e.message);
								});
						}
					}
				}
			}
		}
	};
	/* ********************************************************************* */

	// empty the textarea when changing active chat
	// get the chat info
	// get the userId of the correspond if not a channel
	useEffect(() => {
		setTextareaContent('');
		setTextareaIsEmpty(true);
		getChatInfo(accessToken, chatId).then((chatInfo: IChatInfo) => {
			setChannelIsPrivate(chatInfo.isPrivate);
		});
		if (!isChannel && userData) {
			const chat = chatData.chatsList.find(
				(target) => target.chatId === chatId,
			);
			if (chat)
				setSecondUserId(
					chat.participants.at(0) === userData.id
						? chat.participants.at(1) || 0
						: chat.participants.at(0) || 0,
				);
		}
	}, [chatId]);

	// check if that user is blocked
	useEffect(() => {
		for (const current of chatData.blockedUsers)
			if (current.userBlockedId === secondUserId) {
				setIsBlocked(true);
				return;
			}
		setIsBlocked(false);
	}, [secondUserId, chatData.blockedUsers]);
	/* ********************************************************************* */
	/* ******************************** CHAT ******************************* */
	/* ********************************************************************* */

	const { accessToken } = useAuth();

	// On mount, join the room associated with the chat
	// socket io ignores if it was already joined
	useEffect(() => {
		if (chatId) chatData.socket?.joinRoom(chatId);
	}, [chatId]);

	// every time we change room, check if we are the owner (if its a channel)
	useEffect(() => {
		if (isChannel) {
			getAdminRights(accessToken, chatId)
				.then((data) => {
					setIsAdmin(data.isAdmin);
					setIsOwner(data.isOwner);
				})
				.catch((e) => {
					setIsAdmin(false);
					setIsOwner(false);
				});
		}
	}, [chatId]);

	const sendMessage = async () => {
		if (!isChannel) {
			const user = chatData.blockedUsers.find(
				(target) => target.userBlockedId === secondUserId,
			);
			if (user) return;
		}

		sendMessageQuery(accessToken, textareaContent, chatId, secondUserId)
			.then(() => {
				const myImage = userData.image.replace('/api/images/', '');
				// socket sending message
				chatData.socket?.sendMessage(
					textareaContent,
					chatId,
					userData?.login || '',
					myImage || '',
				);
				// display users' own message by updating the messages[]
				const updatedMessages: IMessage[] = messages.map((val) => {
					return val;
				});
				updatedMessages.push({
					chatId: chatId,
					sentById: userData ? userData.id : 0,
					sentAt: new Date(),
					content: textareaContent,
					login: userData ? userData?.login : '',
				});
				setMessages(updatedMessages);
				setTextareaContent('');
				setTextareaIsEmpty(true);
			})
			.catch((e) => {
				console.error('Could not send message to the database: ', e);
			});
	};

	useEffect(() => {
		for (const current of messages) {
			const date = new Date(current.sentAt);
			date.setMinutes(date.getMinutes() + 15);
			const nowDate = new Date();
			let oldInviteDate = new Date('1900-01-01T00:00:00Z');
			if (inviteToPlayMsg) oldInviteDate = new Date(inviteToPlayMsg?.sentAt);
			if (
				current.isNotif &&
				current.isNotif === 'play' &&
				date > nowDate &&
				oldInviteDate < date
			) {
				setInviteToPlayMsg(current);
			}
		}
	}, [messages]);

	/* ********************************************************************* */
	/* ******************************* RETURN ****************************** */
	/* ********************************************************************* */

	return (
		<Window
			windowTitle={isChannel ? name : `Chat with ${name || 'anonymous'}`}
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
			links={
				isChannel && name
					? [
							isOwner || isAdmin || !channelIsPrivate
								? { name: 'Invite', onClick: inviteToChannel }
								: { name: '' },
							{ name: 'Leave', onClick: leaveChannel },
							isOwner
								? { name: 'Settings', onClick: openSettingsPanel }
								: { name: '' },
					  ]
					: name
					? [
							{
								name: 'Profile',
								onClick: () => {
									setNavParam('friendProfile', name);
									setShowFriendProfile(true);
									setShowFriendProfile(true);
									setProfileLogin(name);
								},
							},
							{ name: 'Play', onClick: inviteToPlay },
							{ name: isBlocked ? 'Unblock' : 'Block', onClick: blockUser },
							{ name: 'Leave chat', onClick: leavePM },
					  ]
					: []
			}
			useBeigeBackground={true}
		>
			<div className="chat-wrapper">
				<div className="chat-content">
					{messages.map((currentMessage, index) => {
						const date: Date = new Date(currentMessage.sentAt);
						const messageWithNewlines = currentMessage.content.replace(
							/\n/g,
							'<br />',
						);
						// keep the message displayed safe from XSS attacks
						const sanitizedData = () => ({
							__html: DOMPurify.sanitize(messageWithNewlines),
						});
						const isLast = index === messages.length - 1;
						for (const currentBlocked of chatData.blockedUsers) {
							if (currentBlocked.userBlockedId === currentMessage.sentById) {
								const currentDate = new Date(currentBlocked.blockedAt);
								if (date > currentDate) return;
							}
						}
						if (!currentMessage.isNotif) {
							return (
								<ChatBubble
									key={index}
									userId={currentMessage.sentById}
									chatId={chatId}
									wasSent={
										userData && currentMessage.sentById === userData.id
											? true
											: false
									}
									sender={
										name || currentMessage.login === userData.login
											? currentMessage.login
											: 'anonymous'
									}
									time={date.toLocaleString('en-US', dateFormatOptions)}
									senderAvatar={
										name ? `/api/images/${currentMessage.avatar}` : mysteryBox
									}
									isAdmin={isAdmin || isOwner}
									setShowFriendProfile={setShowFriendProfile}
									setProfileLogin={setProfileLogin}
								>
									{
										<div
											dangerouslySetInnerHTML={sanitizedData()}
											ref={isLast ? chatContentRef : undefined}
										/>
									}
								</ChatBubble>
							);
						} else if (currentMessage.isNotif !== 'play') {
							return (
								<ChatNotification
									key={index}
									type={currentMessage.isNotif}
									sender={currentMessage.login}
									recipient={currentMessage.targetLogin}
									channelName={currentMessage.channelInvitation || undefined}
								></ChatNotification>
							);
						}
					})}
					{inviteToPlayMsg ? (
						<ChatGameInvite
							key={'invite' + inviteToPlayMsg.sentAt}
							chatId={chatId}
							sender={inviteToPlayMsg.login}
							recipient={inviteToPlayMsg.targetLogin}
							sentAt={inviteToPlayMsg.sentAt}
							reply={inviteToPlayMsg.reply}
						></ChatGameInvite>
					) : (
						<></>
					)}
				</div>
				<div
					className={`chat-input ${
						textareaIsFocused || !textareaIsEmpty ? 'chat-input--focus' : ''
					}`}
				>
					<textarea
						value={textareaContent}
						onFocus={() => setTextareaIsFocused(true)}
						onBlur={() => setTextareaIsFocused(false)}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
					></textarea>
					<Button
						baseColor={[151, 51, 91]}
						disabled={textareaIsEmpty || !name}
						onClick={sendMessage}
					>
						send
					</Button>
				</div>
			</div>
			{settingsPanelIsOpen && name && (
				<SettingsWindow
					windowTitle="Settings"
					settingsWindowVisible={setSettingsPanelIsOpen}
				>
					<Title highlightColor="yellow">Visibility</Title>
					<Button
						baseColor={channelIsPrivate ? [111, 60, 84] : [40, 100, 80]}
						onClick={async () => {
							makePrivate(accessToken, chatId, !channelIsPrivate)
								.then(() => {
									setChannelIsPrivate(!channelIsPrivate);
								})
								.catch((e) => {
									console.error('Could not make private: ', e.message);
								});
						}}
					>
						make {channelIsPrivate ? 'public' : 'private'}
					</Button>
					<Title highlightColor="yellow">Channel password</Title>
					<div className="settings-form">
						<InputField
							onChange={handlePwdInput}
							success={settingPwdSuccess}
							error={settingPwdError}
						></InputField>
						<Button
							onClick={async () => {
								setSettingPwdError('');
								setSettingPwdSuccess('');

								setNewPassword(accessToken, chatId, pwdContent)
									.then(() => {
										setPwdContent('');
										setSettingPwdSuccess('Password changed successfully');
									})
									.catch((e) => {
										console.error('Could not set the password');
										setSettingPwdError(e.message);
									});
							}}
						>
							update
						</Button>
					</div>
				</SettingsWindow>
			)}
			{isInviting && name && (
				<SettingsWindow settingsWindowVisible={setIsInviting}>
					<Title highlightColor="yellow">User name</Title>
					<div className="settings-form">
						<InputField
							onChange={handleLoginChange}
							error={searchUserError}
							success={searchUserSuccess}
						></InputField>
						<Button
							onClick={() => {
								inviteUserToChannel();
							}}
						>
							invite user
						</Button>
					</div>
				</SettingsWindow>
			)}
		</Window>
	);
};

export default ChatWindow;
