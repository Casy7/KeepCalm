
from MainApp.models import Message, ChatOptionNode, Character


class FrontendDataAdapter:

	@staticmethod
	def get_messages_by_node(node):
		messages = Message.objects.filter(node=node).order_by('timestamp')
		messages_frontend_data = {}

		for message in messages:
			message_adapted = FrontendDataAdapter.adapt(message)

			messages_frontend_data[message.id] = message_adapted

		return messages_frontend_data


	@staticmethod
	def get_messages_by_each_node():
		messages_in_nodes = {}

		for node in ChatOptionNode.objects.all():
			messages_in_nodes[node.id] = FrontendDataAdapter.get_messages_by_node(node)

		return messages_in_nodes


	@staticmethod
	def adapt(obj):
		adapted_obj = None
		if isinstance(obj, Character):
	  
			character = obj
			adapted_obj = {
				'id': character.id,
				'username': character.username,
				'fullName': character.full_name,
				'shortName': character.short_name,
				'displayColor': character.display_color,
				'typingSpeed': character.typing_speed,
				'avatar': str(character.avatar)
			}
		
		elif isinstance(obj, Message):
			
			message = obj
			adapted_obj = {
					'type': "message",
					'id': message.id,
					'chatId': message.node.chat.id,
					'nodeId': message.node.id,
					'userId': message.user.id,
					'username': message.user.username,
					'fullName': message.user.full_name,
					'avatar': str(message.user.avatar),
					'displayColor': message.user.display_color,
					'text': message.text,
					'timestamp': str(message.timestamp),
					'timeSent': message.timestamp.strftime("%H:%M:%S") + f".{int(message.timestamp.microsecond / 10000):02d}",
					'timeWasWritten': "",
					'attachedImage': "",
					'wasRead': message.was_read,
					'typingDelayOverride': message.typing_delay_override_ms,
					'typingSpeed': message.user.typing_speed
				}
   
		return adapted_obj
