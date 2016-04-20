from django.contrib import admin

from .models import Event, Role, User, Vote

admin.site.register(Event)
admin.site.register(Role)
admin.site.register(User)
admin.site.register(Vote)