import json
from datetime import datetime, timedelta


from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth import authenticate, login, logout
from django.views.generic import View


from MainApp.models import User, Chat, ChatOptionNode, ChatMember, Character, Message, PlayerSession, PlayerSelectedNode, EntryNode
from .utils import chat_structure_parser as csp
from .utils.session_manager import SessionManager
from .utils.db_helper import DBHelper as db
from .utils.frontend_data_adapter import FrontendDataAdapter


START_DATE = "2021-12-10T08:00:00+00:00"

def extend_unique(lst, new_items):
    for item in new_items:
        if item not in lst:
            lst.append(item)

class StartGamePage(View):
	def get(self, request):
		context = SessionManager.base_context(request, title='Розпочати', page_name='start_game')
		context["code"] = SessionManager.generate_session_code()

		return render(request, "start-game.html", context)


class MainChatPage(View):
	def get(self, request, session_code):
		context = SessionManager.base_context(request, title='KeepCalm', page_name='game_page')

		# Session key
		player_session = None
		if not PlayerSession.objects.filter(user_session_code=session_code).exists():
			player_session = PlayerSession.objects.create(user_session_code=session_code)

			for entry_node in ChatOptionNode.objects.filter(entry_points__isnull=False):
				PlayerSelectedNode.objects.create(player=player_session, node=entry_node)
		else:
			player_session = PlayerSession.objects.get(user_session_code=session_code)

		player_selected_nodes = [selected_node.node for selected_node in PlayerSelectedNode.objects.filter(player=player_session)]
		extend_unique(player_selected_nodes, db.update_selected_nodes(player_session, None, START_DATE))
		
		context["player_session"] = player_session
		context["sessionCode"] = session_code

		# Characters
		characters = []
		for character in Character.objects.all():
			characters.append(FrontendDataAdapter.adapt(character))

		context["characters"] = json.dumps(characters, cls=DjangoJSONEncoder)

		# Events
		timeline_events = []
		for node in player_selected_nodes:

			timeline_events += db.get_timeline_events(node, player_session, START_DATE)

		context["timelineEvents"] = json.dumps(timeline_events, cls=DjangoJSONEncoder)

		# Chats info
		chats = Chat.objects.all()
		context["chats"] = chats

		chats_json = []
		for chat in Chat.objects.all():
			chats_json.append(FrontendDataAdapter.adapt_chat(chat))

		context["chatsJSON"] = json.dumps(chats_json, cls=DjangoJSONEncoder)
		context["startGameDatetime"] = START_DATE

		# Nodes info
		node_properties = {}
		for node in ChatOptionNode.objects.all():
			node_properties[node.id] = FrontendDataAdapter.adapt_node(node)

		context['nodes'] = json.dumps(node_properties, cls=DjangoJSONEncoder)


		return render(request, "chat.html", context)


class ChatEditorPage(View):
	def get(self, request):
		context = SessionManager.base_context(request, title='Edit', page_name='editor')

		context['chat_structure'] = json.dumps(csp.ChatStructureAdapter.to_json(), cls=DjangoJSONEncoder)

		messages_in_nodes = db.get_messages_for_each_node()
		context['messages_in_node'] = json.dumps(messages_in_nodes, cls=DjangoJSONEncoder)

		characters = [(character.username, character.full_name) for character in Character.objects.all()]
		context['characters'] = characters

		context['characters_JSON'] = {}
		for character in characters:
			context['characters_JSON'][character[0]] = character[1]

		chats = Chat.objects.all()
		context["chats"] = chats

		node_properties = {}
		for node in ChatOptionNode.objects.all():
			node_properties[node.id] = FrontendDataAdapter.adapt_node(node)

		chats_json = {}

		for chat in Chat.objects.all():
			chats_json[chat.id] = {
				'id': chat.id,
				'name': chat.name,
				'isGroup': ChatMember.objects.filter(chat=chat).count() > 1,
				'avatar': str(chat.avatar),
				'isChannel': chat.is_channel
			}

		context["chats_JSON"] = json.dumps(chats_json, cls=DjangoJSONEncoder)

		context['node_properties'] = json.dumps(node_properties, cls=DjangoJSONEncoder)

		context['characters_JSON'] = json.dumps(context['characters_JSON'])

		return render(request, "editor.html", context)


