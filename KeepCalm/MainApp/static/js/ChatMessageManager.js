import TimeObserver from './TimeObserver.js';


export default class ChatMessageManager extends TimeObserver {
	static _instance = null;

	constructor(messages) {
		super();
		if (ChatMessageManager._instance) {
			return ChatMessageManager._instance;
		}

		this.messages = this._sortMessagesByTimestamp(this._convertTimestampsFromStr(messages));
		this.pastMessages = [];
		this.futureMessages = [];
		this.index = 0;

		this.splitMessagesByTime();

		ChatMessageManager._instance = this;
	}

	timeUpdated(newTime) {
		this.refreshPastAndFutureLists();
	}

	refreshPastAndFutureLists() {
		let i = 0;
		while (i < this.futureMessages.length && this.futureMessages[i].timestamp < gameTimeManager.now()) {
			this.sendMessage(this.futureMessages[i]);
			this.pastMessages.push(this.futureMessages[i]);
			i++;
		}
		this.futureMessages = this.futureMessages.slice(i);
	}

	splitMessagesByTime() {

		this.pastMessages = [];
		this.futureMessages = [];

		for (const msg of this.messages) {
			if (msg.timestamp < gameTimeManager.now()) {
				this.pastMessages.push(msg);
			} else {
				this.futureMessages.push(msg);
			}
		}
	}

	_sortMessagesByTimestamp(messages) {
		return messages.sort((a, b) => a.timestamp - b.timestamp);
	}

	_convertTimestampsFromStr(messages) {
		return messages.map(msg => ({
			...msg,
			timestamp: new Date(msg.timestamp)
		}));
	}

	getMessagesByChatId(source, chatId) {
		return source.filter(m => m.chatId == chatId);
	}

	getPastMessagesByChatId(chatId) {
		return this.getMessagesByChatId(this.pastMessages, chatId);
	}

	getFutureMessagesByChatId(chatId) {
		return this.getMessagesByChatId(this.futureMessages, chatId);
	}

	getMessageById(id) {
		return this.messages.find(m => m.id == id);
	}

	sendMessage(message) {
		messageTemplateBuilder.buildTemplate(message);
	}
}
