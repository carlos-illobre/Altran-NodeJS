# Install

* Install NodeJs: https://nodejs.org
* Execute `npm install`
* Execute `npm start`
* Go to: http://localhost:8080/api/docs

# Tests
* run `npm test` for unit tests
* run `npm run itest` for integration tests

# Add a new endpoint
To add a new endpoint a file should be added to the folder `./app/api` or to a
subfolder. The file should exports an Express Route and its name should ends
with `.route.js`
