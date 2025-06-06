# Generated by Django 4.2 on 2025-04-20 09:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0004_remove_chatoptionnode_parent_node_chatnodelink'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatoptionnode',
            name='pos_x',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='chatoptionnode',
            name='pos_y',
            field=models.IntegerField(default=0),
        ),
        migrations.AddConstraint(
            model_name='chatnodelink',
            constraint=models.UniqueConstraint(fields=('parent', 'child'), name='unique_node_connection'),
        ),
    ]
