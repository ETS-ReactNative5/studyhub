# Generated by Django 2.2.21 on 2021-06-29 11:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_reputation', '0002_reputationaction_new_object_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='reputationaction',
            old_name='object_id',
            new_name='old_object_id',
        ),
        migrations.AlterField(
            model_name='reputationaction',
            name='new_object_id',
            field=models.UUIDField(db_index=True, verbose_name='object ID'),
        ),
    ]
