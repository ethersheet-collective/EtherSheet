test:
	./node_modules/.bin/mocha -R landing -r should test/unit/*.js
.PHONY: test
