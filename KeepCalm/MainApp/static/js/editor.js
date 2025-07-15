
import { copyTextToClipboard, warnUser, Request, removeChildrens } from './base.js';
import Split from '../modules/split.js/split.es.js';


function sortByTimestamp(arr) {
	arr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
	return arr;
}


window.addEventListener("load", () => {

	Split(['#editorContainer', '#inspectorPanel'], {
		minSize: 200,
		sizes: [75, 25]
	})

	let editorId = document.getElementById("drawflow");

	editor = new Drawflow(editorId);
	editor.editor_mode = 'edit';
	editor.zoom_max = 3.6;
	editor.zoom_min = 0.5;
	editor.zoom_value = 0.1;

	editor.start();

	editor.addModule('nameNewModule');
	var data = { "root": 'true', "desc": "Початок чату" };


	if (chatStructureData == {}) {
		editor.addNode("t78", 0, 1, 200, 500, "chatNode", data, "<h3>Початок чату</h3><input type='hidden' df-name name='root' value='true'><input type='hidden' df-desk value=''>");
	}

	editor.import(chatStructureData);


	editor.on('nodeSelected', function (id) {
		selectedNode = id;
		loadMessagesToEditor(id.replace("node-", ""));
	});

	editor.on('nodeUnselected', function () {
		selectedNode = null;
	});

	editor.on('nodeRemoved', function (id) {
		console.log("Node removed: " + id);
	})
});




document.getElementById("save-btn").addEventListener("click", () => {
	sendChatStructure();
});

document.getElementById("add-node-btn").addEventListener("click", () => {
	addNode();
});

document.getElementById("add-output").addEventListener("click", () => {

	// const selectedId = selectedNode;

	// if (!selectedId) {
	// 	console.warn("No node selected.");
	// 	return;
	// }

	// editor.addNodeOutput(selectedId);
	// editor.updateConnectionNodes(`node-${selectedId}`);
});

document.getElementById("remove-output").addEventListener("click", () => {
	// const selectedId = selectedNode;

	// if (!selectedId) {
	// 	console.warn("No node selected.");
	// 	return;
	// }

	// const node = editor.getNodeFromId(selectedId);
	// const outputCount = Object.keys(node.outputs).length;

	// if (outputCount === 0) {
	// 	console.warn("No nodes to remove.");
	// 	return;
	// }

	// let outputs = Object.keys(node.outputs);

	// const output_class = outputs[outputs.length - 1];

	// editor.removeNodeOutput(selectedId, output_class)
	// editor.updateConnectionNodes(`node-${selectedId}`);
});

document.getElementById("sendNewMessageBtn").addEventListener("click", () => {
	sendNodeMessage();
});

document.getElementById("chatNodeId").addEventListener("click", () =>{
	deleteNodeMessage(this);
});

function getEditorCenter() {
	let editorTransform = document.querySelector(".drawflow").style.transform;
	const match = editorTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);

	if (match) {
		const x = parseFloat(match[1]);
		const y = parseFloat(match[2]);
		return [x, y];
	} else {
		return [0.0, 0.0];
	}
}

function addNode() {
	let coords = [document.querySelector(".drawflow").getBoundingClientRect().x, document.querySelector(".drawflow").getBoundingClientRect().y];
	console.log(coords);
	const data = { "desc": "" };
	editor.addNode("choice", 1, 1, -1 * coords[0] + 500, -1 * coords[1] + 500, "choiceNode", {}, defaultNodeContent);
	sendChatStructure();
}


