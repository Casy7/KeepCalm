# Generated by Django 4.2 on 2025-07-16 22:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0019_alter_entrynode_node'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatoptionnode',
            name='short_description',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
    ]
