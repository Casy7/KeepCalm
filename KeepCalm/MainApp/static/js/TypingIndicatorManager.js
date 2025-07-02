export default class TypingIndicatorManager {
	constructor(eventRenderer, chats) {
		this.typingUsersForEachChat = {} // userId => timeoutId
		this.chatStatusElement = document.getElementById("chatStatus");
		this.eventRenderer = eventRenderer;
		this.chats = chats;
	}

	startTyping(message) {
		const userId = message.userId;
		const chatId = message.chatId;

		if (this.typingUsersForEachChat[chatId] === undefined) {
			this.typingUsersForEachChat[chatId] = new Map();
		}

		const chatUsersTyping = this.typingUsersForEachChat[chatId];

		// Если уже "пишет" — отменяем старый таймер
		if (chatUsersTyping.has(userId)) {
			clearTimeout(chatUsersTyping.get(userId));
		}

		// Ставим новый
		const timeoutId = setTimeout(() => {
			chatUsersTyping.delete(userId);
			this.updateChatStatus(chatId);

			// Отрисовать сообщение после "печатает"
			this.eventRenderer.buildMessage(message);
		}, message.getTypingDelay());

		chatUsersTyping.set(userId, timeoutId);
		this.updateChatStatus(chatId);
	}

	updateChatStatus(chatId) {

		if (this.typingUsersForEachChat[chatId] === undefined) {
			this.typingUsersForEachChat[chatId] = new Map();
		}

		const chatUsersTyping = this.typingUsersForEachChat[chatId];

		const usersTyping = [...chatUsersTyping.keys()].map(id => this.getUserName(id));

		if (usersTyping.length === 0) {
			this.renderStatus(chatId, "");
		}
		else if (usersTyping.length === 1) {
			this.renderStatus(chatId, `${usersTyping[0]} друкує...`);
		}
		else if (usersTyping.length === 2) {
			this.renderStatus(chatId, `${usersTyping[0]}, ${usersTyping[1]} друкують...`);
		}
		else {
			this.renderStatus(chatId, `${usersTyping.length} користувачі друкують...`);
		}
	}

	renderStatus(chatId, status = "") {
		if (activeChatId == chatId) {
			this.chatStatusElement.innerText = status;
		}
		else {
			document.getElementById(`chat${chatId}LastMessage`).innerText = status;
		}
	}

	getUserName(userId) {
		const user = users.find(u => u.id == userId);
		return user ? user.fullName : `???`;
	}
}
