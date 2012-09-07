test:
	./node_modules/.bin/mocha -R spec -r chai test/unit/*.js lib/node_modules/es_client/test/unit/*.js 

.PHONY: test
