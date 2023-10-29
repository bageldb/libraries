import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';
// import { runtime } from 'std-env';

// const baseEndpoint = 'https://api.bageldb.com';
const baseEndpoint = 'https://api.bagelstudio.co/api/public';
const liveEndpoint = 'https://live.bageldb.com/api/public';
const AUTH_ENDPOINT = 'https://auth.bageldb.com/api/public';
const REFRESH_TOKEN_ENDPOINT = `${AUTH_ENDPOINT}/user/token`;

const isReactNative =
  typeof navigator !== 'undefined' && navigator?.product === 'ReactNative';

// const isServerEnv = () => runtime;
const isServerEnv = () => !(typeof window != 'undefined' && window?.document);

const getExpires = (expires_in: number): number => {
  const expires = new Date();
  return expires.setSeconds(expires.getSeconds() + expires_in);
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

// const getCircularReplacer = () => { //? For JSON stringify
//   const seen = new WeakSet();
//   return (_: any, value: any) => {
//     if (typeof value === 'object' && value !== null) {
//       if (seen.has(value)) {
//         return;
//       }
//       seen.add(value);
//     }
//     return value;
//   };
// };

export type { AxiosInstance, AxiosPromise, AxiosResponse };
export {
  axios,
  baseEndpoint,
  liveEndpoint,
  AUTH_ENDPOINT,
  REFRESH_TOKEN_ENDPOINT,
  isReactNative,
  isServerEnv,
  getExpires,
  getParsedJwt,
  // getCircularReplacer,
};
