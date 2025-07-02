from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from datetime import datetime
from django.core.serializers.json import DjangoJSONEncoder

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import AnonymousUser

from django.views.generic import View


from MainApp.models import User, Chat, ChatOptionNode, ChatNodeLink, ChatMember, Character, Message, PlayerSession, PlayerSelectedNode
from .code import chat_structure_parser as csp

import json
import random
import string


def is_user_authenticated(request):
	user = request.user
	user_validation_properties = [
		request.user != None,
		not request.user.is_anonymous,
		type(request.user) != AnonymousUser,
		len(User.objects.filter(username=user.username)) != 0,
		user.is_active
	]
	return not False in user_validation_properties


def full_name(user):
	if user.last_name != '' and user.first_name != '':
		return user.first_name+' '+user.last_name
	elif user.first_name != '':
		return user.first_name
	elif user.last_name != '':
		return user.last_name
	else:
		return user.username


def base_context(request, **args):
	context = {}
	user = request.user

	context['title'] = 'none'
	context['user'] = 'none'
	context['header'] = 'none'
	context['error'] = 0
	context['message'] = ''
	context['is_superuser'] = False
	context['self_user_has_avatar'] = False
	context['page_name'] = 'default'

	if is_user_authenticated(request):

		context['username'] = user.username
		context['full_name'] = full_name(user)
		context['user'] = user

		if request.user.is_superuser:
			context['is_superuser'] = True

	if args != None:
		for arg in args:
			context[arg] = args[arg]

	return context


def generate_unique_code(length=6):
	chars = string.ascii_uppercase + string.digits
	while True:
		code = ''.join(random.choices(chars, k=length))
		if not PlayerSession.objects.filter(user_session_code=code).exists():
			return code
		

def get_messages_in_nodes(chat_id):

	messages_in_nodes = {}

	for node in ChatOptionNode.objects.filter(chat = Chat.objects.get(id=chat_id)):
		messages = Message.objects.filter(node=node).order_by('timestamp')
		messages_txt = {}

		for message in messages:
			message_txt = {
				'id': message.id,
				'text': message.text,
				'time_sent': message.timestamp.strftime("%H:%M:%S") + f".{int(message.timestamp.microsecond / 10000):02d}",
				'timestamp': str(message.timestamp),
				'time_was_written': "",
				'was_read': message.was_read,
				'attached_image': str(message.attached_image),
				'username': message.user.username,
				'full_name': message.user.full_name
			}

			messages_txt[message.id] = message_txt

		messages_in_nodes[node.id] = messages_txt
	
	return messages_in_nodes



class StartGamePage(View):
	def get(self, request):
		context = base_context(request, title='Розпочати', page_name='start_game')
		context["code"] = generate_unique_code()
		
		return render(request, "start-game.html", context)


class MainChatPage(View):
	def get(self, request, session_code):
		context = base_context(request, title='KeepCalm', page_name='game_page')

		player_session = None
		if not PlayerSession.objects.filter(user_session_code=session_code).exists():
			player_session = PlayerSession.objects.create(user_session_code=session_code)
		else:
			player_session = PlayerSession.objects.get(user_session_code=session_code)

		
		player_selected_nodes = PlayerSelectedNode.objects.filter(player=player_session)

		characters = []

		for character in Character.objects.all():
			characters.append({
				'id': character.id,
				'username': character.username,
				'fullName': character.full_name,
				'shortName': character.short_name,
				'displayColor': character.display_color,
				'typingSpeed': character.typing_speed,

				'avatar': str(character.avatar)
			})
		context["characters"] = json.dumps(characters, cls=DjangoJSONEncoder)

		timeline_events = []

		for node in player_selected_nodes:

			node_messages = Message.objects.filter(node=node.node)

			for message in node_messages:
				msg_dict = {
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
					'typingDelayOverride': message.typing_delay_override_ms,
					'typingSpeed': message.user.typing_speed
				}

				timeline_events.append(msg_dict)

		context["timelineEvents"] = json.dumps(timeline_events, cls=DjangoJSONEncoder)

		chats = Chat.objects.all()
		context["chats"] = chats

		chats_JSON = []
		for chat in Chat.objects.all():
			chats_JSON.append({
				'id': chat.id,
				'name': chat.name,
				'isGroup': ChatMember.objects.filter(chat=chat).count() > 1,
				'avatar': str(chat.avatar),
				'isChannel': chat.is_channel
			})
		
		context["chatsJSON"] = json.dumps(chats_JSON, cls=DjangoJSONEncoder)

		context["player_session"] = player_session
		context["session_code"] = session_code

		return render(request, "chat.html", context)


class ChatEditorPage(View):
	def get(self, request, chat_id):
		context = base_context(request, title='Edit', page_name='editor')
		context['chat_id'] = chat_id
		context['chat_obj'] = Chat.objects.get(id=chat_id)
		context['title'] = context['chat_obj'].name
		context['chat_structure'] = csp.ChatStructureAdapter.to_json(context['chat_obj'])

		messagesInNodes = get_messages_in_nodes(chat_id)


		context['messagesInNodes'] = json.dumps(messagesInNodes, cls=DjangoJSONEncoder)

		characters = [(character.username, character.full_name) for character in Character.objects.all()]
		context['characters'] = characters

		context['characters_JSON'] = {}
		for character in characters:
			context['characters_JSON'][character[0]] = character[1]


		context['characters_JSON'] = json.dumps(context['characters_JSON'])

		return render(request, "editor.html", context)


class SignIn(View):

	def __init__(self):
		self.error = 0

	def get(self, request):

		context = base_context(request, title='Вхід', header='Вхід', page_name='signin', error=0)
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
			context = base_context(request, title='Вхід', header='Вхід')
			logout(request)
			context['error'] = 1
			return render(request, "signin.html", context)


class Logout(View):
	def get(self, request):
		logout(request)
		return HttpResponseRedirect("/")


class SignUp(View):
	def get(self, request):

		context = base_context(
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
			context = base_context(
				request, title='Реєстрація', header='Реєстрація')

			for field_name in form.keys():
				context[field_name] = form[field_name]

			context['error'] = 1
			return render(request, "signup.html", context)
		

class StartGame(View):
	def get(self, request):
		context = base_context(
				request, title='Нова гра', header='Реєстрація')
		return render(request, "start_game.html", context)


class AjaxEditorSaveChatStructure(View):
	def post(self, request, chat_id):
		form = json.loads(request.body)
		chat_structure = form['chatStructure']
		chat_structure = json.loads(chat_structure)
		chat_structure = csp.ChatStructureAdapter.from_json(chat_id, chat_structure)

		response = {}

		chat = Chat.objects.get(id=chat_id)
		new_structure = json.dumps(csp.ChatStructureAdapter.to_json(chat))

		response["updatedStructure"] = new_structure
		response["messagesInNodes"] = get_messages_in_nodes(chat_id)
		response["result"] = "success"

		return HttpResponse(
			json.dumps(response),
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

		message_naive_dt = datetime.strptime(form['dateWasWritten']+"T"+form['timeWasWritten']+":"+form['timeSWasWritten']+"+00:00", "%Y-%m-%dT%H:%M:%S%z")
		message_naive_dt = message_naive_dt.replace(microsecond=int(form['timeMsWasWritten'])*10000)
		message.timestamp = message_naive_dt

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
		response["deletedMessageId"] = message.id
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
