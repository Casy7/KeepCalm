

from MainApp.models import Message, ChatOptionNode, PlayerSelectedNode, ChatNodeLink
from .frontend_data_adapter import FrontendDataAdapter
from .timeline_event_adapter import TimelineEventAdapter

class DBHelper:

    @staticmethod
    def get_messages_in_node(node):
        messages = Message.objects.filter(node=node).order_by('delay_ms')
        messages_frontend_data = {}

        for message in messages:
            message_adapted = FrontendDataAdapter.adapt(message)

            messages_frontend_data[message.id] = message_adapted

        return messages_frontend_data
    

    @staticmethod
    def get_messages_for_each_node():
        messages_in_nodes = {}

        for node in ChatOptionNode.objects.all():
            messages_in_nodes[node.id] = DBHelper.get_messages_in_node(node)

        return messages_in_nodes
    

    @staticmethod
    def get_timeline_events(node, user_session = None):
        timeline_events = []

        for message in Message.objects.filter(node=node).order_by('delay_ms'):
            timeline_events.append(TimelineEventAdapter.adapt_message_event(message))

        if ChatNodeLink.objects.filter(parent=node).filter(child__type='choice').exists():
            timeline_events.append(TimelineEventAdapter.adapt_choice_event(node, user_session))

        timeline_events.sort(key=lambda x: int(x['delayMs']))

        return timeline_events
    

    @staticmethod
    def update_selected_nodes(user_session, new_node = None):

        new_nodes = []

        if new_node is not None:
            new_nodes.append(new_node)

        starting_nodes = ChatOptionNode.objects.filter(entry_points__isnull=False)

        for starting_node in starting_nodes:
            if not PlayerSelectedNode.objects.filter(player=user_session, node=starting_node).exists():
                new_nodes.append(starting_node)


        for new_node in new_nodes:
            new_nodes += DBHelper.rec_get_next_new_nodes(new_node, [])   

        for automatically_added_node in new_nodes:
            if not PlayerSelectedNode.objects.filter(player=user_session, node=automatically_added_node).exists():
                PlayerSelectedNode.objects.create(player=user_session, node=automatically_added_node)

        return new_nodes
        
        
    @staticmethod
    def rec_get_next_new_nodes(node, new_nodes=[]):

        connected_nodes = [option.child for option in ChatNodeLink.objects.filter(parent=node)] 
        
        for connected_node in connected_nodes:
            if connected_node.type == 'cross_chat_event' and connected_node not in new_nodes:
                new_nodes.append(connected_node)
                DBHelper.rec_get_next_new_nodes(connected_node, new_nodes)

        return new_nodes