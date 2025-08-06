import { removeChildrens } from "./base.js";
import TimeObserver from "./TimeObserver.js";
import { selectOption, removeTimeLineEventOptionsFromSelector } from "./EventRenderer.js";


export default class ChoiceTimerManager extends TimeObserver {
	constructor() {
		super();
		this.choiceTimers = new Map();
		if (ChoiceTimerManager._instance) {
			return ChoiceTimerManager._instance;
		}
		ChoiceTimerManager._instance = this;
		this.alreadyAddedAsObserver = false;
	}

	createTimer(timeLineEvent) {

		if (!this.choiceTimers.has(timeLineEvent.chatId)) {
			const choiceTimer = new ChoiceTimer(timeLineEvent);

			this.choiceTimers.set(timeLineEvent.chatId, choiceTimer);

			if (!this.alreadyAddedAsObserver) {
				gameTimeManager.addObserver(this);
				this.alreadyAddedAsObserver = true;
			}
		}
	}

	removeTimer(chatId) {

		if (this.choiceTimers.get(chatId)) {
			this.choiceTimers.get(chatId).removeTimer();
			this.choiceTimers.delete(chatId);
		}

		if (this.choiceTimers.size == 0 && this.alreadyAddedAsObserver) {
			gameTimeManager.removeObserver(this);
			this.alreadyAddedAsObserver = false;
		}
	}

	timeUpdated() {
		this.choiceTimers.forEach(timer => {
			let timerFinished = timer.updateTimer();
			if (timerFinished) {
				this.removeTimer(timer.chatId);
			}
		});
	}

}


export class ChoiceTimer {
	constructor(timeLineEvent) {
		this.timeLineEvent = timeLineEvent;
		this.chatId = timeLineEvent.chatId;
		this.nodeId = timeLineEvent.nodeId;
		this.duration = timeLineEvent.duration;
		this.timerObj = undefined;
		this.persent = 100;
		this.delayAtStart = 0;

		this.createTimer();

	}

	createTimer() {
		let timerContainer = undefined;
		if (activeChatId == this.chatId) {
			timerContainer = document.getElementById(`chat${this.chatId}TimerContainer`);
		}
		timerContainer = document.getElementById(`chat${this.chatId}TimerContainer`);


		removeChildrens(timerContainer);
		let timerTemplate = `
			<div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
        		<div class="progress-bar" style="width: 25%"></div>
      		</div>`;
		timerContainer.insertAdjacentHTML("beforeend", timerTemplate);

		this.timerObj = document.querySelector(`#chat${this.chatId}TimerContainer .progress-bar`);
		this.delayAtStart = gameTimeManager.inGameTimeMs;
		this.updateTimer();
	}

	updateTimer() {
		if (this.timerObj == undefined) {
			return true;
		}

		let startTime = this.delayAtStart;
		let finishTime = this.delayAtStart + this.duration;
		let currentTime = gameTimeManager.inGameTimeMs;
		this.persent = 100 - ((currentTime - startTime) / (finishTime - startTime)) * 100;

		this.timerObj.style.width = this.persent + "%";
		if (this.persent < 0) {
			this.sendDefaultChoice();
			return true;
		}
		return false;
	}

	removeTimer() {
		removeChildrens(document.getElementById(`chat${this.chatId}TimerContainer`));
	}


	sendDefaultChoice() {

		let defaultChoice = this.timeLineEvent.options.find(choice => choice.defaultSelectedNode);
		if (defaultChoice != undefined) {
			selectOption(defaultChoice.id);
		}
		else {
			selectOption(this.timeLineEvent.options[0].id);
		}
	}


}