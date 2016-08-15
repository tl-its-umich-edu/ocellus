FROM ubuntu:14.04

MAINTAINER Kyle Dove <dovek@umich.edu>

# Fix sh to allow running of bash instead of sh
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install dependencies
RUN apt-get update && \
apt-get dist-upgrade -y && \
apt-get install -y libmysqlclient-dev git python-pip python-dev apache2 apache2-utils libldap2-dev libsasl2-dev nodejs curl

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
