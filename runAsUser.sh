#!/usr/bin/env sh

if [ "$#" -lt 1 ]; then
    echo Usage: $0 loginName
    exit
fi

echo Running server with REMOTE_USER=${1}...

REMOTE_USER=$1 python manage.py runserver