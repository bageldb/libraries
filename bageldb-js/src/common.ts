import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';

// const baseEndpoint = 'https://api.bageldb.com';
const baseEndpoint = 'https://api.bagelstudio.co/api/public';
const liveEndpoint = 'https://live.bageldb.com/api/public';

const isReactNative =
  typeof navigator !== 'undefined' && navigator?.product === 'ReactNative';
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const isNode = new Function(
  'try {return this===global;}catch(e){return false;}',
);

const getExpires = (expires_in: number): string => {
  const expires = new Date(expires_in);
  return `${expires.setSeconds(expires.getSeconds() + expires_in)}`;
};
export type { AxiosInstance, AxiosPromise, AxiosResponse };
export { axios, baseEndpoint, liveEndpoint, isReactNative, isNode, getExpires };
