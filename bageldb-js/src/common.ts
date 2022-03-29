import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';
import BagelDBRequest from './bagelDBRequest';
import BagelMetaRequest from './bagelMetaRequest';
import BagelUsersRequest from './users';

const baseEndpoint = 'https://api.bageldb.com';
const liveEndpoint = 'https://live.bageldb.com/api/public';

const isReactNative = typeof navigator !== 'undefined' && navigator?.product === 'ReactNative';
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const isNode = new Function(
  'try {return this===global;}catch(e){return false;}',
);
export { BagelUsersRequest, BagelDBRequest, BagelMetaRequest };
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
