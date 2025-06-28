import gameTimeManager from './gameTimeManager.js';
import LocalStorageManager from './localStorageManager.js';

document.addEventListener("DOMContentLoaded", () => {

	gameTimeManager.tick();
	console.log("We're DOMed!");
	console.log(LocalStorageManager.get("code"));
});


function loadChat() {
	
}