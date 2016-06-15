# hacks_mbof
If you know M-BoF, you don't need to know anything else.

# Setup

Use terminal, iTerm, etc. Not XTerm.

0. Install Vagrant - https://www.vagrantup.com/
0. Start Vagrant
   - `cd ocellus`
   - `vagrant up`
   - `vagrant ssh`
   - `cd /vagrant'
0. Install Bower, Grunt, JsHint and Watch packages
   - `cd mbofui`
   - `bower install`
   - `npm cache clean`
   - `npm install`
   - `grunt dev` to lint and concatenate js or `grunt js-dev` to do the same plus Watch (which concatenates and lints on changes to js) # Development

# Development

0. Prepare the application configuration
    - `cd /vagrant/hacks_mbof`
    - `cp settings.py.template settings.py`
    - Edit `settings.py` to set various values:
        - `SECRET_KEY` A secret key can be generated at http://www.miniwebtool.com/django-secret-key-generator/
0. Initialize Database
    - `cd /vagrant`
    - `python manage.py migrate`
    - `python manage.py loaddata mbof/fixtures/dev_data.json`
0. Start the application server
    - Run the development app server
        - _**Without**_ remote user specified
            - `python manage.py runserver`
        - _**With**_ remote user specified
            - `sh runAsUser.sh bjensen`
                - `bjensen` is a user included in the test data.  Others are available.  For the purposes of the HWF event, use only known users.
0. Browse to...
    - M-BoF homepage: [http://localhost:18000/](http://localhost:18000/)
    - REST API
        - Root: [http://localhost:18000/api/](http://localhost:18000/api/) (Note trailing slash.)
        - Events: [http://localhost:18000/api/events/](http://localhost:18000/api/events/)
        - Current Events: [http://localhost:18000/api/events/current/](http://localhost:18000/api/events/current/)
        - Upcoming Events: [http://localhost:18000/api/events/upcoming/](http://localhost:18000/api/events/upcoming/)
        - Users: [http://localhost:18000/api/users/](http://localhost:18000/api/users/)
        - Current authen. user: [http://localhost:18000/api/me/](http://localhost:18000/api/me/)
    - Testing UI:
        - Events list: [http://localhost:18000/api/events/](http://localhost:18000/api/events/) (Note trailing slash.)
        - Events detail: [http://localhost:18000/api/events/1/](http://localhost:18000/api/events/1/)
    - DB admin: [http://localhost:18000/admin/](http://localhost:18000/admin/) (Note trailing slash.)

## Update Data Fixtures ##

This is the procedure for updating the fixture files after adding dummy data to the DB.

0. Connect to the SQLite DB by opening the `db.sqlite3` file with a compatible client.  (If a MySQL DB is used for the project later, running in the Vagrant VM, the connection can be made from your host system via the forwarded port defined in the Vagrant file.)
0. Delete all tables.
0. Apply the migrations to recreate the tables:
    - `python manage.py migrate`
0. Load the existing fixtures:
    - `python manage.py loaddata mbof/fixtures/dev_data.json`
0. Make changes to the DB needed to exercise application features.
0. Save the updated DB to a fixture file:
    - `python manage.py dumpdata --indent 4 mbof > mbof/fixtures/dev_data.json`
0. Commit the updated fixture file to the project.



# To-Do
- Display BoFs within viewing area
    - For now, return all BoFs.
    - For implementation later:  Find BoFs within radius of a point
        - convert radius into +/- degrees lat/lon
        - calculate within web service
        - see: http://stackoverflow.com/a/1253545/543738
        - see: http://www.movable-type.co.uk/scripts/latlong.html
- Link BoFs to user
- get user from api by loginname
- Create BoF
    - Use REMOTE_USER
    - Set PostingTime and StartTime to current time
    - Set EndTime to five days from current time
