# README

### E2E tests

With browser
```bash
$ yarn add cypress@14.5.4 --dev
$ rails server -e test -p 5002
$ yarn cypress open --project ./spec/e2e
$ yarn remove cypress
```

Headless
```bash
$ yarn add cypress@14.5.4 --dev
$ rails server -e test -p 5002
$ yarn run cypress run --project ./spec/e2e
$ yarn remove cypress
```
