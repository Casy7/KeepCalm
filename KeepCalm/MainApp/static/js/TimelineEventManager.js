import TimeObserver from './TimeObserver.js';


export default class TimelineEventManager extends TimeObserver {
	static _instance = null;

	constructor(timelineEvents) {
		super();
		if (TimelineEventManager._instance) {
			return TimelineEventManager._instance;
		}

		this.timelineEvents = this._sortTimelineEventsByTimestamp(timelineEvents);
		this.pastTimelineEvents = [];
		this.futureTimelineEvents = [];
		this.index = 0;

		this.splitTimelineEventsByTime();

		TimelineEventManager._instance = this;
	}

	timeUpdated(newTime) {
		this.refreshPastAndFutureLists();
	}

	refreshPastAndFutureLists() {
		this.sortFutureBySendingDelay();
		let i = 0;
		while (i < this.futureTimelineEvents.length && this.futureTimelineEvents[i].timestamp < gameTimeManager.now()) {
			this.sendTimelineEvent(this.futureTimelineEvents[i]);
			this.pastTimelineEvents.push(this.futureTimelineEvents[i]);
			i++;
		}
		this.futureTimelineEvents = this.futureTimelineEvents.slice(i);
	}

	sortFutureBySendingDelay() {
		this.futureTimelineEvents = this.futureTimelineEvents.sort((a, b) => parseInt(a.delayMs) - parseInt(b.delayMs));
	}


	splitTimelineEventsByTime() {

		this.pastTimelineEvents = [];
		this.futureTimelineEvents = [];

		for (const msg of this.timelineEvents) {
			if (msg.getTypingStartTime() < gameTimeManager.now()) {
				this.pastTimelineEvents.push(msg);
			} else {
				this.futureTimelineEvents.push(msg);
			}
		}
	}

	_sortTimelineEventsByTimestamp(timelineEvents) {
		return timelineEvents.sort((a, b) => a.getTypingStartTime() - b.getTypingStartTime());
	}

	getTimelineEventsByChatId(source, chatId) {
		return source.filter(m => m.chatId == chatId);
	}

	getPastTimelineEventsByChatId(chatId) {
		return this.getTimelineEventsByChatId(this.pastTimelineEvents, chatId);
	}

	getFutureTimelineEventsByChatId(chatId) {
		return this.getTimelineEventsByChatId(this.futureTimelineEvents, chatId);
	}

	getTimelineEventById(id) {
		return this.timelineEvents.find(m => m.id == id);
	}

	sendTimelineEvent(timelineEvent) {
		if (timelineEvent.type == "message") {
			typingIndicatorManager.startTyping(timelineEvent);
		}
		else {
			eventRenderer.buildTemplate(timelineEvent);
		}
	}
}
