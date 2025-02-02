from ...models.structure.module import Module
from ...models.badges import ModuleAwards

from notifications.models import Notification

from .lessons import copy_lesson


def copy_module(unit, module):
    # copy data
    new_module = Module()
    for field in module._meta.get_fields():  # True, False?
        if field.name in ('id', 'uuid', 'unit', 'lessons', 'tagged_items', 'tags', 'moduleawards'):
            continue

        new_field_value = getattr(module, field.name)

        # new version required 3 symbols in name at least
        if field.name == 'name' and len(getattr(module, field.name)) <= 3:
            new_field_value += ' module'

        setattr(new_module, field.name, new_field_value)

    new_module.unit = unit
    new_module.author = unit.author  # old units has no author, so use author from unit
    new_module.save()

    # copy module awards
    module_awards = []
    for award in module.moduleawards_set.all():
        new_award = ModuleAwards(user=award.user,
                                 module=new_module,
                                 module_finished_badge=award.module_finished_badge,
                                 module_completed_award=award.module_completed_award
                                 )

        module_awards.append(new_award)

    ModuleAwards.objects.bulk_create(module_awards)

    # replace notification target object
    from django.contrib.contenttypes.models import ContentType
    module_content_type = ContentType.objects.get_for_model(module.__class__)
    notifications = Notification.objects.filter(action_object_content_type=module_content_type,
                                                action_object_object_id=module.id)

    new_module_content_type = ContentType.objects.get_for_model(new_module.__class__)
    notifications.update(action_object_content_type=new_module_content_type,
                         action_object_object_id=new_module.pk)  # uuid here

    # copy tags
    tags = module.tags.names()
    new_module.tags.set(*tags, clear=True)

    # copy lessons
    for lesson in module.lessons.all():
        copy_lesson(new_module, lesson)
