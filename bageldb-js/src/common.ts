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

/**
 * Returns a JS object representation of a Javascript Web Token from its common encoded
 * string form.
 *
 * @template T the expected shape of the parsed token
 * @param {string} token a Javascript Web Token in base64 encoded, `.` separated form
 * @returns {(T | undefined)} an object-representation of the token
 * or undefined if parsing failed
 */
const getParsedJwt = <T extends object = { [k: string]: string | number }>(
  token: string,
): T | undefined => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return undefined;
  }
};
export type { AxiosInstance, AxiosPromise, AxiosResponse };
export {
  axios,
  baseEndpoint,
  liveEndpoint,
  isReactNative,
  isNode,
  getExpires,
  getParsedJwt,
};
