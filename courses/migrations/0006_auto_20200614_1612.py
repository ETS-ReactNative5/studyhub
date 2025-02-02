# Generated by Django 2.2.11 on 2020-06-14 13:12

import courses.models.material
import courses.models.material_problem_type_sandbox
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0005_auto_20200412_0937'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='cover_photo',
            field=models.ImageField(blank=True, null=True, upload_to='courses_covers'),
        ),
        migrations.AlterField(
            model_name='course',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='courses_images'),
        ),
        migrations.AlterField(
            model_name='material',
            name='screenshot',
            field=models.ImageField(blank=True, null=True, upload_to=courses.models.material.uuid_as_name),
        ),
        migrations.AlterField(
            model_name='materialproblemtypesandbox',
            name='screenshot_url',
            field=models.ImageField(blank=True, null=True, upload_to=courses.models.material_problem_type_sandbox.uuid_as_name),
        ),
        migrations.AlterUniqueTogether(
            name='materialproblemtypesandbox',
            unique_together={('slug_prefix', 'slug_suffix')},
        ),
        migrations.AlterUniqueTogether(
            name='materialproblemtypesandboxdirectory',
            unique_together={('slug_prefix', 'slug_suffix')},
        ),
        migrations.AlterUniqueTogether(
            name='materialproblemtypesandboxmodule',
            unique_together={('slug_prefix', 'slug_suffix')},
        ),
        migrations.AlterUniqueTogether(
            name='mysql',
            unique_together={('slug_prefix', 'slug_suffix')},
        ),
    ]
