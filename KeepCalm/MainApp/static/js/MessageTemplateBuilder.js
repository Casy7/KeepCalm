import { formatTime } from './base.js';

export default class MessageTemplateBuilder {
	constructor() {
		if (MessageTemplateBuilder._instance) {
			return MessageTemplateBuilder._instance;
		}
		MessageTemplateBuilder._instance = this;
		this.chatMessageWindow = document.getElementById("chatWindow");
	}

	

	buildTemplate(message) {
		let htmlTemplate = `
		<div class="message-wrapper incoming"> 
			<img class="message-avatar" src="/static/images/users/code.jpg" alt="avatar"> 
			<div class="messages-block"> 
				<div class="message user-2"> 
					<div class="message-username">${message.fullName}</div> 
					<div class="message-content-line" id="message-${message.id}"> 
						<p class="message-text">${message.text}</p> 
						<label class="message-timestamp">${formatTime(message.timestamp)}</label> 
					</div> 
				</div> 
			</div>
		</div>`
		chatWindow.insertAdjacentHTML("beforeend", htmlTemplate);
	}
}