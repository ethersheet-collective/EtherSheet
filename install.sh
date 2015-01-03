echo "Installing Ethersheet"

if [ ! `which node` ] && [ ! `which nodejs` ]; then
  echo "You need to install nodejs for your platform! Install it via your package manager or at https://nodejs.org"
  exit 1
fi

if ! [ `which npm` ]; then
  echo "You need to install npm for your platform! Install it via your package manager or at https://www.npmjs.com"
  exit 1
fi

if ! [ `which mysql` ]; then
  echo "You need to install mysql for your platform! Install it via your package manager or at https://www.mysql.com"
  exit 1
fi

echo "creating config.js"
cp ./examples/config-example.js config.js
echo 
read -p "press enter to edit config.js" CONT
echo
if [ `which $VISUAL` ]; then
  $VISUAL config.js
elif [ `which gedit` ]; then
  gedit config.js
elif [ `which vim` ]; then
  vim config.js
else
  echo "ERROR: Can't find an editor, you need to edit config.js and put in your settings"
fi

echo "Congratulations! You have installed ethersheet! Now run 'npm start' and point your browser to localhost:8080"
exit 0
