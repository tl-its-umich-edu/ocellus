# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-07-15 14:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mbof', '0003_event_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='status',
            field=models.CharField(choices=[('active', 'active'), ('canceled', 'canceled')], default='active', max_length=8),
        ),
    ]