from django.conf.urls import url
from rest_framework import routers

from .apis import ReputationActionViewSet


router = routers.DefaultRouter()
router.register(r'', ReputationActionViewSet, basename='reputation_action')

urlpatterns = router.urls
