
from MainApp.models import ChatMember, EntryNode, Message, ChatOptionNode, Character


class FrontendDataAdapter:

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

                

        return adapted_obj
    
    @staticmethod
    def adapt_chat(chat):
        adapted_chat = {
				'id': chat.id,
				'name': chat.name,
				'isGroup': ChatMember.objects.filter(chat=chat).count() > 1,
				'avatar': str(chat.avatar),
				'isChannel': chat.is_channel
			}

        return adapted_chat



    @staticmethod
    def adapt_node(node, node_selected_time=None):
        adapted_node = {
                'id': node.id,
                'chatId': node.chat.id,
                'type': node.type,
                'chatName': node.chat.name,
                'description': node.description,
                'isGameEntryNode': EntryNode.objects.filter(node=node).exists(),
                'choiceDelayMs': node.choice_delay_ms,
				'choiceLastsForMs': node.choice_lasts_for_ms,
                'defaultSelectdNode': node.default_selected_node,
                'nodeSelectedTime': node_selected_time
            }

        if node.type == "choice":
            adapted_node["userChoiceText"] = node.choice_text

        return adapted_node
    

    @staticmethod
    def adapt_message(message):
        adapted_message = {
            'id': message.id,
            'chatId': message.node.chat.id,
            'nodeId': message.node.id,
            'userId': message.user.id,
            'username': message.user.username,
            'fullName': message.user.full_name,
            'avatar': str(message.user.avatar),
            'displayColor': message.user.display_color,
            'text': message.text,
            'delayMs': str(message.delay_ms),
            'attachedImage': "",
            'wasRead': message.was_read,
            'typingDelayOverride': message.typing_delay_override_ms,
            'typingSpeed': message.user.typing_speed,
            'type': "message",
        }

        return adapted_message
    

    @staticmethod
    def get_total_delay(message):


        return 0
