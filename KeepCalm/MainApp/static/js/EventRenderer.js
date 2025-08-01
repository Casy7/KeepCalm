import { removeChildrens, timeFormat, Request, warnUser } from './base.js';
import { convertTimelineEvents } from './chat.js';

async function selectOption(optionNodeId) {

	let rqData = {
		'nodeId': optionNodeId,
		'userSessionCode': sessionCode,
		'nodeSelectedTime': gameTimeManager.now()
	}

	const rq = new Request({ url: `/select_option/`, data: rqData });
	await rq.send();

	if (rq.result === "success") {
 
		warnUser("Choice has been made!", "");
		Object.assign(nodes, rq.recievedData.addedNodes);
		timelineEventManager.futureTimelineEvents.push(...convertTimelineEvents(rq.recievedData.newTimelineEvents));

	} else {

		console.log(rq.result);

	}
}

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
		else if (templateData.type == "choice") {
			this.buildChoiceSelector(templateData);
		}
		else if (templateData.type == "routeScript") {

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
							<label class="message-timestamp">${timeFormat(message.timestamp - today)}</label> 
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
								<label class="message-timestamp">${timeFormat(message.timestamp - today)}</label> 
							</div> 
						</div> 
					</div>
				</div>`
				this.chatMessageWindow.insertAdjacentHTML("beforeend", htmlTemplate);
			}
		}

		this.updateLastMessageInChatsList(message);

	}


	buildChoiceSelector(timelineEvent) {
		const optionContainer = document.getElementById("choiceOptionsWrapper");
		removeChildrens(optionContainer);
		const chatId = timelineEvent.chatId;
		if (chatId == activeChatId && !timelineEvent.alreadySelected) {

			timelineEvent.options.forEach(choice => {

				let optionId = `selectOption${choice.id}`;
				let htmlTemplate = `
				<div class="message-wrapper outgoing choice-option" data-value="${choice.id}" id="selectOption${choice.id}">
					<div class="message option">
						<div class="message-content-line option">
						<p class="message-text option">${choice.text}</p>
						</div>
					</div>
				</div>`;
				optionContainer.insertAdjacentHTML("beforeend", htmlTemplate);

				document.getElementById(optionId).addEventListener("click", (event) => {
					selectOption(event.target.closest(".choice-option").dataset.value);
					removeChildrens(document.getElementById("choiceOptionsWrapper"));

					timelineEventManager.pastTimelineEvents.find(msg => msg.id == timelineEvent.id)["alreadySelected"] = true;
				})
			});			
		}
	}


	updateLastMessageInChatsList(message) {
		const chatId = message.chatId;
		const today = new Date(message.timestamp.getFullYear(), message.timestamp.getMonth(), message.timestamp.getDate());

		document.getElementById(`chat${chatId}LastMessage`).innerText = message.fullName + ": " + message.text;
		document.getElementById(`chat${chatId}LastMessageTimestamp`).innerText = timeFormat(message.timestamp - today);

		if (activeChatId != chatId) {
			const unreadMessagesCounter = document.getElementById(`chat${chatId}UnreadMessagesCounter`);
			unreadMessagesCounter.innerText = parseInt(unreadMessagesCounter.innerText) + 1;
			unreadMessagesCounter.style.display = "flex";
		}
	}



}