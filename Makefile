test:
	./node_modules/.bin/mocha -R spec -r chai test/unit/*.js node_modules/es_client/test/unit/*.js 

.PHONY: test
