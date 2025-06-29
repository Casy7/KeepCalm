import ChatMessageManager from './ChatMessageManager.js';
import TimeObserver from './TimeObserver.js';


export default class DebugTimeController extends TimeObserver {

	constructor(gameTimeManager) {
		super();
		this.gameTimeManager = gameTimeManager;
		this.isRunning = true;

		this._setupListeners();
		this._updateDebugTimeField();
	}

	timeUpdated(newTime) {
		this._updateDebugTimeField();
	}


	_setupListeners() {
		document.getElementById("decrease-time").addEventListener("click", () => this.toggleTime());
		document.getElementById("decreaseTimeByOneHour").addEventListener("click", () => this.changeTime(-60));
		document.getElementById("decreaseTimeByOneMinute").addEventListener("click", () => this.changeTime(-1));
		document.getElementById("increaseTimeByOneMinute").addEventListener("click", () => this.changeTime(1));
		document.getElementById("increaseTimeByOneHour").addEventListener("click", () => this.changeTime(60));
		document.getElementById("set-new-time").addEventListener("click", () => this.setNewTime());
	}

	toggleTime() {
		if (this.isRunning) {
			this.gameTimeManager.stop();
		} else {
			this.gameTimeManager.start();
		}
		this.isRunning = !this.isRunning;
	}

	changeTime(minutes) {

		const current = this.gameTimeManager.now();
		current.setMinutes(current.getMinutes() + minutes);
		this.gameTimeManager.inGameTime = current;
		this._updateDebugTimeField();
		chatMessageManager.splitMessagesByTime();
	}

	setNewTime() {
		const input = document.getElementById("debugTime").value;
		const parsed = new Date(input);

		if (isNaN(parsed.getTime())) {
			alert("Invalid date format. Use YYYY-MM-DDTHH:MM:SS");
			return;
		}

		this.gameTimeManager.inGameTime = parsed;
		this._updateDebugTimeField();
	}

	_updateDebugTimeField() {
		const input = document.getElementById("debugTime");

		const date = new Date(this.gameTimeManager.now());

		const offsetInMinutes = date.getTimezoneOffset();
		const correctedDate = new Date(date.getTime() - offsetInMinutes * 60 * 1000);

		input.value = correctedDate.toISOString().slice(0, 19);
	}
}
