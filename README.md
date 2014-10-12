[![Build Status](https://travis-ci.org/ethersheet-collective/EtherSheet.png?branch=master)](https://travis-ci.org/ethersheet-collective/EtherSheet)
Ethersheet
=============
Ether Sheet is a collaborative, realtime open source spreadsheet.
It allows people to collaborate on spreadsheets over the internet in real time.

Join the project or see it in action at http://www.ethersheet.org

#For Users
1. Download the latest version of ethesheet from https://ethersheet.org/releases/ethersheet_latest.tgz
2. Unpack the tarball and run the script named `install.sh`
3. run npm start and navigate to localhost:8080

## Verifying the package
You can verify the authenticity of the tarball by checking its signature with our gpg key. You can always find the latest signature file at https://ethersheet.org/releases/ethersheet_latest.tgz.sig and you can find our key at https://ethersheet.org/static/ethersheet_gpg_key.asc

#For Developers
1. Run the following command in your terminal:
`curl https://raw.githubusercontent.com/ethersheet-collective/EtherSheet/master/dev_install.sh | bash`
2. copy examples/config-example.js to config.js in the EtherSheet directory
3. edit config and put in the database name as well as the username and password

#Dependencies
Ethersheet is only supported on linux and mysql as of right now, it's possible that it will work on windows or with postgres or some other database, but we haven't tested it on those platforms.   If you want to submit a feature, send a pull request and we will look it over and accept it if it looks good.

#Running tests
To run server tests run `npm test` in the EtherSheet server directory
Simply navigate to [http://localhost:8080/es_client/test/](http://localhost:8080/es_client/test/) to run client tests.
