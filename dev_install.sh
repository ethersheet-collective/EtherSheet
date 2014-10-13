#!/bin/bash
mkdir ethersheet
cd ethersheet
echo "cloning Ethersheet"
git clone https://github.com/ethersheet-collective/EtherSheet
echo "cloning es_client"
git clone https://github.com/ethersheet-collective/es_client.git
echo "cloning es_expression"
git clone https://github.com/ethersheet-collective/es_expression.git
echo "cloning transactor"
git clone https://github.com/ethersheet-collective/transactor.git
echo "cloning es_command"
git clone https://github.com/ethersheet-collective/es_command.git
echo "cloning ref-binder"
git clone https://github.com/ethersheet-collective/ref-binder.git
echo '*** INSTALLING es_expression *************************'
cd es_expression
npm install
cd ../
echo '*** INSTALLING transactor ****************************'
cd transactor
npm install
cd ../
echo '*** INSTALLING es_command ****************************'
cd es_command
npm install
cd ../
echo '*** INSTALLING es_client *****************************'
cd es_client
npm install
cd ../
echo '*** INSTALLING EtherSheet ****************************'
cd EtherSheet
npm install
echo 
echo "Enter sudo password to link ethersheet packages for development"
echo
sudo npm link ../es_client
sudo npm link ../es_command
sudo npm link ../transactor
echo 'DONE'
