
export default class TimelineEvent {
	constructor(data) {
		Object.assign(this, data);
		this.lava = "lavaBucket";
		this.timestamp = new Date(data.timestamp);
	}

	getTypingDelay() {
		if (this.type !== "message") {
			return 0;
		}
		if (this.typingDelayOverride !== -1){
			return this.typingDelayOverride;
		}
		return this.text.length / this.typingSpeed * MS_PER_CHAR;
	}

	getTypingStartTime() {
		return this.timestamp - this.getTypingDelay();
	}
}
