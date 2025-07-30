

import random
import string
from django.contrib.auth.models import AnonymousUser

from MainApp.models import User, PlayerSession
from MainApp.utils.frontend_data_adapter import FrontendDataAdapter

class SessionManager:

	@staticmethod
	def full_name(user):
		if user.last_name != '' and user.first_name != '':
			return user.first_name+' '+user.last_name
		elif user.first_name != '':
			return user.first_name
		elif user.last_name != '':
			return user.last_name
		else:
			return user.username

	@staticmethod
	def is_user_authenticated(request):
		user = request.user
		user_validation_properties = [
			request.user is not None,
			not request.user.is_anonymous,
			not isinstance(request.user, AnonymousUser),
			len(User.objects.filter(username=user.username)) != 0,
			user.is_active
		]
		return False not in user_validation_properties


	@staticmethod
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

		if SessionManager.is_user_authenticated(request):

			context['username'] = user.username
			context['full_name'] = FrontendDataAdapter.full_name(user)
			context['user'] = user

			if request.user.is_superuser:
				context['is_superuser'] = True

		if args is not None:
			for arg, value in args.items():
				context[arg] = value

		return context


	@staticmethod
	def generate_session_code(length=6):
		chars = string.ascii_uppercase + string.digits
		while True:
			code = ''.join(random.choices(chars, k=length))
			if not PlayerSession.objects.filter(user_session_code=code).exists():
				return code

