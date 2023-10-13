ts_check:
	npx tsc --noEmit

test:
	npx jest --watchAll

test_coverage:
	npx jest --coverage

test_badge: test_coverage
	npx jest-coverage-badges

clean:
	rm -rf dist;

build: clean
	npx tsc

publish: clean test_badge ts_check build
	npm publish --access public;
	make clean;

ci: ts_check test_coverage build

.PHONY: test