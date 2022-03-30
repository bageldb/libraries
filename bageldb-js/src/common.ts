import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';

// const baseEndpoint = 'https://api.bageldb.com';
const baseEndpoint = 'https://api.bagelstudio.co/api/public';
const liveEndpoint = 'https://live.bageldb.com/api/public';

const isReactNative = typeof navigator !== 'undefined' && navigator?.product === 'ReactNative';
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const isNode = new Function(
  'try {return this===global;}catch(e){return false;}',
);
export {
  AxiosInstance,
  axios,
  baseEndpoint,
  liveEndpoint,
  AxiosPromise,
  AxiosResponse,
  isReactNative,
  isNode,
};
