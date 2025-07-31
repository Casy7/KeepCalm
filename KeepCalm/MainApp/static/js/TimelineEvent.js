
export default class TimelineEvent {
	constructor(data) {
		Object.assign(this, data);
		this.lava = "lavaBucket";
		this.timestamp = this.getTypingStartTime();
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

		const nodeStartedAt = nodes[this.nodeId]['nodeStartedAt'];
		let result = new Date(nodeStartedAt);
		result.setTime(parseInt(result.getTime()) + parseInt(this.delayMs));
		return result;
	}
}
