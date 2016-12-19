.PHONY: watch

HAML=/usr/bin/haml
COFFEE = coffee
TSC=tsc
LESSCSS=lessc
SED=sed
COMPILER=uglifyjs 
INCLUDES= js/jquery-1.6.2.min.js js/underscore.js js/backbone.js js/jquery-ui-1.8.16.custom.min.js \
    js/jquery-css-transform.js js/jquery-animate-css-rotate-scale.js js/buzz.js

all: index.html style.css js/magnets.js js/sat.js js/wordlist.js

js/magnets.js: src/magnets.coffee
	$(COFFEE) --compile --output js/ $<

js/wordlist.js: src/wordlist.coffee
	$(COFFEE) --compile --no-header --bare --output js/ $<
	$(SED) -i -e '$$ s/;$$//' $@

js/sat.js: src/sat.ts
	$(TSC) $< --outDir js/ --module "commonjs"

js/test_sat.js: src/test_sat.ts
	$(TSC) $< --outDir js/ --module "commonjs"

test: js/test_sat.js js/sat.js
	node_modules/nodeunit/bin/nodeunit js/test_sat.js

style.css: src/style.less
	$(LESSCSS) $< $@

index.html: src/index.haml
	$(HAML) --unix-newlines --no-escape-attrs --double-quote-attributes $< > $@

compile: all
	cat ${INCLUDES} js/magnets.js | ${COMPILER} > js/compiled.js

watch:
	while inotifywait src/*.less src/*.haml src/*.coffee ; do make all; fab send_client ; done

