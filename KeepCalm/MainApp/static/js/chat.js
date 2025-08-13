import GameTimeManager from './GameTimeManager.js';
import TimelineEventManager from './TimelineEventManager.js';
import LocalStorageManager from './localStorageManager.js';
import DebugTimeController from './DebugTimeController.js';
import EventRenderer from './EventRenderer.js';
import TimelineEvent from './TimelineEvent.js';
import TypingIndicatorManager from './TypingIndicatorManager.js';
import ChoiceTimerManager from './ChoiceTimerManager.js';
import AudioManager from './AudioManager.js';
import SoundController from './SoundController.js';


import { copyTextToClipboard, warnUser, Request, removeChildrens, timeFormat } from './base.js';

document.addEventListener("DOMContentLoaded", () => {


	Object.keys(nodes).forEach(nodeId => {
		nodes[nodeId]['nodeStartedAt'] = new Date(startGameDatetime);
	});

	timelineEvents = convertTimelineEvents(timelineEventsJSON);

	gameTimeManager = new GameTimeManager();
	timelineEventManager = new TimelineEventManager(timelineEvents);
	debugTimeController = new DebugTimeController(gameTimeManager);
	eventRenderer = new EventRenderer();
	typingIndicatorManager = new TypingIndicatorManager(eventRenderer, chats);
	choiceTimerManager = new ChoiceTimerManager();

	gameTimeManager.addObserver(debugTimeController);
	gameTimeManager.addObserver(timelineEventManager);


	for (let i = 0; i < timelineEventManager.pastTimelineEvents.length; i++) {
		eventRenderer.buildTemplate(timelineEventManager.pastTimelineEvents[i]);
	}

	gameTimeManager.start();

	console.log(LocalStorageManager.get("code"));

	audioManager = new AudioManager();
	soundController = new SoundController();

	startMusic();

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

	document.querySelectorAll('.chat-menu-line').forEach(div => {
		if (div.dataset.chatId == chatId) {
			div.classList.add("active-chat");
		}
		else {
			div.classList.remove("active-chat");
		}
	});


	const chatProperties = chats.find(chat => chat.id == chatId);
	const chatName = chatProperties.name;
	document.getElementById("activeChatHeader").innerText = chatName;

	for (let i = 0; i < alreadySentMessages.length; i++) {
		const message = alreadySentMessages[i];
		eventRenderer.buildTemplate(message);
	}

	typingIndicatorManager.updateChatStatus(chatId);
}


export function convertTimelineEvents(events) {
	let result = [];
	for (let i = 0; i < events.length; i++) {
		result.push(new TimelineEvent(events[i]));
	}
	return result;
}


async function startMusic() {
	audioManager.createChannel("sfx");
	audioManager.createChannel("music");

	await audioManager.buffer("click", "/static/audio/button_click_modern.mp3");
	await audioManager.buffer("glitch", "/static/audio/glitch_tv.mp3");
	await audioManager.buffer("music", "/static/audio/nervous_music.mp3");

	const savedMusicVolume = LocalStorageManager.get("musicVolume");
	const savedSfxVolume = LocalStorageManager.get("sfxVolume");

	if (savedMusicVolume != null && savedSfxVolume != null) {
		document.getElementById("sliderMusic").value = savedMusicVolume;
		document.getElementById("sliderSfx").value = savedSfxVolume;
	}

	audioManager.changeSoundLevel("music", parseInt(sliderMusic.value, 10));
	audioManager.changeSoundLevel("sfx", parseInt(sliderSfx.value, 10));

	audioManager.play("music", "music", 30, true);
}