from MainApp.utils.frontend_data_adapter import FrontendDataAdapter
from MainApp.models import Message, ChatOptionNode, ChatNodeLink, PlayerSelectedNode

from datetime import datetime

class TimelineEventAdapter:
	@staticmethod
	def adapt_message_event(message, user_session, start_date):

		message_adapted = FrontendDataAdapter.adapt_message(message)
		message_adapted["delayMs"] = TimelineEventAdapter.get_message_total_delay(message, user_session, start_date)

		return message_adapted

		

	@staticmethod
	def adapt_choice_event(parent_node, user_session = None):

		option_choices = [option.child for option in ChatNodeLink.objects.filter(parent=parent_node).all() if option.child.type == 'choice']

		choice_event_data = {}
		choice_event_data['options'] = []

		choice_event_data['chatId'] = parent_node.chat.id
		choice_event_data['nodeId'] = parent_node.id
		choice_event_data['alreadySelected'] = False
		choice_event_data['type'] = 'choice'
		choice_event_data['delayMs'] = parent_node.choice_delay_ms
		choice_event_data['duration'] = parent_node.choice_lasts_for_ms

		
		for option in option_choices:
			if user_session is not None and PlayerSelectedNode.objects.filter(player=user_session, node=option).exists():
				choice_event_data['alreadySelected'] = True
			option_data = {}
			option_data['id'] = option.id
			option_data['text'] = option.choice_text
			option_data['defaultSelectedNode'] = option.default_selected_node
			choice_event_data['options'].append(option_data)

		return choice_event_data
	

	@staticmethod
	def get_message_total_delay(message, user_session, start_date_str):
		
		total_delay = 0
		total_delay += message.delay_ms

		start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))

		sending_timedelta = PlayerSelectedNode.objects.filter(player=user_session, node=message.node).first().time_selected - start_date

		total_delay += int(sending_timedelta.total_seconds()*1000)

		return total_delay