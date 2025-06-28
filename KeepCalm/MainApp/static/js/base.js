



function attachCSRFToken(xhr) {
	xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
}

export function getCSRFToken() {
	return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}

export function exists(querySelectorRule) {
	var element = document.querySelector(querySelectorRule);
	return element != null;
}

function byId(id) {
	return document.getElementById(id);
}

function removeChildrens(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}



function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		// console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}


export function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(function () {
		// console.log('Async: Copying to clipboard was successful!');
	}, function (err) {
		console.error('Async: Could not copy text: ', err);
	});
}


export function warnUser(title, desc, color="orange", timeout=4000) {
    const container = document.getElementById('warningContainer');

    const toast = $(`
		<div class="warn-toast" style="background-color: `+color+`;">
			<div class="warn-title">
				`+title+`
			</div>
			<div class="warn-desc">
				`+desc+`
			</div>
		</div>
		`);

    $(container).append(toast);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.addClass('fadeout');
        setTimeout(() => container.removeChild(toast[0]), 500); // wait for fadeout
    }, timeout);
}


export class Request {
	constructor({ url, data = {}, method = "POST" }) {
		this.url = url;
		this.data = data;
		this.method = method;
		this.result = null;
		this.recievedData = null;
	}

	async send() {
		try {
			const response = await fetch(this.url, {
				method: this.method,
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": getCSRFToken(),
				},
				body: JSON.stringify(this.data),
			});

			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const json = await response.json();

			this.result = json.result;
			this.recievedData = json;
		} catch (error) {
			console.error("Request error:", error);
			this.result = "error";
			this.recievedData = null;
		}
	}
}

