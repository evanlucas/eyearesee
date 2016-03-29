NAME ?= eyearesee
VERSION ?= $(shell node -pe 'require(`./package`).version')
ELECTRON_VERSION ?= 0.37.2
BUNDLE_ID ?= com.evanlucas.$(NAME)
OUT ?= build/

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

package-osx: build-css ## Create a package of the app for OS X
	node_modules/.bin/electron-packager . $(NAME) --platform=darwin --arch=x64 \
		--version=$(ELECTRON_VERSION) \
		--icon=resources/icon.icns \
		--app-version=$(VERSION) \
		--app-bundle-id=$(BUNDLE_ID) \
		--prune \
		--out=$(OUT)

clean: ## Remove old generated apps
	-rm -rf $(OUT)$(NAME)-darwin-x64
	-rm -rf coverage/

build-css: ## Build the client side stylesheets
	npm run build-css
