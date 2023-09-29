import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Put,
	Req,
	Res,
	ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { CustomRequest } from 'src/user/user.controller';
import { SendMessageDTO } from './dto/sendMessage.dto';
import { TokenService } from 'src/token/token.service';
import { CreateChatDTO } from './dto/createChat.dto';
import { LeaveChannelDTO } from './dto/leaveChannel.dto';
import { SetPrivateDTO } from './dto/setPrivate.dto';
import { SetPasswordDTO } from './dto/setPassword.dto';
import { ValidationError } from 'class-validator';
import { JoinChannelDTO } from './dto/joinChannel.dto';
import { errorMonitor } from 'events';
import { BlockUserDTO } from '../user/dto/blockUser.dto';
import { UserService } from 'src/user/user.service';
import { KickDTO } from './dto/kick.dto';
import { FindPMDTO } from './dto/findPM.dto';
import { InviteDTO } from './dto/invite.dto';
import { removeEmitHelper } from 'typescript';
import { SetInviteReplyDTO } from './dto/setInviteReply.dto';
import { PassThrough } from 'stream';

@Controller('chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly prisma: PrismaService,
	) {}

	// get isChannel, isPrivate, isProtected from chat
	@Get('/chatInfo/:chatId')
	async getChatInfo(
		@Req() request: CustomRequest,
		@Param('chatId', new ValidationPipe()) chatId: number,
		@Res() res: Response,
	) {
		try {
			const chatIdNb = +chatId;
			this.tokenService.ExtractUserId(request.headers['authorization']);
			const response = await this.prisma.chat.findUnique({
				where: {
					id: chatIdNb,
				},
			});
			res.status(200).json({
				isChannel: response.isChannel,
				isPrivate: response.isPrivate,
				isProtected: response.isProtected,
			});
		} catch (e) {
			res.status(400).json({ message: 'Could not retreive chat info' });
		}
	}

	// get messages from chat
	@Get('/chatMessages/:chatId')
	async getChatMessages(
		@Req() request: CustomRequest,
		@Param('chatId', new ValidationPipe()) chatId: number,
		@Res() res: Response,
	) {
		try {
			const nbChatId = +chatId;
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				nbChatId,
			);
			if (!isUserInChat) {
				res.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			const messages = await this.chatService.getChatMessages(
				request,
				nbChatId,
			);
			res.status(200).json(messages);
		} catch (e) {
			res.status(403).json({ message: 'Could not retreive messages' });
		}
	}

	// create a private message chat with the user and the targeted user
	@Put('/createChat/')
	async createChat(
		@Body(new ValidationPipe()) createChat: CreateChatDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			// if its a channel
			if (createChat.name) {
				this.chatService
					.getChatByName(createChat.name)
					.then(async (res) => {
						// if res, we found a channel named the same
						if (res) throw new Error('This chat already exists');
						this.chatService
							.createChat(userId, createChat)
							.then(async (chatId) => {
								// create the chatSession associated to the channel
								await this.chatService.createOwnerChannelSession(
									userId,
									chatId,
								);
								response.status(200).json({ chatId: chatId });
							})
							.catch((e) => {
								throw new Error('Error creating the chat');
							});
					})
					.catch((e) => {
						response.status(401).json({ message: '' + e.message });
					});
				// if its a private message and the user does not already have a conv
			} else if (createChat.userId) {
				this.chatService
					.findPrivateMessageByID(createChat.userId, userId)
					.then((res) => {
						// if there was no chat with the user
						if (!res) {
							this.chatService
								.createChat(userId, createChat)
								.then(async (chatId) => {
									// create both chatSessions associated with the privateMessage
									await this.chatService.createChatSession(userId, chatId);
									await this.chatService.createChatSession(
										createChat.userId,
										chatId,
									);
									response.status(200).json({ chatId: chatId });
								})
								.catch((e) => {
									throw new Error('Could not create chat');
								});
						} else {
							throw new Error(
								'You already have a conversation with that person',
							);
						}
					})
					.catch((e) => {
						response.status(401).json({ message: e.message });
					});
			} else {
				response.status(401).json({ message: 'Could not create chat' });
			}
		} catch (e) {
			response.status(401).json({ message: e.message });
		}
	}

	@Put('/sendMessage')
	async sendMessage(
		@Body(new ValidationPipe()) validatedData: SendMessageDTO,
		@Req() request: CustomRequest,
		@Res() res: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				validatedData.chatId,
			);
			if (!isUserInChat) {
				res.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			const isUserMuted = await this.chatService.isUserMuted(
				validatedData.chatId,
				userId,
			);
			if (isUserMuted) {
				res.status(403).json({
					message: 'You were muted for 15 minutes, think about what you did',
				});
				return;
			}
			// specific to private messages
			if (validatedData.userId) {
				// cant send a message to someone that blocked you or that was blocked by you
				this.userService
					.isUserBlockedBy(userId, validatedData.userId)
					.then(async (response) => {
						if (response) res.status(403).json({ message: 'You are blocked' });
						else {
							this.userService
								.isUserBlocked(userId, validatedData.userId)
								.then(async (response) => {
									if (response)
										res.status(403).json({ message: 'You blocked that user' });
									else {
										await this.chatService.sendMessage(userId, validatedData);
										res
											.status(200)
											.json({ message: 'Message sent successfully' });
									}
								})
								.catch((e) => {
									throw new Error('Could not check if blocked: ' + e.message);
								});
						}
					})
					.catch((e) => {
						throw new Error('Could not check if blocked: ' + e.message);
					});
			} else {
				await this.chatService.sendMessage(userId, validatedData);
				res.status(200).json({ message: 'Message sent successfully' });
			}
		} catch (e) {
			res.status(400).json(e.message);
		}
	}

	@Delete('/leaveChat')
	async leaveChat(
		@Body(new ValidationPipe()) leaveChannel: LeaveChannelDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				leaveChannel.chatId,
			);
			if (!isUserInChat) {
				response.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			this.chatService
				.leaveChat(userId, leaveChannel.chatId)
				.then(() => {
					response.status(200).json({ message: 'Channel left successfully' });
				})
				.catch((e) => {
					response.status(400).json({ message: 'Error leaving the chat' });
				});
		} catch (e) {
			response
				.status(400)
				.json({ message: 'Something went wrong leaving the channel' });
		}
	}

	/* ********************************************************************* */
	/* ***************************** CHANNELS ****************************** */
	/* ********************************************************************* */

	@Put('/joinChannel')
	async joinChannel(
		@Body(new ValidationPipe()) validatedData: JoinChannelDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			// find the chat id with the channel name
			this.chatService
				.getChatByName(validatedData.name)
				.then(async (data) => {
					const isUserInChat = await this.chatService.isUserInChat(
						userId,
						data.id,
					);
					if (isUserInChat) {
						response
							.status(400)
							.json({ message: 'You are already in this chat' });
						return;
					}
					// if it is private, check that the user was invited
					if (data.isPrivate) {
						const isUserInvited = await this.chatService.isUserInvited(
							userId,
							data.id,
						);
						if (!isUserInvited) {
							response
								.status(403)
								.json({ message: 'Could not join the channel' });
							return;
						}
					}
					const isUserBanned = await this.chatService.isUserBanned(
						data.id,
						userId,
					);
					if (isUserBanned) {
						response
							.status(403)
							.json({ message: 'You are banned from this channel' });
						return;
					}
					this.chatService
						.checkPassword(data.id, validatedData.password)
						.then((canAccess) => {
							if (!canAccess) {
								response
									.status(403)
									.json({ message: 'The password is incorrect' });

								return;
							}
							// create the chat session and delete the invitation
							this.chatService
								.createChatSession(userId, data.id)
								.then(async () => {
									await this.chatService.deleteInvite(userId, data.id);
									response
										.status(200)
										.json({ chatId: data.id, participants: data.participants });
								})
								.catch((e) => {
									response.status(400).json({
										message: 'Could not join the channel',
									});
								});
						})
						.catch((e) => {
							response
								.status(403)
								.json({ message: 'This channel is protected' });
						});
				})
				.catch(() => {
					response.status(404).json({ message: 'Could not find channel' });
				});
		} catch (e) {
			response.status(401).json({ message: e.message });
		}
	}

	@Put('/invite')
	async invite(
		@Body(new ValidationPipe()) validatedData: InviteDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			// check that the user was not already in the room before inviting
			this.chatService
				.getRoom(validatedData.channelId)
				.then((roomData) => {
					for (const current of roomData.participants) {
						if (current.userId === validatedData.secondUserId) {
							response
								.status(400)
								.json({ message: 'This user is already in the room' });
							return;
						}
					}
					this.chatService
						.invite(validatedData.secondUserId, validatedData.channelId)
						.then(() => {
							response
								.status(200)
								.json({ message: 'User invited successfully' });
						})
						.catch((e) => {
							response.status(400).json({ message: 'Could not invite user' });
							return;
						});
				})
				.catch((e) => {
					response.status(404).json({ message: 'Could not find room' });
				});
		} catch (e) {
			response.status(401).json({ message: e.message });
		}
	}

	@Put('/setPrivate')
	async setPrivate(
		@Body(new ValidationPipe()) setPrivate: SetPrivateDTO,
		@Req() request: CustomRequest,
		@Res() res: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				setPrivate.chatId,
			);
			if (!isUserInChat) {
				res.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			// if the user is not admin/owner, cant switch to private
			this.chatService.getAdminInfo(setPrivate.chatId, userId).then((data) => {
				if (data.isAdmin || data.isOwner) {
					this.chatService
						.setPrivacySettings(setPrivate.chatId, setPrivate.toPrivate)
						.then(() => {
							res.status(200).json({
								message: 'switched chat privacy settings successfully',
							});
						});
				} else {
					res
						.status(403)
						.json({ message: "You don't have sufficient admin rights" });
					return;
				}
			});
		} catch (e) {
			res.status(401).json({ message: e.message });
		}
	}

	/* ******************************* ADMIN ******************************* */

	@Delete('/kick')
	async kick(
		// @Body() leaveChannel: LeaveChannelDTO,
		@Body(new ValidationPipe()) validatedData: KickDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				validatedData.chatId,
			);
			if (!isUserInChat) {
				response.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			if (userId === validatedData.targetId) {
				response.status(400).json({ message: 'Seriously?' });
				return;
			}
			this.chatService
				.getAdminInfo(validatedData.chatId, userId)
				.then((data) => {
					if (!data.isAdmin && !data.isOwner) {
						response
							.status(403)
							.json({ message: "You don't have sufficient rights" });
						return;
					}
					this.chatService
						.getAdminInfo(validatedData.chatId, validatedData.targetId)
						.then((targetData) => {
							if (targetData.isOwner) {
								response
									.status(403)
									.json({ message: "You can't kick the owner of the channel" });
								return;
							}
							// is admin?
							this.chatService
								.leaveChat(validatedData.targetId, validatedData.chatId)
								.then(() => {
									response
										.status(200)
										.json({ message: 'User kicked successfully' });
								})
								.then(() => {
									this.chatService
										.sendNotification(
											userId,
											validatedData.chatId,
											validatedData.targetId,
											'kick',
										)
										.catch((e) => {
											response
												.status(400)
												.json({ message: 'could not send the notification' });
										});
								});
						})
						.catch((e) => {
							response
								.status(403)
								.json({ message: 'Could not retreive your admin infos' });
							return;
						});
				})
				.catch((e) => {
					response
						.status(403)
						.json({ message: 'Could not retreive your admin infos' });
					return;
				});
		} catch (e) {
			response
				.status(400)
				.json({ message: 'Something went wrong kicking the user' });
		}
	}
	@Put('/makeAdmin')
	async makeAdmin(
		@Body(new ValidationPipe()) validatedData: KickDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				validatedData.chatId,
			);
			if (!isUserInChat) {
				response.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			// is the user requesting admin?
			this.chatService
				.getAdminInfo(validatedData.chatId, userId)
				.then((data) => {
					if (!data.isAdmin && !data.isOwner) {
						response
							.status(403)
							.json({ message: "You don't have sufficient rights" });
						return;
					}
					// is the target admin ?
					this.chatService
						.getAdminInfo(validatedData.chatId, validatedData.targetId)
						.then((targetData) => {
							if (targetData.isOwner || targetData.isAdmin) {
								response
									.status(400)
									.json({ message: 'The user is already an administrator' });
								return;
							}

							this.chatService
								.makeAdmin(validatedData.chatId, validatedData.targetId)
								.then(() => {
									response
										.status(200)
										.json({ message: 'The user is now an administrator' });
								})
								.then(() => {
									this.chatService
										.sendNotification(
											userId,
											validatedData.chatId,
											validatedData.targetId,
											'admin',
										)
										.catch((e) => {
											response
												.status(400)
												.json({ message: 'Could not send notification' });
										});
								})
								.catch((e) => {
									response
										.status(400)
										.json({ message: 'Could not make admin' });
								});
						})
						.catch((e) => {
							response
								.status(403)
								.json({ message: 'Could not retreive your admin infos' });
							return;
						});
				})
				.catch((e) => {
					response
						.status(403)
						.json({ message: 'Could not retreive your admin infos' });
					return;
				});
		} catch (e) {
			response.status(400).json({
				message: 'Something went wrong making the user administrator',
			});
		}
	}

	@Put('/mute')
	async mute(
		@Body(new ValidationPipe()) validatedData: KickDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = await this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				validatedData.chatId,
			);
			if (!isUserInChat) {
				response.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			if (userId === validatedData.targetId) {
				response.status(400).json({ message: 'Seriously?' });
				return;
			}
			// is the user requesting admin?
			this.chatService
				.getAdminInfo(validatedData.chatId, userId)
				.then((data) => {
					if (!data.isAdmin && !data.isOwner) {
						response
							.status(403)
							.json({ message: "You don't have sufficient rights" });
						return;
					}
					// is the target owner ?
					this.chatService
						.getAdminInfo(validatedData.chatId, validatedData.targetId)
						.then((targetData) => {
							if (targetData.isOwner) {
								response
									.status(400)
									.json({ message: "You can't mute the owner of the channel" });
								return;
							}

							this.chatService
								.mute(validatedData.chatId, validatedData.targetId)
								.then(() => {
									response
										.status(200)
										.json({ message: 'The user is now muted' });
								})
								.then(() => {
									this.chatService
										.sendNotification(
											userId,
											validatedData.chatId,
											validatedData.targetId,
											'mute',
										)
										.catch((e) => {
											response
												.status(400)
												.json({ message: 'Could not send notification' });
										});
								})
								.catch((e) => {
									response.status(400).json({ message: 'Could not mute' });
								});
						})
						.catch((e) => {
							response
								.status(403)
								.json({ message: 'Could not retreive your admin infos' });
							return;
						});
				})
				.catch((e) => {
					response
						.status(403)
						.json({ message: 'Could not retreive your admin infos' });
					return;
				});
		} catch (e) {
			response.status(400).json({
				message: 'Something went wrong muting the user',
			});
		}
	}

	@Put('/ban')
	async ban(
		@Body(new ValidationPipe()) validatedData: KickDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				validatedData.chatId,
			);
			if (!isUserInChat) {
				response.status(400).json({ message: 'You are not in this chat' });
				return;
			}
			if (userId === validatedData.targetId) {
				response.status(400).json({ message: 'Seriously?' });
				return;
			}
			// is the user requesting admin?
			this.chatService
				.getAdminInfo(validatedData.chatId, userId)
				.then((data) => {
					if (!data.isAdmin && !data.isOwner) {
						response
							.status(403)
							.json({ message: "You don't have sufficient rights" });
						return;
					}
					// is the target owner ?
					this.chatService
						.getAdminInfo(validatedData.chatId, validatedData.targetId)
						.then((targetData) => {
							if (targetData.isOwner) {
								response
									.status(403)
									.json({ message: "You can't ban the owner of the channel" });
								return;
							}

							this.chatService
								.ban(validatedData.chatId, validatedData.targetId)
								.then(() => {
									this.chatService
										.leaveChat(validatedData.targetId, validatedData.chatId)
										.then(() => {
											response.status(200).json({
												message: 'The user is now banned from the channel',
											});
										})
										.then(() => {
											this.chatService
												.sendNotification(
													userId,
													validatedData.chatId,
													validatedData.targetId,
													'ban',
												)
												.catch((e) => {
													response
														.status(400)
														.json({ message: 'Could not send notification' });
												});
										})
										.catch(() => {
											response.status(400).json({
												message: 'The user could not leave the channel',
											});
										});
								})

								.catch((e) => {
									response.status(400).json({ message: 'Could not ban' });
								});
						})
						.catch((e) => {
							response
								.status(403)
								.json({ message: 'Could not retreive your admin infos' });
							return;
						});
				})
				.catch((e) => {
					response
						.status(403)
						.json({ message: 'Could not retreive your admin infos' });
					return;
				});
		} catch (e) {
			response.status(400).json({
				message: 'Something went wrong banning the user from the channel',
			});
		}
	}

	@Get('/getOwnAdminInfo/:chatId')
	async getOwnAdminInfo(
		@Req() request: CustomRequest,
		@Res() res: Response,
		@Param('chatId', new ValidationPipe()) chatId: number,
	) {
		try {
			const nbChatId: number = +chatId;
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			this.chatService
				.getAdminInfo(nbChatId, userId)
				.then((data) => {
					res
						.status(200)
						.json({ isAdmin: data.isAdmin, isOwner: data.isOwner });
				})
				.catch((e) => {
					throw new Error('Could not find your session');
				});
		} catch (e) {
			res.status(401).json({ message: e.message });
		}
	}

	@Put('/setPassword')
	async setPassword(
		@Req() request: CustomRequest,
		@Body(new ValidationPipe()) validatedData: SetPasswordDTO,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			this.chatService
				.getAdminInfo(validatedData.chatId, userId)
				.then((data) => {
					if (data.isAdmin || data.isOwner) {
						this.chatService
							.setPassword(validatedData.chatId, validatedData.password)
							.then(() => {
								response.status(200).json({
									message: 'changed password successfully',
								});
							})
							.catch((e) => {
								response
									.status(400)
									.json({ message: 'could not change password' });
							});
					} else {
						response
							.status(403)
							.json({ message: "You don't have sufficient admin rights" });
					}
				});
		} catch (e) {
			response.status(400).json({ message: e.message });
		}
	}

	/* ********************************************************************* */
	/* ************************* PRIVATE MESSAGES ************************** */
	/* ********************************************************************* */

	// get messages from chat
	@Get('/findPrivateMessage/:secondUserId')
	async findPrivateMessage(
		@Req() request: CustomRequest,
		@Param('secondUserId', new ValidationPipe()) secondUserId: number,
		@Res() res: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const secondUserIdNb: number = +secondUserId;
			this.chatService
				.findPrivateMessageByID(userId, secondUserIdNb)
				.then((data) => {
					res.status(200).json({ chatId: data.id });
				})
				.catch((e) => {
					res.status(404).json({ message: 'Could not find private message' });
					return;
				});
		} catch (e) {
			res.status(400).json({ message: 'Could not find private message' });
		}
	}

	@Put('/setInviteReply')
	async setInviteReply(
		@Req() request: CustomRequest,
		@Body(new ValidationPipe()) validatedData: SetInviteReplyDTO,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			// check if the user received the message
			this.chatService
				.checkRecipient(userId, validatedData.chatId)
				.then(() => {
					this.chatService
						.replyToInvite(validatedData.chatId, validatedData.reply)
						.then(() => {
							response
								.status(200)
								.json({ message: 'You replied to the invitation' });
						})
						.catch((e) => {
							response
								.status(400)
								.json({ message: 'You could not reply to the invitation' });
						});
				})
				.catch((e) => {
					response
						.status(403)
						.json({ message: 'This message was not for to you' });
				});
		} catch (e) {
			response.status(400).json({ message: e.message });
		}
	}
}
