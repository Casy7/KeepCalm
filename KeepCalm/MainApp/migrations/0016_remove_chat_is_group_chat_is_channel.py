# Generated by Django 4.2 on 2025-06-29 20:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0015_chat_avatar'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chat',
            name='is_group',
        ),
        migrations.AddField(
            model_name='chat',
            name='is_channel',
            field=models.BooleanField(default=False),
        ),
    ]
