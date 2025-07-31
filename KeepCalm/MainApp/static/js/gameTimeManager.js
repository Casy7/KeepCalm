import Observable from './Observable.js';

export default class GameTimeManager extends Observable {
	
	constructor() {
		super();
		if (GameTimeManager._instance) {
			return GameTimeManager._instance;
		}
		GameTimeManager._instance = this;

		this.tickRate = 1000;
		this.startGameDatetime = startGameDatetime;
		this.inGameTime = new Date(startGameDatetime);
		this._intervalId = null;
	}

	tick() {
		this.inGameTime.setTime(this.inGameTime.getTime() + this.tickRate);
		// console.log("Tick:", this.inGameTime);
	}

	_tickAndNotify() {
		this.tick();
		this.notifyObservers();
	}

	_runTickerLoop() {
		if (this._intervalId !== null) return;
		this._intervalId = setInterval(() => this._tickAndNotify(), this.tickRate);
	}

	start() {
		this._runTickerLoop();
		console.log("Game time started.");
	}

	stop() {
		if (this._intervalId !== null) {
			clearInterval(this._intervalId);
			this._intervalId = null;
			console.log("Game time stopped.");
		}
	}

	now() {
		return new Date(this.inGameTime);
	}

}
