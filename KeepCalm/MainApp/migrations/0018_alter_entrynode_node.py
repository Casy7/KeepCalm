# Generated by Django 4.2 on 2025-07-15 00:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0017_remove_chat_root_node_entrynode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entrynode',
            name='node',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='entry_points', to='MainApp.chatoptionnode', unique=True),
        ),
    ]
