import { timeFormat } from './base.js';

export default class EventRenderer {
	constructor() {
		if (EventRenderer._instance) {
			return EventRenderer._instance;
		}
		EventRenderer._instance = this;
		this.chatMessageWindow = document.getElementById("chatWindow");
	}


	buildTemplate(templateData) {

		if (templateData.type == "message") {
			this.buildMessage(templateData);
		}
		else if (templateData.type == "routeScript") {

		}
		else {

		}
	}


	buildMessage(message) {
		const chatId = message.chatId;

		if (chatId == activeChatId) {

			const lastMessage = this.chatMessageWindow.lastElementChild;
			let lastMessageUserId = null;

			const today = new Date(message.timestamp.getFullYear(), message.timestamp.getMonth(), message.timestamp.getDate());

			if (lastMessage != null) {

				lastMessageUserId = lastMessage.dataset.userId;

			}
			if (lastMessage && message.userId == lastMessageUserId) {

				lastMessage.querySelector(".messages-block").insertAdjacentHTML("beforeend", `
						
					<div class="message" style="background-color: ${message.displayColor};">
						<div class="message-content-line" id="message-${message.id}"> 
							<p class="message-text">${message.text}</p> 
							<label class="message-timestamp">${timeFormat(message.timestamp-today)}</label> 
						</div> 
					</div> `);
			}
			else {
				let htmlTemplate = `
				<div class="message-wrapper incoming" data-user-id="${message.userId}" id="message${message.id}"> 
					<img class="message-avatar" src="/media/${message.avatar}" alt="avatar"> 
					<div class="messages-block"> 
						<div class="message" style="background-color: ${message.displayColor};"> 
							<div class="message-username">${message.fullName}</div> 
							<div class="message-content-line" id="message-${message.id}"> 
								<p class="message-text">${message.text}</p> 
								<label class="message-timestamp">${timeFormat(message.timestamp-today)}</label> 
							</div> 
						</div> 
					</div>
				</div>`
				this.chatMessageWindow.insertAdjacentHTML("beforeend", htmlTemplate);
			}
		}
		
		this.updateLastMessageInChatsList(message);
		
	}


	updateLastMessageInChatsList(message) {
		const chatId = message.chatId;
		const today = new Date(message.timestamp.getFullYear(), message.timestamp.getMonth(), message.timestamp.getDate());

		document.getElementById(`chat${chatId}LastMessage`).innerText = message.fullName + ": " + message.text;
		document.getElementById(`chat${chatId}LastMessageTimestamp`).innerText = timeFormat(message.timestamp-today);

		if (activeChatId != chatId) {
			const unreadMessagesCounter = document.getElementById(`chat${chatId}UnreadMessagesCounter`);
			unreadMessagesCounter.innerText = parseInt(unreadMessagesCounter.innerText) + 1;
			unreadMessagesCounter.style.display = "flex";
		}
	}

}