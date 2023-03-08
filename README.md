# DrumMachine
Drum machine web app that stores beats and user accounts on a server

This app allows users to create drum beats and perform database CRUD operations with these beats. A large portion of the site, including viewing of all beats and searching for beats, is available for anonymous users. Once registered (using register page) a user can begin to save/change/load/delete their beats, or their own user information. An admin user (two have been provided) has the option to delete any users beats, update their account, or give another user admin privileges. There is no way to register as an admin directly, so any admin needs to come from the two provided admin accounts (un: james pass: james) or (un: test pass: test).

The server can be starting with the command 'npm start' or 'node app.js' and assumes MYSQL is available on the machine and holds the required database 'drumsaves' with all its tables. If errors occur citing the database isn't present, there is an included schema drumsaves.sql that can be run in mysql with this command: mysql> source drumsaves.sql


