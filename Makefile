JS_SOURCES = src/js/jquery.infinitescroller.min.js \
             src/js/jquery.mousewheel.pack.js \
             src/js/microtemplating.js\
             src/js/jquery.stackview.base.js \
             src/js/jquery.stackview.stackcache.js\
             src/js/jquery.stackview.templates.js

JS_OUTPUT = lib/jquery.stackview.min.js

YUI = java -jar bin/yuicompressor-2.4.7.jar

js:
	cat $(JS_SOURCES) > temp.js
	$(YUI) -o $(JS_OUTPUT) temp.js
	rm -f temp.js

clean:
	rm -f $(JS_OUTPUT)

.PHONY: js clean
