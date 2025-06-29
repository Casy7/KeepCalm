export default class Observable {
	constructor() {
		this.observers = [];
	}

	addObserver(observer) {
		if (observer && typeof observer.timeUpdated === "function") {
			this.observers.push(observer);
		}
	}

	removeObserver(observer) {
		this.observers = this.observers.filter(o => o !== observer);
	}

	notifyObservers(data) {
		for (const observer of this.observers) {
			observer.timeUpdated(data);
		}
	}
}
