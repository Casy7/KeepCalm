from ..models import Message, Chat, ChatMember, Character, ChatOptionNode, ChatNodeLink
import json


class ChatStructureAdapter:

	@staticmethod
	def update_node(chat, node, nodes_dict):

		if not 'dbId' in node['data']:

			node_obj = ChatOptionNode(chat=chat)
			node_obj.save()
			node['data']['dbId'] = node_obj.id

		else:

			node_obj = ChatOptionNode.objects.get(id=node['data']['dbId'])

		node_obj.pos_x = node['pos_x']
		node_obj.pos_y = node['pos_y']
		if 'desc' in node['data']:
			node_obj.description = node['data']['desc']
		node_obj.save()

		if 'root' in node['data'] and node['data']['root'] == 'true':

			chat.root_node = node_obj
			chat.save()

	@staticmethod
	def make_node_connections(chat, node, nodes_dict):

		node_obj = ChatOptionNode.objects.get(id=node['data']['dbId'])

		ChatNodeLink.objects.filter(child=node_obj).delete()

		node_inputs = node['inputs']['input_1']['connections']

		for node_input in node_inputs:
			parent_node = ChatOptionNode.objects.get(id=nodes_dict[str(node_input['node'])]['data']['dbId'])

			if not ChatNodeLink.objects.filter(parent=parent_node, child=node_obj).exists():
				ChatNodeLink(parent=parent_node, child=node_obj).save()

	@staticmethod
	def check_if_any_node_deleted(chat, nodes_dict={}):

		left_nodes = []
		for key in nodes_dict.keys():
			left_nodes.append(nodes_dict[key]['data']['dbId'])

		ChatOptionNode.objects.filter(chat=chat).exclude(id__in=left_nodes).delete()

	@staticmethod
	def from_json(json_data):

		
		tree_root = json_data["Home"]['data']

		for key in tree_root.keys():
			chat_id = tree_root[key]['data']['chatId']
			chat = Chat.objects.get(id=chat_id)
			ChatStructureAdapter.update_node(chat, tree_root[key], tree_root)

		for key in tree_root.keys():
			chat_id = tree_root[key]['data']['chatId']
			chat = Chat.objects.get(id=chat_id)
			ChatStructureAdapter.make_node_connections(chat, tree_root[key], tree_root)

		for chat in Chat.objects.all():
			ChatStructureAdapter.check_if_any_node_deleted(chat, tree_root)

		pass

	@staticmethod
	def to_json():

		json_data = {
			"drawflow": {
				"Home": {
					"data": {

					}
				}
			}
		}

		for node in ChatOptionNode.objects.all():

			inputs = ChatNodeLink.objects.filter(child=node)
			inputs_template = []
			for i in inputs:
				inputs_template.append({'node': i.parent.id, 'input': 'output_1'})

			outputs = ChatNodeLink.objects.filter(parent=node)
			outputs_template = []
			for i in outputs:
				outputs_template.append({'node': i.child.id, 'input': 'output_1'})


			root_node_label_template = ""
			chat_this_node_is_root_for = Chat.objects.filter(root_node=node)
			if len(chat_this_node_is_root_for):
				chat_rn = chat_this_node_is_root_for[0]
				root_node_label_template = f"<small class='root-node-label'>Root for C: {str(chat_rn.id)} — {chat_rn.name}</small>"

			chat_name_label_template = f"<p class='chatName'>N: {str(node.id)}  C: {str(node.chat.id)} — {node.chat.name}</p>"

			node_template = {
				'id': node.id,

				'name': 'chatNode',
				'data': {
					'desc': node.description,
					'dbId': node.id,
					'chatId': node.chat.id,
					'chatName': node.chat.name,
				},
				'class': 'chatNode',
				'html': root_node_label_template + chat_name_label_template + "<textarea class='form-input' df-desc name='description'></textarea>",
				'typenode': False,
				'inputs': {
						'input_1': {
							'connections': inputs_template
						}
				},
				'outputs': {
					'output_1': {
						'connections': []
					}
				},
				'pos_x': node.pos_x,
				'pos_y': node.pos_y
			}

			json_data['drawflow']['Home']['data'][str(node.id)] = node_template

		return json_data
