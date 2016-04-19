"""hacks_mbof URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.views.static import serve
from rest_framework import routers

import mbof.urls
from mbof import views

router = routers.DefaultRouter()
router.register(r'me', views.CurrentUserViewSet)
router.register(r'messages', views.MessageViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'votes', views.VoteViewSet)

urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    url(r'^mbof/', include(mbof.urls)),
    url(r'^admin/', admin.site.urls),

    url(r'^$', serve, {
        'path': '/index.html',
        'document_root': 'mbofui/app',
    }),
    url(r'^bower_components/(?P<path>.*)$', serve, {
        'document_root': 'mbofui/bower_components',
    }),
    url(r'^(?P<path>.*)$', serve, {
        'document_root': 'mbofui/app',
    }),
]
