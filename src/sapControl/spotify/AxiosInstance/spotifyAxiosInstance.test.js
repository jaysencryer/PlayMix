import { SpotAxiosBuilder } from './spotifyAxiosInstance';

import axios from 'axios';

jest.mock('axios');

// beforeAll(() => {
//   axios.create.mockReturnThis();
// });

afterEach(() => {
  jest.clearAllMocks();
});

const mockAccessToken = 'access';
const mockRefreshToken = 'refresh';

const mockAxiosExecute = {
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    response: {
      handlers: [],
      use: (responseInt, errorInt) => {
        mockAxiosExecute.interceptors.response.handlers.push({
          fulfilled: responseInt,
          rejected: errorInt,
        });
      },
    },
  },
};

axios.create = () => mockAxiosExecute;

const testSpotAxios = SpotAxiosBuilder()
  .useTokens(mockAccessToken, mockRefreshToken)
  .build();

const mockResponseWithRefreshToken = {
  data: { accessToken: 'newtoken', refreshToken: 'newrefresh' },
};
const mockResponseNoRefreshToken = { data: { accessToken: 'newtoken' } };
// Initialize moved out of spotAxios

// describe('spotAxios.initialize tests', () => {
//   jest.resetAllMocks();
//   testSpotAxios.execute.post = jest.fn(() => ({
//     data: { access_token: 'comein', refresh_token: 'refresh' },
//   }));
//   test('initialize gets tokens', async () => {
//     await testSpotAxios.initialize();
//     expect(testSpotAxios.execute.post).toHaveBeenCalledTimes(1);
//     expect(testSpotAxios._accessToken).toBe('comein');
//   });
//   test('initialize sets header', async () => {
//     await testSpotAxios.initialize();
//     expect(testSpotAxios.execute.defaults.headers.common['Authorization']).toBe(
//       'Bearer comein',
//     );
//   });
// });

// getAccessToken moved out of spotAxios

// describe('spotAxios.getAccessToken tests', () => {
//   test('getAccessToken returns token', async () => {
//     jest.resetAllMocks();
//     testSpotAxios.execute.post = jest.fn(() => {
//       return { data: { access_token: 'comein', refresh_token: 'refresh' } };
//     });
//     await testSpotAxios.getAccessToken();
//     expect(testSpotAxios._accessToken).toBe('comein');
//     expect(testSpotAxios._refreshToken).toBe('refresh');
//   });

//   test('getAccessToken rejects when axios call fails', async () => {
//     jest.resetAllMocks();
//     testSpotAxios.execute.post = jest.fn(async () =>
//       Promise.reject('Authentication Error'),
//     );

//     await expect(testSpotAxios.getAccessToken()).rejects.toBe(
//       'Authentication Error',
//     );
//   });
// });

describe('spotifyAPI.refreshAccessToken tests', () => {
  test('refreshAccessToken returns token', async () => {
    jest.resetAllMocks();
    axios.get = jest.fn(() => mockResponseWithRefreshToken);

    await testSpotAxios.refreshAccessToken();
    expect(testSpotAxios.accessToken).toBe('newtoken');
    expect(testSpotAxios.refreshToken).toBe('newrefresh');
  });
  test('refreshToken remains unchanged if no refreshToken returned', async () => {
    jest.resetAllMocks();
    axios.get = jest.fn(() => mockResponseNoRefreshToken);
    testSpotAxios.refreshToken = 'refresh';
    await testSpotAxios.refreshAccessToken();
    expect(testSpotAxios.accessToken).toBe('newtoken');
    expect(testSpotAxios.refreshToken).toBe('refresh');
  });

  test('refreshAccessToken rejects when axios call fails', async () => {
    jest.resetAllMocks();
    axios.get = jest.fn(async () => Promise.reject('Authentication Error'));
    await expect(testSpotAxios.refreshAccessToken()).rejects.toBe(
      'Authentication Error',
    );
  });
});

describe('responseErrorInterceptor tests', () => {
  test('responseErrorInterceptor attempts to refresh accessToken on 401', async () => {
    jest.resetAllMocks();
    axios.get = jest.fn(() => mockResponseWithRefreshToken);
    const safeExecute = testSpotAxios.execute;
    testSpotAxios.execute = jest.fn();
    testSpotAxios.execute.defaults = { headers: { common: {} } };
    testSpotAxios.execute.post = jest.fn(() => ({ data: {} }));
    const mockConfig = {
      headers: { Authorization: 'Bearer undefined', mockHeader: true },
    };
    const mockError = {
      response: { status: 401 },
      config: mockConfig,
    };
    await testSpotAxios.responseErrorInterceptor(mockError);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(testSpotAxios.execute).toHaveBeenCalledTimes(1);
    testSpotAxios.execute = safeExecute;
  });

  test('responseErrorIntercpetor executes original request after refreshToken', async () => {
    jest.resetAllMocks();
    axios.get = jest.fn(() => mockResponseWithRefreshToken);

    const mockConfig = {
      headers: { Authorization: 'Bearer newtoken', mockHeader: true },
    };
    const mockError = {
      response: { status: 401 },
      config: mockConfig,
    };
    const safeExecute = testSpotAxios.execute;
    testSpotAxios.execute = jest.fn();
    testSpotAxios.execute.defaults = { headers: { common: {} } };
    testSpotAxios.execute.post = jest.fn(() => ({ data: {} }));
    await testSpotAxios.responseErrorInterceptor(mockError);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(testSpotAxios.execute).toHaveBeenCalledWith(mockConfig);
    testSpotAxios.execute = safeExecute;
  });

  test('responseErrorInterceptor returns Promise rejection if not 401 error', async () => {
    await expect(
      testSpotAxios.responseErrorInterceptor({
        response: { status: 400 },
        config: {},
      }),
    ).rejects.toBeTruthy();
  });
});

describe('setSpotAxiosInterceptors tests', () => {
  test('if execute encounters an response error responseErrorInterceptor is run', async () => {
    jest.resetAllMocks();
    testSpotAxios.responseErrorInterceptor = jest.fn();
    await testSpotAxios.setSpotAxiosInterceptors();
    testSpotAxios.execute.interceptors.response.handlers[0].rejected();
    expect(testSpotAxios.responseErrorInterceptor).toHaveBeenCalledTimes(1);
  });
  test('if execute does not get an error response is not intercepted', async () => {
    jest.resetAllMocks();
    await testSpotAxios.setSpotAxiosInterceptors();
    const response =
      testSpotAxios.execute.interceptors.response.handlers[0].fulfilled('TEST');
    expect(response).toBe('TEST');
  });
});
