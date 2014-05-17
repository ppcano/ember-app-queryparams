PORT ?= 8000

serve:
	
	rm -rf dist tmp
	RUNNING_TEST=false broccoli serve --port 9000 

test:
	
	rm -rf dist tmp
	RUNNING_TEST=true broccoli serve --port 9000 

build:
	
	rm -rf dist tmp
	broccoli build dist

.PHONY: server build
