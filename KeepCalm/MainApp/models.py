import datetime
from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import make_aware


class Chat(models.Model):
	name = models.CharField(max_length=150)
	is_channel = models.BooleanField(default=False)
	avatar = models.ImageField(upload_to='avatars/chats/', null=True, blank=True)



class ChatOptionNode(models.Model):
	chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
	choice_text = models.CharField(max_length=50, blank=True, default="")
	description = models.CharField(max_length=250, blank=True, default="")
	type = models.CharField(max_length=50, blank=True, default="choice")
	choice_delay_ms = models.BigIntegerField(default=0)
	choice_lasts_for_ms = models.IntegerField(default=10000)

	pos_x = models.IntegerField(default=0)
	pos_y = models.IntegerField(default=0)


class EntryNode(models.Model):
	node = models.OneToOneField(ChatOptionNode, on_delete=models.CASCADE, related_name="entry_points", unique=True)


class ChatNodeLink(models.Model):
	parent = models.ForeignKey(ChatOptionNode, on_delete=models.CASCADE, related_name="child_links")
	child = models.ForeignKey(ChatOptionNode, on_delete=models.CASCADE, related_name="parent_links")

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['parent', 'child'], name='unique_node_connection')
		]
	

class Character(models.Model):
	username = models.CharField(max_length=150)
	full_name = models.CharField(max_length=150)
	short_name = models.CharField(max_length=150)

	display_color = models.CharField(max_length=7, default="#000000")
	typing_speed = models.FloatField(default=1.0)
	avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)


class Message(models.Model):
	node = models.ForeignKey(ChatOptionNode, on_delete=models.CASCADE)
	user = models.ForeignKey(Character, on_delete=models.CASCADE)
	delay_ms = models.BigIntegerField(default=0)
	attached_image = models.ImageField(upload_to='chat_images/', null=True, blank=True)
	was_read = models.BooleanField(default=False)
	typing_delay_override_ms = models.IntegerField(default=-1)
	text = models.CharField(max_length=1000)



class ChatMember(models.Model):
	chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
	character = models.ForeignKey(Character, on_delete=models.CASCADE)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['character', 'chat'], name='unique_chat_member')
		]



class PlayerSession(models.Model):
	user_session_code = models.CharField(max_length=80, unique=True)
	in_game_time = models.IntegerField(default=0)


class PlayerSelectedNode(models.Model):
	player = models.ForeignKey(PlayerSession, on_delete=models.CASCADE)
	node = models.ForeignKey(ChatOptionNode, on_delete=models.CASCADE)
	time_selected = models.DateTimeField(default=make_aware(datetime.datetime.now()))

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['player', 'node'], name='unique_player_selected_node')
		]


