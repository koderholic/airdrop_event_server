
export const awsSdkPromiseResponse = jest.fn().mockReturnValue(Promise.resolve({Items: []}));

export const awsSdkScanPromiseResponse = jest.fn().mockReturnValue(Promise.resolve(true));

const getFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

const putFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

const updateFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

const scanFn = jest.fn().mockImplementation(() => ({ promise: awsSdkScanPromiseResponse }));

const queryFn = jest.fn().mockImplementation(() => ({ promise: awsSdkScanPromiseResponse }));

export class DocumentClient {
  get = getFn;
  put = putFn;
  update = updateFn;
  scan = scanFn;
  query = queryFn;
}