class SignIn(View):

	def __init__(self):
		self.error = 0

	def get(self, request):

		context = SessionManager.base_context(request, title='Вхід', header='Вхід', page_name='signin', error=0)
		context['error'] = 0
		return render(request, "signin.html", context)

	def post(self, request):
		context = {}
		form = request.POST

		username = form['username']
		password = form['password']

		user = authenticate(username=username, password=password)
		if user is not None:
			if user.is_active:
				login(request, user)
				context['name'] = username
				return HttpResponseRedirect("/")

		else:
			context = SessionManager.base_context(request, title='Вхід', header='Вхід')
			logout(request)
			context['error'] = 1
			return render(request, "signin.html", context)


class Logout(View):
	def get(self, request):
		logout(request)
		return HttpResponseRedirect("/")


class SignUp(View):
	def get(self, request):

		context = SessionManager.base_context(
			request, title='Реєстрація', header='Реєстрація', page_name='signup', error=0)

		return render(request, "signup.html", context)

	def post(self, request):
		context = {}
		form = request.POST
		user_props = {}
		username = form['username']
		password = form['password']

		user_with_this_username_already_exists = bool(User.objects.filter(username=username))
		if not user_with_this_username_already_exists:
			for prop in form:
				if prop not in ('csrfmiddlewaretoken', 'username', 'gender', 'phone_number') and form[prop] != '':
					user_props[prop] = form[prop]

			user = User.objects.create_user(
				username=form['username'],
				first_name=form['first_name'],
				last_name=form['last_name'],
				password=form['password']),
			# email=form['email']

			user = authenticate(username=username, password=password)
			login(request, user)
			return HttpResponseRedirect("/")

		else:
			context = SessionManager.base_context(
				request, title='Реєстрація', header='Реєстрація')

			for field_name in form.keys():
				context[field_name] = form[field_name]

			context['error'] = 1
			return render(request, "signup.html", context)


class StartGame(View):
	def get(self, request):
		context = SessionManager.base_context(
			request, title='Нова гра', header='Реєстрація')
		return render(request, "start_game.html", context)


class AjaxEditorSaveChatStructure(View):
	def post(self, request):
		form = json.loads(request.body)
		chat_structure = form['chatStructure']
		chat_structure = json.loads(chat_structure)
		chat_structure = csp.ChatStructureAdapter.from_json(chat_structure)

		response = {}

		new_structure = csp.ChatStructureAdapter.to_json()

		response["updatedStructure"] = new_structure
		response["messagesInNodes"] = db.get_messages_for_each_node()
		response["result"] = "success"

		return HttpResponse(
			json.dumps(response, cls=DjangoJSONEncoder),
			content_type="application/json"
		)


class AjaxEditorSaveMessage(View):
	def post(self, request):
		form = json.loads(request.body)

		message = None

		if form['messageId'] == 0:
			message = Message.objects.create(
				node=ChatOptionNode.objects.get(id=form['nodeId']),
				user=Character.objects.filter(username=form['senderCharacter'])[0]
			)
		else:
			message = Message.objects.get(id=form['messageId'])

		message.user = Character.objects.filter(username=form['senderCharacter'])[0]
		message.text = form['messageText']


		message.delay_ms = form["delayMs"]

		message.save()

		response = {}
		response["messageId"] = message.id
		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)


class AjaxEditorDeleteMessage(View):
	def post(self, request):
		form = json.loads(request.body)

		message = Message.objects.get(id=form['messageId'])

		response = {}
		response["messageId"] = message.id
		response["nodeId"] = message.node.id
		message.delete()

		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)


