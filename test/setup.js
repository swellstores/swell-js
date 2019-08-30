global.fetch = require('jest-fetch-mock');

beforeEach(() => {
  fetch.resetMocks();
  fetch.mockResponse(JSON.stringify({}));
});
