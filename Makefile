PORT ?= 8000

serve:
	
	rm -rf dist tmp
	PORT=9000 RUNNING_TEST=false node server/server.js

test:
	
	rm -rf dist tmp
	RUNNING_TEST=true broccoli serve --port 9000 

build:
	
	rm -rf dist tmp
	broccoli build dist

.PHONY: server build
