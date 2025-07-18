
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
	let data = { "root": 'true', "desc": "Початок чату" };

	clearNodePropertiesInInspectorPanel();


	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


	if (chatStructureData == {}) {
		editor.addNode("t78", 0, 1, 200, 500, "chatNode", data, "<h3>Початок чату</h3><input type='hidden' df-name name='root' value='true'><input type='hidden' df-desk value=''>");
	}

	editor.import(chatStructureData);


	editor.on('nodeSelected', function (id) {
		selectedNode = id;
		loadMessagesToEditor(id.replace("node-", ""));
		loadNodePropertiesToInspectorPanel(id.replace("node-", ""));
		document.getElementById("nodeControlsInspectorPanel").style.display = "flex";
		document.getElementById("chatMessagesInspectorPanel").style.display = "flex";
	});

	editor.on('nodeUnselected', function () {
		selectedNode = null;
		clearNodePropertiesInInspectorPanel();
		document.getElementById("nodeControlsInspectorPanel").style.display = "none";
		document.getElementById("chatMessagesInspectorPanel").style.display = "none";
	});

	editor.on('nodeRemoved', function (id) {
		console.log("Node removed: " + id);
	})
});



document.getElementById("saveBtn").addEventListener("click", () => {
	pushNodeEditorStructure();
});

document.getElementById("activateAddChoiceNodeMenuBtn").addEventListener("click", () => {
	activateAddChoiceNodeMenu();
});

document.getElementById("activateAddScriptNodeMenuBtn").addEventListener("click", () => {
	activateAddScriptNodeMenu();
});

document.getElementById("activateAddCrossChatNodeMenuBtn").addEventListener("click", () => {
	activateAddCrossChatNodeMenu();
});

document.getElementById("addNewChoiceNodeBtn").addEventListener("click", () => {
	addChoiceNode();
});

document.getElementById("addNewCrossNodeBtn").addEventListener("click", () => {
	addCrossNode();
});


// document.getElementById("add-output").addEventListener("click", () => {

// const selectedId = selectedNode;

// if (!selectedId) {
// 	console.warn("No node selected.");
// 	return;
// }

// editor.addNodeOutput(selectedId);
// editor.updateConnectionNodes(`node-${selectedId}`);
// });

// document.getElementById("remove-output").addEventListener("click", () => {
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
// });

document.getElementById("sendNewMessageBtn").addEventListener("click", () => {
	sendNodeMessage();
});

document.getElementById("chatNodeId").addEventListener("click", () => {
	deleteNodeMessage(this);
});

document.querySelectorAll(".control-panel-header").forEach(controlPanelHeader => controlPanelHeader.addEventListener("click", (event) => {
	toggleControlPanelVisibility(event.target);
}))

document.getElementById("saveNodePropertiesBtn").addEventListener("click", () => {
	sendNodeProperties();
})


function toggleControlPanelVisibility(controlPanel) {
	console.log(controlPanel);
	let controlPanelContent = controlPanel.parentNode.parentNode.querySelector(".control-panel-content");
	if (controlPanelContent.style.display == "none") {
		controlPanelContent.style.display = "block";
	} else {
		controlPanelContent.style.display = "none";
	}
}


function activateAddChoiceNodeMenu() {
	clearNewChoiceNodeInspectorPanel();
	document.getElementById("newChoiceNodeInspectorPanel").style.display = "flex";
}

function activateAddCrossChatNodeMenu() {
	clearNewCrossChatEventNodeInspectorPanel();
	document.getElementById("newCrossNodeInspectorPanel").style.display = "flex";
}

function activateAddScriptNodeMenu() {

}


function loadNodePropertiesToInspectorPanel(id) {
	const node = nodeProperties[id];
	document.getElementById("nodeUserChoiceText").value = node.userChoiceText;
	document.getElementById("nodeDescription").value = node.description;
	document.getElementById("isNodeAutomaticallyStarted").checked = node.isGameEntryNode;
	document.getElementById("nodeChatSelector").value = node.chatId;
	document.getElementById("inspectorCurrentChatName").innerText = "Chat: " + node.chatName;
	document.getElementById("inspectorChatHeader").innerText = node.chatName;
}

function clearNodePropertiesInInspectorPanel() {
	document.getElementById("nodeUserChoiceText").value = "";
	document.getElementById("nodeDescription").value = "";
	document.getElementById("isNodeAutomaticallyStarted").checked = false;
	document.getElementById("inspectorCurrentChatName").innerText = "  ";
	document.getElementById("inspectorChatHeader").innerText = "No node selected";

	clearMessagesContainer();
}


function clearNewChoiceNodeInspectorPanel() {
	document.getElementById("newChoiceNodeChatSelector").value = "-1";
	document.getElementById("newChoiceNodeUserChoiceText").value = "";
	document.getElementById("newChoiceNodeDescription").value = "";
	document.getElementById("newChoiceNodeIsNodeAutomaticallyStarted").checked = false;
}


function clearNewCrossChatEventNodeInspectorPanel() {
	document.getElementById("newCrossNodeChatSelector").value = "-1";
	document.getElementById("newCrossNodeDescription").value = "";
	document.getElementById("newCrossNodeIsNodeAutomaticallyStarted").checked = false;
}


function getEditorCenter() {
	// let editorTransform = document.querySelector(".drawflow").style.transform;
	// const match = editorTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);

	// if (match) {
	// 	const x = parseFloat(match[1]);
	// 	const y = parseFloat(match[2]);
	// 	return [x, y];
	// } else {
	// 	return [0.0, 0.0];
	// }

	let x = -1 * document.querySelector(".drawflow").getBoundingClientRect().x + 500;
	let y = -1 * document.querySelector(".drawflow").getBoundingClientRect().y + 500
	return { x: x, y: y };

}


