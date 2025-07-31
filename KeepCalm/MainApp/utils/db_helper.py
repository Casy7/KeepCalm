

from MainApp.models import Message, ChatOptionNode
from .frontend_data_adapter import FrontendDataAdapter

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