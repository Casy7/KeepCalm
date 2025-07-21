export default class TimeObserver {
	timeUpdated(currentTime) {
		throw new Error("timeUpdated() must be implemented in subclass");
	}
}