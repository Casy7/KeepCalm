
document.addEventListener("DOMContentLoaded", startLogoGlitch);

document.getElementById("copyCodeButton").addEventListener("click", () => {
	copyCode();
});

document.getElementById("startGameCodeInput").addEventListener("input", () => {
	validateCode();
});

function copyCode() {
	let userSessionCode = document.getElementById("startGameCode").innerText;
	copyTextToClipboard(userSessionCode);
	warnUser("Copied!", "", "gray");
}


function validateCode() {

	let userSessionCode = document.getElementById("startGameCodeInput").value;

	if (userSessionCode == "#") {
		document.getElementById("startGameCodeInput").value = "";
		return;
	}

	const cleaned = userSessionCode.toUpperCase().replace(/[^A-Z0-9]/g, '');

	if (userSessionCode == "") {
		document.getElementById("startGameCodeInput").value = "";
		return;
	}


	document.getElementById("startGameCodeInput").value = "#" + cleaned;
}


function startLogoGlitch() {
	const glitchIds = [
		"logo_glitch_1",
		"logo_glitch_2",
		"logo_glitch_3",
		"logo_glitch_4",
		"logo_glitch_5",
		"logo_glitch_6"
	];
	const logoMen = document.getElementById("logo_men");

	if (!logoMen) {
		console.error("logo_men not found!");
		return;
	}

	function glitchCycle() {
		// Сделать logo_men полупрозрачным
		logoMen.style.opacity = "0.269";

		// Выбираем 2 разных случайных глитча
		let indices = [...glitchIds.keys()];
		let i1 = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
		let i2 = indices[Math.floor(Math.random() * indices.length)];

		let glitch1 = document.getElementById(glitchIds[i1]);
		let glitch2 = document.getElementById(glitchIds[i2]);

		if (!glitch1 || !glitch2) {
			console.error("One of the glitch layers not found!");
			return;
		}

		// Показать первый глитч
		glitch1.style.display = "inline";

		setTimeout(() => {
			// Скрыть первый, показать второй
			glitch1.style.display = "none";
			glitch2.style.display = "inline";

			setTimeout(() => {
				// Скрыть второй, вернуть нормальный логотип
				glitch2.style.display = "none";
				logoMen.style.opacity = "1";

				// Подождать от 3 до 10 секунд
				let delay = 3000 + Math.random() * 7000;
				setTimeout(glitchCycle, delay);
			}, 100);
		}, 100);
	}

	glitchCycle();
}