function loadMessagesToEditor(nodeId) {
	removeChildrens(document.getElementById("chatNodeId"));
	let messages_list = Object.values(messagesInNodes[parseInt(nodeId)]);
	let messages = sortByTimestamp(messages_list);
	for (let i = 0; i < messages.length; i++) {
		let message = messages[parseInt(i)];
		$("#chatNodeId").append(`
		<div class="message-wrapper incoming">
			<img class="message-avatar" src="{% static 'images/users/code.jpg' %}" alt="avatar">
			<div class="messages-block">
				<div class="message user-2">
					<div class="message-username">`+ message.full_name + `</div>
					<div class="message-content-line" id="message-`+ message.id + `">
						<p class="message-text">`+ message.text + `</p>
						<label class="message-timestamp">`+ message.time_sent + `</label>
						<a class="message-timestamp message-delete-btn" data-value="`+ message.id + `">Del.</a>
					</div>
				</div>
			</div>
		</div>
			`
		);
	}
}


async function sendChatStructure() {

	let chatStructureStr = JSON.stringify(editor.export()["drawflow"]);

	let rqData = {
		'chatStructure': chatStructureStr
	}

	const rq = new Request({ url: `/send_chat_structure/`, data: rqData });
	await rq.send();

	if (rq.result === "success") {
		const updatedStructure = rq.recievedData.updatedStructure;
		editor.import(updatedStructure);
		messagesInNodes = rq.recievedData.messagesInNodes;
		warnUser("Saved!", "");

	} else {

		console.log(rq.result);

	}
}


async function sendNodeMessage() {

	let messageId = 0;
	let nodeId = selectedNode.replace("node-", "");
	let messageText = document.getElementById("messageText").value;
	let senderCharacter = document.getElementById("senderCharacter").value;
	let dateWasWritten = document.getElementById("dateWasWritten").value;
	let timeWasWritten = document.getElementById("timeWasWritten").value;
	let timeSWasWritten = document.getElementById("timeSWasWritten").value;
	let timeMsWasWritten = document.getElementById("timeMsWasWritten").value;

	let rqData = {
		'messageId': messageId,
		'nodeId': nodeId,
		'messageText': messageText,
		'senderCharacter': senderCharacter,
		'dateWasWritten': dateWasWritten,
		'timeWasWritten': timeWasWritten,
		'timeSWasWritten': timeSWasWritten,
		'timeMsWasWritten': timeMsWasWritten
	}

	const rq = new Request({ url: "/send_node_message/", data: rqData });
	await rq.send();

	if (rq.result === "success") {
		let newMessageId = rq.messageId;
		messagesInNodes[parseInt(nodeId)][parseInt(newMessageId)] = {
			"id": newMessageId,
			"text": messageText,
			"time_was_written": timeWasWritten,
			"time_sent": timeWasWritten + ":" + timeSWasWritten + ":" + timeMsWasWritten,
			"timestamp": dateWasWritten + " " + timeWasWritten + ":" + timeSWasWritten + "." + timeMsWasWritten + "+00:00",
			"was_read": false,
			"attached_image": "",
			"username": senderCharacter,
			"full_name": charactersInfo[senderCharacter]
		};
		console.log("success");
		loadMessagesToEditor(nodeId);
	} else {
		console.warn("Не вдалось відправити повідомлення.");
	}

}

async function deleteNodeMessage(target) {

	console.log(target);
	const messageId = target.getAttribute("data-value");

	let rqData = {
		'messageId': messageId
	}
	const rq = new Request({ url: "/delete_node_message/", data: rqData });
	await rq.send();

	if (rq.result === "success") {

		const deletedMessageId = rq.deletedMessageId;
		const messagesBlock = target.closest('.message-wrapper');

		target.parentNode.remove();
		if (!messagesBlock) {
			return;
		}

		const remaining = messagesBlock.querySelectorAll('.message-content-line');
		if (remaining.length === 0) {
			messagesBlock.remove();
		}

		nodeId = selectedNode.replace("node-", "");
		delete messagesInNodes[parseInt(nodeId)][parseInt(deletedMessageId)];
		console.log("success");
		loadMessagesToEditor(nodeId);

	} else {

		console.warn("Не вдалось видалити повідомлення.");

	}

}



