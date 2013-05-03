test: 
	./node_modules/.bin/mocha -R spec -r chai test/unit/*.js 

install:
	./bin/install.sh
	
.PHONY: test install
