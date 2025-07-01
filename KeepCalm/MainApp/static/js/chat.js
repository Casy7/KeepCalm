import GameTimeManager from './GameTimeManager.js';
import TimelineEventManager from './TimelineEventManager.js';
import LocalStorageManager from './localStorageManager.js';
import DebugTimeController from './DebugTimeController.js';
import EventRenderer from './EventRenderer.js';
import TimelineEvent from './TimelineEvent.js';
import TypingIndicatorManager from './TypingIndicatorManager.js';



import { copyTextToClipboard, warnUser, Request, removeChildrens, formatTime } from './base.js';

document.addEventListener("DOMContentLoaded", () => {

	timelineEvents = convertTimelineEvents(timelineEventsJSON);

	gameTimeManager = new GameTimeManager();
	timelineEventManager = new TimelineEventManager(timelineEvents);
	debugTimeController = new DebugTimeController(gameTimeManager);
	eventRenderer = new EventRenderer();
	typingIndicatorManager = new TypingIndicatorManager(eventRenderer);

	gameTimeManager.addObserver(debugTimeController);
	gameTimeManager.addObserver(timelineEventManager);

	for (let i = 0; i < timelineEventManager.pastTimelineEvents.length; i++) {
		eventRenderer.buildTemplate(timelineEventManager.pastTimelineEvents[i]);
	}

	gameTimeManager.start();

	console.log(LocalStorageManager.get("code"));

});

document.querySelectorAll('.chat-menu-line').forEach(div => {

	div.addEventListener('click', () => {
		activeChatId = div.dataset.chatId;
		openChat(div.dataset.chatId);
		const unreadMessagesCounter = document.getElementById(`chat${div.dataset.chatId}UnreadMessagesCounter`);
		unreadMessagesCounter.innerText = 0;
		unreadMessagesCounter.style.display = "none";
	});

});


function openChat(chatId) {
	chatId = parseInt(chatId);
	removeChildrens(document.getElementById("chatWindow"));
	let alreadySentMessages = timelineEventManager.getPastTimelineEventsByChatId(chatId);
	const chatWindow = document.getElementById("chatWindow");

	

	for (let i = 0; i < alreadySentMessages.length; i++) {
		const message = alreadySentMessages[i];
		eventRenderer.buildTemplate(message);
	}
}


function convertTimelineEvents(events) {
	let result = [];
	for (let i = 0; i < events.length; i++) {
		result.push(new TimelineEvent(events[i]));
	}
	return result;
}

