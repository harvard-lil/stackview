JS_SOURCES = src/js/microtemplating.js\
             src/js/jquery.stackview.base.js \
             src/js/jquery.stackview.infinite.js\
             src/js/jquery.stackview.navigation.js\
             src/js/jquery.stackview.stackcache.js\
             src/js/jquery.stackview.templates.js

SCSS_SOURCE = src/scss/jquery.stackview.scss
JS_OUTPUT = lib/jquery.stackview.min.js
CSS_OUTPUT = lib/jquery.stackview.css
CSS_OUTPUT_STYLE = expanded

YUI = java -jar bin/yuicompressor-2.4.7.jar

all: clean js css

js:
	cat $(JS_SOURCES) > temp.js
	$(YUI) -o $(JS_OUTPUT) temp.js
	rm -f temp.js

css:
	sass --style $(CSS_OUTPUT_STYLE) $(SCSS_SOURCE):$(CSS_OUTPUT)

clean:
	rm -f $(JS_OUTPUT) $(CSS_OUTPUT)

.PHONY: js css clean
