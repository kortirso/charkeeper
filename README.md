# README

### E2E tests

With browser
```bash
$ rails server -e test -p 5002
$ yarn cypress open --project ./spec/e2e
```

Headless
```bash
$ rails server -e test -p 5002
$ yarn run cypress run --project ./spec/e2e
```
