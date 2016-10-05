from django.contrib import admin

from .models import Event, Role, Vote, Intention

admin.site.register(Event)
admin.site.register(Role)
admin.site.register(Vote)
admin.site.register(Intention)
