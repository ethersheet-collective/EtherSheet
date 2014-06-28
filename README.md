[![Build Status](https://travis-ci.org/ethersheet-collective/EtherSheet.png?branch=master)](https://travis-ci.org/ethersheet-collective/EtherSheet)
Ethersheet
=============
Ether Sheet is a collaborative, realtime open source spreadsheet.
It allows people to collaborate on spreadsheets over the internet in real time.

Join the project or see it in action at http://www.ethersheet.org

#Installing
1. Download or git clone Ethersheet onto your server.
2. run the following command `npm install`
3. copy examples/config-example.js to config.js in the main project directory
4. edit config and put in the database name as well as the username and password
5. run npm start and navigate to localhost:8080

#Developing
1. Run the following command in your terminal:
`curl https://raw.githubusercontent.com/ethersheet-collective/EtherSheet/master/dev_install.sh | bash`
2. copy examples/config-example.js to config.js in the EtherSheet directory
3. edit config and put in the database name as well as the username and password

#Dependencies
Ethersheet is only supported on linux and mysql as of right now, it's possible that it will work on windows or with postgres or some other database, but we haven't tested it on those platforms.   If you want to submit a feature, send a pull request and we will look it over and accept it if it looks good.

#Running tests
To run server tests run `npm test` in the EtherSheet server directory
Simply navigate to [http://localhost:8080/es_client/test/](http://localhost:8080/es_client/test/) to run client tests.
