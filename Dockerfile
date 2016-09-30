FROM ubuntu:16:04
MAINTAINER Kyle Dove <dovek@umich.edu>

# execute this separate to allow caching
RUN apt-get update

# install dependencies and link node to nodejs, as ubuntu doesn't do this by default.
RUN apt-get install -y nodejs curl libmysqlclient-dev gunicorn python-pip django-filter python-ldap npm git libldap2-dev libsasl2-dev libssl-dev xmlsec1 && \
	ln -s /usr/bin/nodejs /usr/bin/node

# install depedendent python packages that aren't available as pre-built libraries
RUN pip install --upgrade pip && \
	pip install Django==1.9 mysql-python djangorestframework django-crispy-forms whitenoise requests coverage

# install node packages that aren't available as pre-built libraries
RUN npm install -g bower grunt grunt-cli

# expose port, do this before source code install to minimize layering
EXPOSE 8000

# create place for app to run from
WORKDIR /app/
COPY . /app/

RUN echo '{ "allow_root": true }' > /root/.bowerrc

# Install Ocellus
RUN cd mbofui && \
	bower install && \
	npm install && \
	grunt docker

# copy settings file and launch django
CMD cp /usr/share/ocellus/settings.py ./hacks_mbof/; gunicorn --workers=1 --bind=0.0.0.0:8000 hacks_mbof.wsgi:application
