FROM ubuntu:14.04

MAINTAINER Kyle Dove <dovek@umich.edu>

# Fix sh to allow running of bash instead of sh
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install dependencies
RUN apt-get update && \
apt-get dist-upgrade -y && \
apt-get install -y libmysqlclient-dev git python-pip python-dev apache2 apache2-utils libldap2-dev libsasl2-dev nodejs curl xmlsec1

# Install Ocellus
WORKDIR /tmp/

COPY . /tmp/

# Install python components based on ocellus requirements file
RUN pip install coverage gunicorn
RUN pip install -r requirements.txt

#Node.js stuff
RUN curl --silent --location https://deb.nodesource.com/setup_4.x | sudo bash -
RUN apt-get install --yes nodejs
RUN npm install --global npm@latest
RUN npm install --global bower

# grunt stuff
RUN npm install -g grunt-cli
RUN npm install --global grunt

RUN echo '{ "allow_root": true }' > /root/.bowerrc
RUN cd mbofui && bower install && npm install && grunt docker

EXPOSE 8000

# copy settings file and launch django
CMD python manage.py migrate; REMOTE_USER=bjensen gunicorn --workers=1 --bind=0.0.0.0:8000 hacks_mbof.wsgi:application

#FROM ubuntu:latest
#
#MAINTAINER Kyle Dove <dovek@umich.edu>
#
## Fix sh to allow running of bash instead of sh
##RUN rm /bin/sh && ln -s /bin/bash /bin/sh
#
#RUN apt-get update
#
## Install dependencies and make symLink to node
#RUN apt-get install -y libmysqlclient-dev git python-pip libssl-dev libffi-dev libsasl2-dev nodejs curl xmlsec1 npm python-ldap django-filter && \
#    ln -s /usr/bin/nodejs usr/bin/node
#
## Install grunt
#RUN npm install --g bower grunt grunt-cli
#
#EXPOSE 8000
#
## Copy Ocellus
#WORKDIR /tmp/
#COPY . /tmp/
#
## Upgrade pip and install python components based on ocellus requirements file from source
#RUN pip install --upgrade pip && \
#    pip install coverage gunicorn && \
#    pip install -r requirements.txt
#
#RUN echo '{ "allow_root": true }' > /root/.bowerrc
#RUN cd mbofui && bower install && npm install && grunt docker
#
## create saml directory for shib files unless running on local machine
##RUN if [ ! -d ./hacks_mbof/saml/ ]; then mkdir ./hacks_mbof/saml/; fi
#
## copy settings file and launch django
## CMD cp /usr/share/ocellus/settings.py ./hacks_mbof/; cp -a /usr/share/ocellus/saml/. ./hacks_mbof/saml/;REMOTE_USER=bjensen gunicorn --workers=1 --bind=0.0.0.0:8000 hacks_mbof.wsgi:application
#
