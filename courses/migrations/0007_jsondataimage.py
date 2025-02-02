# Generated by Django 2.2.11 on 2020-06-14 14:47

import courses.models.media_store
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0006_profile_profile_views'),
        ('courses', '0006_auto_20200614_1612'),
    ]

    operations = [
        migrations.CreateModel(
            name='JsonDataImage',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(help_text='Name', max_length=2048, validators=[django.core.validators.MinLengthValidator(3)])),
                ('slug', models.SlugField(blank=True, max_length=1536, null=True, unique=True)),
                ('slug_prefix', models.SlugField(blank=True, max_length=1536, null=True)),
                ('slug_suffix', models.PositiveIntegerField(null=True)),
                ('position', models.PositiveSmallIntegerField(blank=True, null=True, verbose_name='Position')),
                ('updated_on', models.DateTimeField(auto_now=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to=courses.models.media_store.uuid_as_name)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='profiles.Profile')),
                ('last_edit_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='courses_jsondataimage_last_edit_items', to='profiles.Profile')),
                ('material', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='data_images', to='courses.Material')),
            ],
            options={
                'abstract': False,
                'unique_together': {('slug_prefix', 'slug_suffix')},
            },
        ),
    ]