class AjaxCheckIfUserSessionExists(View):
	def post(self, request):
		data = json.loads(request.body)
		session_code = data['userSessionCode'].replace("#", "")

		response = {}
		response["userSessionCodeExists"] = False
		if PlayerSession.objects.filter(user_session_code=session_code).exists():
			response["userSessionCodeExists"] = True

		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)


class AjaxUpdateNodeProperties(View):
	def post(self, request):
		data = json.loads(request.body)
		node_id = data['nodeId']
		node = ChatOptionNode.objects.get(id=node_id)
		node.description = data['nodeDescription']
		node.choice_text = data['nodeUserChoiceText']
		node.chat = Chat.objects.get(id=data['chatId'])

		node.choice_delay_ms = data['delayMs']
		node.choice_lasts_for_ms = data['choiceLastsForMs']
		node.default_selected_node = data['defaultSelectedNode']
  
#   datetime.strptime(form['dateWasWritten']+"T"+form['timeWasWritten']+":"+form['timeSWasWritten']+"+00:00", "%Y-%m-%dT%H:%M:%S%z")
		is_entry_point = data['isEntryPoint']
		if is_entry_point:
			if not EntryNode.objects.filter(node=node).exists():
				new_entry_node = EntryNode(node=node)
				new_entry_node.save()
		else:
			if EntryNode.objects.filter(node=node).exists():
				EntryNode.objects.filter(node=node)[0].delete()

		node.save()

		response = {}
		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)


class AjaxEditorCreateNode(View):
	def post(self, request):
		data = json.loads(request.body)
		response = {}

		if not Chat.objects.filter(id=data['chatId']).exists():
			response["result"] = "error"
			response["errorMessage"] = "Chat does not exist"
			return HttpResponse(
				json.dumps(response),
				content_type="application/json"
			)

		node = ChatOptionNode.objects.create(
			chat=Chat.objects.get(id=data['chatId']),
			type=data['nodeType'],
			description=data['nodeDescription'],
			choice_text=data['nodeUserChoiceText'] if 'nodeUserChoiceText' in data else "",
			pos_x=data['posX'],
			pos_y=data['posY']
		)

		node.save()

		if data['isGameEntryNode']:
			new_entry_node = EntryNode(node=node)
			new_entry_node.save()

		response["nodeId"] = node.id
		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)


class AjaxGetEditorNodeStructure(View):
	def get(self, request):
		response = {}

		response["result"] = "success"
		response["nodeStructure"] = csp.ChatStructureAdapter.to_json()

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)
  
  
class AjaxUserSelectsNode(View):
	def post(self, request):
		data = json.loads(request.body)
		node_id = data['nodeId']
		player_session = PlayerSession.objects.get(user_session_code=data['userSessionCode'])
		player_selected_node = ChatOptionNode.objects.get(id=node_id)
		PlayerSelectedNode.objects.create(player=player_session, node=player_selected_node)
		player_selected_node.save()
  
  
		response = {}
		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)


class AjaxUserSelectsOption(View):
	def post(self, request):
		data = json.loads(request.body)
		node_id = data['nodeId']
		node_selected_time = data['nodeSelectedTime']

		player_session = PlayerSession.objects.get(user_session_code=data['userSessionCode'])
		player_selected_node = ChatOptionNode.objects.get(id=node_id)
  		
		response = {}
		automatically_added_nodes = db.update_selected_nodes(player_session, player_selected_node, node_selected_time)
		response["newTimelineEvents"] = []
		
		for node in automatically_added_nodes: 
			response["newTimelineEvents"] += db.get_timeline_events(node, player_session, START_DATE)

		response['addedNodes'] = [FrontendDataAdapter.adapt_node(adapted_node, node_selected_time) for adapted_node in automatically_added_nodes]
		
		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
			content_type="application/json"
		)