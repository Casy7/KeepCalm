// import TimelineEventManager from "./TimelineEventManager";

export default class TypingIndicatorManager {
	constructor(eventRenderer, chats) {
		this.typingTimers = new Map(); // messageId => timeoutId
		this.chatStatusElement = document.getElementById("chatStatus");
		this.eventRenderer = eventRenderer;
		this.chats = chats;
	}

	startTyping(message) {
		const userId = message.userId;
		const chatId = message.chatId;

		const timeout = message.getTypingDelay();
		const timeoutId = setTimeout(() => {
			// console.log(message.text);
			this.eventRenderer.buildMessage(message);
			this.typingTimers.delete(message.id);

			this.updateChatStatus(chatId, true);
		}, timeout);

		this.typingTimers.set(message.id, timeoutId);

		this.updateChatStatus(chatId);
	}


	updateChatStatus(chatId, clearStatus = false) {

		if (clearStatus) {
			this.renderStatus(chatId, "");
			return;
		}

		const activeUserIds = new Set();

		// Пробегаем по ВСЕМ активным таймерам
		for (const [messageId, timeoutId] of this.typingTimers.entries()) {
			const message = timelineEventManager.futureTimelineEvents.find(t => t.id == messageId);
			if (message && message.chatId === chatId) {
				activeUserIds.add(message.userId);
			}
		}

		const usersTyping = [...activeUserIds].map(id => this.getUserName(id));

		if (usersTyping.length === 0) {
			if (timelineEventManager.getPastTimelineEventsByChatId(chatId)[length - 1]) {
				this.renderStatus(chatId, lastMessage.fullName + ": " + lastMessage.text);
			}
			else {
				this.renderStatus(" ");
			}
		} else if (usersTyping.length === 1) {
			this.renderStatus(chatId, `${usersTyping[0]} друкує...`);
		} else if (usersTyping.length === 2) {
			this.renderStatus(chatId, `${usersTyping[0]}, ${usersTyping[1]} друкують...`);
		} else {
			this.renderStatus(chatId, `${usersTyping.length} користувачі друкують...`);
		}
		// this.eventRenderer.updateLastMessageInChatsList(message);
	}


	renderStatus(chatId, status = "") {
		if (activeChatId == chatId) {
			this.chatStatusElement.innerText = status;
		}
		else {
			// document.getElementById(`chat${chatId}LastMessage`).innerText = status;
		}
	}

	getUserName(userId) {
		const user = users.find(u => u.id == userId);
		return user ? user.fullName : `???`;
	}
}
