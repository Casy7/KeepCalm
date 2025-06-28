class GameTimeManager  {
	constructor() {
		if (GameTimeManager._instance) {
			return GameTimeManager._instance;
		}
		GameTimeManager._instance = this;

		this.tickRate = 100;
		this.timers = [];
	}

	tick() {
		console.log("Tick", Date.now());
	}
}

const gameTimeManager = new GameTimeManager();

export default gameTimeManager;
