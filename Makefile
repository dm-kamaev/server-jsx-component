ts_check:
	npx tsc --noEmit

test:
	npx jest --watchAll

test_coverage:
	npx jest --coverage

test_badge: test_coverage
	npx jest-coverage-badges

build:
	rm -rf dist;
	npx tsc

publish: build
	npm publish --access public

ci: ts_check test_coverage build

.PHONY: test