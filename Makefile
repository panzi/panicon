CHROME=google-chrome
SDKDIR=addon-sdk
CFX=$(SDKDIR)/bin/cfx
BUILDDIR=build
PKGDIR=$(BUILDDIR)/firefox/panicon
CRXDIR=$(BUILDDIR)/chrome/panicon

-include Makefile.user

.PHONY: all clean crx xpi run-xpi userscript

all: crx xpi userscript

crx: $(BUILDDIR)/chrome/panicon.crx

$(BUILDDIR)/chrome/panicon.crx: $(CRXDIR)/panicon.js $(CRXDIR)/manifest.json $(BUILDDIR)/chrome/panicon.pem
	$(CHROME) --pack-extension=$(CRXDIR) --pack-extension-key=$(BUILDDIR)/chrome/panicon.pem

$(BUILDDIR)/chrome/panicon.pem:
	$(CHROME) --pack-extension=$(CRXDIR)

$(CRXDIR)/panicon.js: panicon.js
	mkdir -p $(CRXDIR)
	cp $< $@

$(CRXDIR)/manifest.json: chrome/manifest.json
	mkdir -p $(CRXDIR)
	cp $< $@

xpi: $(BUILDDIR)/firefox/panicon.xpi

$(BUILDDIR)/firefox/panicon.xpi: $(PKGDIR)/data/panicon.js $(PKGDIR)/lib/main.js $(PKGDIR)/package.json
	$(CFX) xpi --pkgdir=$(PKGDIR) --output-file=$@

run-xpi: xpi
	$(CFX) run --pkgdir=$(PKGDIR)

$(PKGDIR)/data/panicon.js: panicon.js
	mkdir -p $(PKGDIR)/data
	cp $< $@

$(PKGDIR)/lib/main.js: firefox/main.js
	mkdir -p $(PKGDIR)/lib
	cp $< $@

$(PKGDIR)/package.json: firefox/package.json
	mkdir -p $(PKGDIR)
	cp $< $@

userscript: $(BUILDDIR)/panicon.user.js

$(BUILDDIR)/panicon.user.js: panicon.js userscript/metadata.user.js
	mkdir -p $(BUILDDIR)
	cat userscript/metadata.user.js panicon.js > $@

clean:
	rm -r $(BUILDDIR)
