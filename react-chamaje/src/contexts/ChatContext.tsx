import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from 'react';
import WebSocketService from 'src/services/WebSocketService';

export interface IChatStruct {
	chatId: number;
	participants: number[];
	name: string; // for the PM its the login
	avatar?: string;
	isChannel: boolean;
	onlineIndicator?: boolean; // if it is a friend of us, show the online status
	newMessage?: boolean;
}

export interface IMessage {
	chatId: number;
	sentById: number;
	sentAt: Date;
	content: string;
	login: string;
	avatar?: string;
	isNotif?: string;
	target?: number;
	channelInvitation?: string;
	targetLogin?: string;
	reply?: boolean;
	id?: number;
}

export interface IUserAction {
	chatId: number;
	userId: number;
}

export interface IUserBlocked {
	userBlockedId: number;
	blockedAt: Date;
}

export interface IChatDataProps {
	chatsList: IChatStruct[];
	blockedUsers: IUserBlocked[];
	socket: WebSocketService | null;
}

// Initial state of the chatData
const defaultChatState: IChatDataProps = {
	socket: null,
	chatsList: [],
	blockedUsers: [],
};

interface ChatContextType {
	chatData: IChatDataProps;
	updateChatData: (updates: Partial<IChatDataProps>) => void;
	updateChatList: (update: IChatStruct[]) => void;
	getNewChatsList: (update: IChatStruct[]) => void;
	updateBlockedUsers: (update: IUserBlocked[]) => void;
	getNewBlockedUsers: (update: IUserBlocked[]) => void;
	eraseChatData: () => void;
	resetChatData: () => void;
}

export const ChatContext = createContext<ChatContextType>({
	chatData: defaultChatState,
	updateChatData: () => {
		throw new Error('setChatData function must be overriden');
	},
	updateChatList: () => {
		throw new Error('updateChatList function must be overriden');
	},
	getNewChatsList: () => {
		throw new Error('getNewChatsList function must be overriden');
	},
	updateBlockedUsers: () => {
		throw new Error('updateBlockedUsers function must be overriden');
	},
	getNewBlockedUsers: () => {
		throw new Error('updateBlockedUsers function must be overriden');
	},
	eraseChatData: () => {
		throw new Error('resetChatData function must be overriden');
	},
	resetChatData: () => {
		throw new Error('resetChatData function must be overriden');
	},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
	// Actual state of the context
	// We use our initial state above to initialize it
	const [chatData, setChatData] = useState<IChatDataProps>(defaultChatState);

	// TODO: remove this and corresponding logs
	// Logs the updates to chatData as they happen
	useEffect(() => {
		const chatDataLog = { ...chatData, socket: 'not loggable' };
		// console.log(
		// 	`%c ChatData %c ${JSON.stringify(chatDataLog, null, 4)}`,
		// 	'color: yellow; background:magenta',
		// 	'',
		// );
	}, [chatData]);

	// We want a helper function that will allow us to update one, many or all
	// properties of the chat state without having to override the entire thing manually
	const updateChatData = (updates: Partial<IChatDataProps>) => {
		setChatData((prevChatData: IChatDataProps) => ({
			...prevChatData,
			...updates,
		}));
		// if ('socket' in updates) {
		// 	logContext(`socket ${updates.socket != undefined ? 'added' : 'removed'}`);
		// } else {
		// 	logContext(JSON.stringify(updates, null, 4));
		// }
	};

	const updateChatList = (updates: IChatStruct[]) => {
		// const updatedChatlist = chatData.chatsList.map((current) => {
		// 	return current;
		// });
		// for (let current in updates)
		//     updatedChatlist.push(current)
		const updatedChatList = chatData.chatsList.concat(updates);
		setChatData((prevChatData) => ({
			chatsList: updatedChatList,
			blockedUsers: prevChatData.blockedUsers,
			socket: prevChatData.socket,
			// ... put the rest of it
		}));
	};

	// set the chat list to a new list keeping the chats that are
	const getNewChatsList = (updates: IChatStruct[]) => {
		// const keptChats = chatData.chatsList.filter((current) => {
		// 	return current.isChannel !== updatingChannels;
		// });
		setChatData((prevChatData) => ({
			chatsList: updates,
			// chatsList: keptChats.concat(updates),
			blockedUsers: prevChatData.blockedUsers,
			socket: prevChatData.socket,
		}));
	};

	const getNewBlockedUsers = (updates: IUserBlocked[]) => {
		// console.log('%cChatData: ', 'background-color:blue', chatData.chatsList);

		setChatData((prevChatData) => ({
			...prevChatData,
			blockedUsers: updates,
		}));
		// setChatData({
		// 	chatsList: chatData.chatsList,
		// 	blockedUsers: updates,
		// 	socket: chatData.socket,
		// });
	};
	const updateBlockedUsers = (updates: IUserBlocked[]) => {
		// const updatedChatlist = chatData.chatsList.map((current) => {
		// 	return current;
		// });
		// for (let current in updates)
		//     updatedChatlist.push(current)
		const updatedBlockedUsers = chatData.blockedUsers.concat(updates);
		setChatData((prevChatData) => ({
			chatsList: prevChatData.chatsList,
			blockedUsers: updatedBlockedUsers,
			socket: prevChatData.socket,
			// ... put the rest of it
		}));
	};

	// Helper function to reset the chat state to its initial state in one function call
	const eraseChatData = () => {
		// logContext('erase the current chatData, including the socket');
		setChatData(defaultChatState);
	};

	const resetChatData = () => {
		// logContext('reset the chatData context, excluding the socket');
		const resetChatValues: Partial<IChatDataProps> = defaultChatState;
		// delete resetChatValues.socket;
		// delete resetChatValues.connectedToServer;
		updateChatData(resetChatValues);
	};

	const logContext = (content: string) => {
		console.log(
			`%c ChatDataUpdated %c ${content}`,
			'background:blue; color:turquoise',
			'',
		);
	};

	// Return a provider that will now make the chatData and its helper functions available
	// for all its children components
	return (
		<ChatContext.Provider
			value={{
				chatData,
				updateChatData,
				resetChatData,
				eraseChatData,
				updateChatList,
				updateBlockedUsers,
				getNewChatsList,
				getNewBlockedUsers,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};
