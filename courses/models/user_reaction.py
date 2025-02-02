from django.db import models
from django.db.models import Q
from django.contrib.postgres.fields import JSONField
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from . import Material


class UserReaction(models.Model):

    profile = models.ForeignKey(
        'profiles.Profile', related_name='material_reactions', on_delete=models.CASCADE,
        null=True, blank=True
    )
    anon_session_key = models.CharField(_('session key'), max_length=40, null=True, blank=True)
    material = models.ForeignKey(Material, related_name='users_reaction', on_delete=models.CASCADE)
    data = JSONField()  # only Postgresql support!
    reaction_start_on = models.DateTimeField()  # time when user got an material / need to get from front end for now
    reacted_on = models.DateTimeField(auto_now_add=True)  # time when user gave an answer
    score = models.SmallIntegerField(default=0)  # score for a material. correct answer: score = 100, + score for the games
    is_correct = models.BooleanField(default=False)  # we use this to calculate score of lesson progress
    # fixme we can use the only score value in the future convert is_correct to score=100

    # When user give a reaction - we calculate and set last_reaction flag
    # (remove for an old last_reaction marks for current material and set a new one)
    # If we want to restart lesson - we remove the last_reaction marks for current lesson and user
    # With last_reaction we can:
    # 1) Calculate score of the current lesson
    # 2) Start lesson from following after user_reaction.last_reaction==true reaction
    # (get material from user_reaction.material and find the next material in the lesson)
    # 3) Save history of user reactions
    last_reaction = models.BooleanField(default=True, verbose_name='Mark reaction as last for user')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['last_reaction', 'profile_id', 'material_id'],
                                    name='unique__last_reaction_user',
                                    condition=Q(profile__isnull=False, last_reaction=True)),
            models.UniqueConstraint(fields=['last_reaction', 'anon_session_key', 'material_id'],
                                    name='unique__last_reaction_anon',
                                    condition=Q(anon_session_key__isnull=False, last_reaction=True)),
        ]

    # @property # can't use property due annotate duration field in querysets
    def duration(self):
        tdelta = self.reacted_on - self.reaction_start_on
        return tdelta
        # return tdelta.total_seconds()

    def check_reaction(self):
        # run validate.js from material type
        # 1. get validate.js from material sanbox
        mpt = self.material.material_problem_type
        if not mpt:
            return None

        validate_js_module = mpt.modules.filter(name='validate.js').first()

        if not validate_js_module:
            return None

        # TODO is this safe?
        # see https://github.com/sqreen/PyMiniRacer/issues/118 for deyails
        from py_mini_racer import py_mini_racer
        ctx = py_mini_racer.MiniRacer()
        try:
            ctx.eval(validate_js_module.code)
        except py_mini_racer.JSParseException:
            # validate.js parse exception
            return None

        # call validation function
        # const validate = (correctData, userReactionData) => {
        #   ...
        # };
        try:
            validation_result = ctx.call("validate", self.material.data, self.data)
        except py_mini_racer.JSEvalException as e:
            # validate function not found
            return None

        return validation_result

    def get_correct_data(self):
        return self.material.get_correct_data()