function addChoiceNode() {
	const newNodeData = {};

	newNodeData.nodeType = "choice";
	newNodeData.nodeDescription = document.getElementById("newChoiceNodeDescription").value;
	newNodeData.nodeUserChoiceText = document.getElementById("newChoiceNodeUserChoiceText").value;
	newNodeData.chatId = document.getElementById("newChoiceNodeChatSelector").value;
	newNodeData.isGameEntryNode = document.getElementById("newChoiceNodeIsNodeAutomaticallyStarted").checked;
	newNodeData.posX = getEditorCenter().x;
	newNodeData.posY = getEditorCenter().y;

	sendNewNode(newNodeData);
}



function addCrossNode() {
	const newNodeData = {};

	newNodeData.nodeType = "cross_chat_event";
	newNodeData.nodeDescription = document.getElementById("newCrossNodeDescription").value;
	newNodeData.chatId = document.getElementById("newCrossNodeChatSelector").value;
	newNodeData.isGameEntryNode = document.getElementById("newCrossNodeIsNodeAutomaticallyStarted").checked;
	newNodeData.posX = getEditorCenter().x;
	newNodeData.posY = getEditorCenter().y;

	sendNewNode(newNodeData);
}


// function addChoiceNodeBtn() {
// 	let coords = [document.querySelector(".drawflow").getBoundingClientRect().x, document.querySelector(".drawflow").getBoundingClientRect().y];
// 	console.log(coords);
// 	const data = { "desc": "" };
// 	editor.addNode("choice", 1, 1, -1 * coords[0] + 500, -1 * coords[1] + 500, "choiceNode", {}, defaultNodeContent);
// 	pushNodeEditorStructure();
// }


function addCrossChatNode() {
	let coords = [document.querySelector(".drawflow").getBoundingClientRect().x, document.querySelector(".drawflow").getBoundingClientRect().y];
	console.log(coords);
	const data = { "desc": "" };
	editor.addNode("crossChat", 1, 1, -1 * coords[0] + 500, -1 * coords[1] + 500, "crossChatNode", {}, "");
	pushNodeEditorStructure();
}

function clearMessagesContainer() {
	const container = document.getElementById("chatNodeId");
	removeChildrens(container);
}


function loadMessagesToEditor(nodeId) {
	clearMessagesContainer();
	const container = document.getElementById("chatNodeId");

	const messagesList = Object.values(messagesInNodes[parseInt(nodeId)]);
	const messages = sortByTimestamp(messagesList);

	for (let i = 0; i < messages.length; i++) {
		const message = messages[i];

		const template = `
			<div class="message-wrapper incoming">
				<img class="message-avatar" src="/static/images/users/code.jpg" alt="avatar">
				<div class="messages-block">
					<div class="message user-2">
						<div class="message-username">${message.full_name}</div>
						<div class="message-content-line" id="message-${message.id}">
							<p class="message-text">${message.text}</p>
							<label class="message-timestamp">${message.time_sent}</label>
							<a class="message-timestamp message-delete-btn" data-value="${message.id}">Del.</a>
						</div>
					</div>
				</div>
			</div>
		`;

		container.insertAdjacentHTML("beforeend", template);
	}
}


async function pushNodeEditorStructure() {

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


async function refreshNodeEditor() {
	const rq = new Request({ url: `/get_editor_node_structure/`, data: {}, method: "GET" });
	await rq.send();

	if (rq.result === "success") {
		const nodeStructure = rq.recievedData.nodeStructure;
		editor.import(nodeStructure);
	}
	else if (rq.result === "error") {
		console.log(rq.result);
		if (rq.recievedData && rq.recievedData.errorMessage) {
			warnUser("Error", rq.recievedData.errorMessage);
		}
		else {
			warnUser("Error", "Unknown error.");
		}
	}

	return rq.result;
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


async function sendNodeProperties() {

	const nodeId = selectedNode.replace("node-", "");
	const nodeDescription = document.getElementById("nodeDescription").value;
	const nodeUserChoiceText = document.getElementById("nodeUserChoiceText").value;
	const nodeChatId = document.getElementById("nodeChatSelector").value;
	const isNodeAutomaticallyStarted = document.getElementById("isNodeAutomaticallyStarted").checked;

	const rqData = {
		'nodeId': nodeId,
		'nodeDescription': nodeDescription,
		'nodeUserChoiceText': nodeUserChoiceText,
		'chatId': nodeChatId,
		'isEntryPoint': isNodeAutomaticallyStarted
	}

	const rq = new Request({ url: "/update_node_properties/", data: rqData });
	await rq.send();

	if (rq.result === "success") {

		warnUser("Saved!", "");

	} else {

		warnUser("Error!", "Cannot save properties.");

	}
}


async function sendNewNode(nodeData) {

	const rq = new Request({ url: "/create_node/", data: nodeData });
	await rq.send();
	if (rq.result === "success") {

		let response = await refreshNodeEditor();
		messagesInNodes[rq.recievedData.nodeId] = {};
		nodeProperties[rq.recievedData.nodeId] = {
			"userChoiceText": nodeData.nodeUserChoiceText,
			"description": nodeData.nodeDescription,
			"isGameEntryNode": nodeData.isEntryPoint,
			"chatId": nodeData.chatId,
			"chatName": chats[nodeData.chatId].name,
			"nodeType": nodeData.type,
		};
		console.log(response);

	} else if (rq.result === "error") {
		if (rq.recievedData.errorMessage) {
			warnUser("Error", rq.recievedData.errorMessage, "red");
		}
		else {
			warnUser("Error", "Unknown error.");
		}
	}
} 