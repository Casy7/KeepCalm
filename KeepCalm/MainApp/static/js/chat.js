import GameTimeManager from './GameTimeManager.js';
import ChatMessageManager from './ChatMessageManager.js';
import LocalStorageManager from './localStorageManager.js';
import DebugTimeController from './DebugTimeController.js';
import MessageTemplateBuilder from './MessageTemplateBuilder.js';

import { copyTextToClipboard, warnUser, Request, removeChildrens, formatTime } from './base.js';

document.addEventListener("DOMContentLoaded", () => {

	gameTimeManager = new GameTimeManager();
	chatMessageManager = new ChatMessageManager(messages);
	debugTimeController = new DebugTimeController(gameTimeManager);
	messageTemplateBuilder = new MessageTemplateBuilder();

	gameTimeManager.addObserver(debugTimeController);
	gameTimeManager.addObserver(chatMessageManager);
	gameTimeManager.start();

	console.log("We're DOMed!");
	console.log(LocalStorageManager.get("code"));

});

document.querySelectorAll('.chat-menu-line').forEach(div => {

	div.addEventListener('click', () => {
		openChat(div.dataset.chatId);
		activeChatId = div.dataset.chatId;
	});

});


function openChat(chatId) {
	chatId = parseInt(chatId);
	removeChildrens(document.getElementById("chatWindow"));
	let alreadySentMessages = chatMessageManager.getPastMessagesByChatId(chatId);
	const chatWindow = document.getElementById("chatWindow");

	for (let i = 0; i < alreadySentMessages.length; i++) {
		const message = alreadySentMessages[i];
		messageTemplateBuilder.buildTemplate(message);
	}
}


