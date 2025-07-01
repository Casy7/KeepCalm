export default class TypingIndicatorManager {
	constructor(eventRenderer) {
		this.typingUsers = new Map(); // userId => timeoutId
		this.chatStatusElement = document.getElementById("chatStatus");
		this.eventRenderer = eventRenderer;
	}

	startTyping(message) {
		const userId = message.userId;

		// Если уже "пишет" — отменяем старый таймер
		if (this.typingUsers.has(userId)) {
			clearTimeout(this.typingUsers.get(userId));
		}

		// Ставим новый
		const timeoutId = setTimeout(() => {
			this.typingUsers.delete(userId);
			this.updateChatStatus();

			// Отрисовать сообщение после "печатает"
			this.eventRenderer.buildMessage(message);
		}, message.getTypingDelay());

		this.typingUsers.set(userId, timeoutId);
		this.updateChatStatus();
	}

	updateChatStatus() {
		const usersTyping = [...this.typingUsers.keys()].map(id => this.getUserName(id));

		if (usersTyping.length === 0) {
			this.chatStatusElement.innerText = "";
		}
		else if (usersTyping.length === 1) {
			this.chatStatusElement.innerText = `${usersTyping[0]} друкує...`;
		}
		else if (usersTyping.length === 2) {
			this.chatStatusElement.innerText = `${usersTyping[0]}, ${usersTyping[1]} друкують...`;
		}
		else {
			this.chatStatusElement.innerText = `${usersTyping.length} користувачі друкують...`;
		}
	}

	// Можешь переписать под getCharacterById(userId) или как у тебя там устроено
	getUserName(userId) {
		const user = users.find(u => u.id == userId);
		return user ? user.fullName : `???`;
	}
}
