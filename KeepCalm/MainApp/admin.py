from django.contrib import admin
from .models import (
    Chat, ChatOptionNode, ChatNodeLink, EntryNode,
    Character, Message, ChatMember, PlayerSession, PlayerSelectedNode
)


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_channel')
    search_fields = ('name',)
    list_filter = ('is_channel',)


@admin.register(EntryNode)
class EntryNodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'node',)
    search_fields = ('node',)
    list_filter = ('node',)


@admin.register(ChatOptionNode)
class ChatOptionNodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat_and_description', 'chat', 'pos_x', 'pos_y')
    list_filter = ('chat',)
    search_fields = ('description', 'chat__name')

    def chat_and_description(self, obj):
        return f"{obj.chat.name}: {obj.description}"
    
    chat_and_description.short_description = "Chat + Description"


@admin.register(ChatNodeLink)
class ChatNodeLinkAdmin(admin.ModelAdmin):
    list_display = ('id', 'parent', 'child')
    list_filter = ('parent__chat',)
    search_fields = ('parent__description', 'child__description')


@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'full_name', 'short_name', 'display_color', 'typing_speed')
    search_fields = ('username', 'full_name', 'short_name')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'node', 'user', 'timestamp', 'was_read')
    list_filter = ('was_read', 'timestamp', 'user')
    search_fields = ('text',)


@admin.register(ChatMember)
class ChatMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'character')
    list_filter = ('chat',)
    search_fields = ('character__full_name', 'character__username')

@admin.register(PlayerSession)
class PlayerSessionAdmin(admin.ModelAdmin):
    list_display = ('user_session_code', 'in_game_time', 'id')
    search_fields = ('user_session_code',)
    ordering = ('-id',)
    readonly_fields = ('user_session_code',)


@admin.register(PlayerSelectedNode)
class PlayerSelectedNodeAdmin(admin.ModelAdmin):
    list_display = ('player_user_session_code', 'node_description', 'id')
    list_filter = ('player', 'node')
    search_fields = ('player__user_session_code', 'node__id')

    def node_description(self, obj):
        return f"{obj.node.chat.name}: {obj.node.description}"
    
    def player_user_session_code(self, obj):
        return obj.player.user_session_code