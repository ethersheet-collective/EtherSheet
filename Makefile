test:
	./node_modules/.bin/mocha -R spec -r should test/unit/*.js

.PHONY: test
