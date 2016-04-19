# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
    config.vm.box = "ubuntu/trusty64"
    config.vm.provider "virtualbox" do |v|
        v.memory = 1024
    end

    config.vm.network "forwarded_port", guest: 8000, host: 18000
    config.vm.network "forwarded_port", guest: 80,   host: 10080

    config.vm.provision "shell", inline: <<-SHELL
        set -xe

        cd /vagrant

        echo "America/Detroit" > /etc/timezone
        dpkg-reconfigure -f noninteractive tzdata

        apt-get update
        apt-get dist-upgrade -y

        apt-get --no-install-recommends install --yes python-pip python-dev
        apt-get --no-install-recommends install --yes apache2 apache2-utils
        apt-get --no-install-recommends install --yes libldap2-dev libsasl2-dev

        cat <<EOM > /etc/apache2/sites-available/001-se_proxy.conf
<VirtualHost *:80>
        ErrorLog \${APACHE_LOG_DIR}/error.log
        CustomLog \${APACHE_LOG_DIR}/access.log combined
        ProxyPass / http://0.0.0.0:8000/
        ProxyPassReverse / http://0.0.0.0:8000/

        RequestHeader set Proxy-User "foobar"

</VirtualHost>
EOM
        a2enmod rewrite headers proxy_*

        a2dissite 000-default.conf
        a2ensite 001-se_proxy.conf

        service apache2 restart

        pip install coverage
        pip install -r requirements.txt

        echo "Installing Bower..."
        cd /vagrant
        apt-get update
        apt-get install --yes git
        curl --silent --location https://deb.nodesource.com/setup_4.x | sudo bash -
        apt-get install --yes nodejs
        npm install --global npm@latest
        npm install --global bower

        if [ -d /vagrant/hacks_mbof/extras ]; then
            cd /vagrant/hacks_mbof/extras
            ls *.deb; if [ $? -eq 0 ]; then
                apt-get --no-install-recommends install --yes libaio1 libaio-dev
                dpkg -i *.deb
                export ORACLE_HOME=/usr/lib/oracle/12.1/client64
                export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME/lib
                export PATH=$PATH:$ORACLE_HOME/bin
                echo "$ORACLE_HOME/lib" > /etc/ld.so.conf.d/oracle.conf;
                ldconfig
                pip install cx_Oracle
            fi
        fi
    SHELL
end
