test:
	./node_modules/.bin/mocha -R spec -r chai lib/test/unit/*.js lib/test/client/models/*.js lib/test/client/views/*.js 

.PHONY: test
