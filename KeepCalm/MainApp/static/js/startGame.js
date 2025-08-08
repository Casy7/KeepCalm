import LocalStorageManager from "./localStorageManager.js";
import { copyTextToClipboard, warnUser, Request } from "./base.js";
import { AudioManager } from "./AudioManager.js";
import SoundController from "./SoundController.js";

document.getElementById("copyCodeButton").addEventListener("click", () => {
	copyCode();
	audioManager.play("click", "sfx", 30);
});

document.getElementById("startGameButton").addEventListener("click", () => {
	startGame();
	audioManager.play("click", "sfx", 30);
});

document.getElementById("previousGameSessionCodeInput").addEventListener("input", () => {
	validateCode();
});

function copyCode() {
	let userSessionCode = document.getElementById("startGameCode").innerText;
	copyTextToClipboard(userSessionCode);
	warnUser("Copied!", "", "gray");
}

function validateCode() {
	const codeInputField = document.getElementById("previousGameSessionCodeInput");
	let userSessionCode = codeInputField.value;

	if (userSessionCode == "#") {
		codeInputField.value = "";
		return;
	}

	const cleaned = userSessionCode.toUpperCase().replace(/[^A-Z0-9]/g, "");

	if (userSessionCode == "") {
		codeInputField.value = "";
		return;
	}

	codeInputField.value = "#" + cleaned;
}

async function startGame() {
	let userPreviousSessionCode = document.getElementById("previousGameSessionCodeInput").value;

	if (userPreviousSessionCode != "") {
		const rq = new Request({ url: "/check_if_session_exists/", data: { userSessionCode: userPreviousSessionCode } });
		await rq.send();

		if (rq.result === "success") {
			if (rq.recievedData.userSessionCodeExists) {
				loadGame(userPreviousSessionCode.replace(/#/g, ""));
			} else {
				warnUser("Цієї ігрової сесії не знайдено", "", "gray");
			}
		} else {
			console.warn("Щось тут не фуричить.");
		}
	} else {
		loadGame(document.getElementById("startGameCode").innerText.replace(/#/g, ""));
	}
}

function loadGame(code) {
	LocalStorageManager.set("userSessionCode", code);
	window.location.href = `/game/${code}/`;
}

function startLogoGlitch() {
	const glitchIds = ["logo_glitch_1", "logo_glitch_2", "logo_glitch_3", "logo_glitch_4", "logo_glitch_5", "logo_glitch_6"];
	const logoMen = document.getElementById("logo_men");

	if (!logoMen) {
		console.error("logo_men not found!");
		return;
	}

	function glitchCycle() {
		logoMen.style.opacity = "0.269";

		let indices = [...glitchIds.keys()];
		let i1 = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
		let i2 = indices[Math.floor(Math.random() * indices.length)];

		let glitch1 = document.getElementById(glitchIds[i1]);
		let glitch2 = document.getElementById(glitchIds[i2]);

		if (!glitch1 || !glitch2) {
			console.error("One of the glitch layers not found!");
			return;
		}

		glitch1.style.display = "inline";
		audioManager.play("glitch", "sfx", 30);

		setTimeout(() => {
			glitch1.style.display = "none";
			glitch2.style.display = "inline";

			setTimeout(() => {
				glitch2.style.display = "none";
				logoMen.style.opacity = "1";

				let delay = 3000 + Math.random() * 7000;
				setTimeout(glitchCycle, delay);
			}, 100);
		}, 100);
	}

	glitchCycle();
}


async function startMusic() {
	audioManager.createChannel("sfx");
	audioManager.createChannel("music");
	soundController = new SoundController();

	await audioManager.buffer("click", "/static/audio/button_click_modern.mp3");
	await audioManager.buffer("glitch", "/static/audio/glitch_tv.mp3");
	await audioManager.buffer("music", "/static/audio/nervous_music.mp3");

	audioManager.play("music", "music", 30, true);
}


document.addEventListener("DOMContentLoaded", () => {

	audioManager = new AudioManager();

	startLogoGlitch();
	startMusic();
});