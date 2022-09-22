import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios';

import BagelDBRequest from './bagelDBRequest';
import BagelUsersRequest from './users';
import {
  REFRESH_TOKEN_ENDPOINT,
  axios,
  baseEndpoint,
  // getCircularReplacer,
} from './common';
import { BagelConfigOptions, BagelStorageType } from './interfaces';
import curlirize from 'axios-curlirize';

const defaultOptions: BagelConfigOptions = {
  isServer: false,
  customStorage: undefined,
  baseEndpoint,
  customReqHeaders: {},
  enableDebug: false,
};

class Bagel {
  [x: string]: any;

  axiosInstance: AxiosInstance;

  customReqHeaders?: AxiosRequestHeaders;

  customStorage?: BagelStorageType;

  baseEndpoint?: string;

  options: BagelConfigOptions;

  constructor(public apiToken: string, options?: BagelConfigOptions) {
    this.options = { ...defaultOptions, ...options };
    // ? bagel config options
    Object.keys(this.options).forEach((key: string) => {
      if (key === 'isServer') {
        this[key] = !!(this.options?.[key] || defaultOptions[key]);
        return;
      }
      this[key] = this.options?.[key] || defaultOptions[key];
    });
    this.axiosInstance = axios.create({
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (this.enableDebug) {
      curlirize(this.axiosInstance);
    }
    /* Intercepting the request and adding the Authorization header to the request. */
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          (config.headers as AxiosRequestHeaders)['Accept-Version'] = 'v1';
          const bagelUserActive = await new BagelUsersRequest({
            instance: this,
          })._bagelUserActive();

          if (bagelUserActive && config.url !== REFRESH_TOKEN_ENDPOINT) {
            const bagelUserReq = new BagelUsersRequest({
              instance: this,
            });
            const accessToken = await bagelUserReq._getAccessToken();
            (config.headers as AxiosRequestHeaders).Authorization =
              'Bearer ' + accessToken;
          } else {
            (config.headers as AxiosRequestHeaders).Authorization =
              'Bearer ' + apiToken;
          }
          config.headers = {
            ...config.headers,
            ...this.customReqHeaders,
          };
          return config;
        } catch (err) {
          throw err;
        }
      },
      (err) => {
        throw err;
      },
    );

    /* Intercepting the response and checking if the response is 401 and if it is,
    it is refreshing the token and then retrying the request. */
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const ERROR_401 = error?.response && error?.response?.status == 401;
        const bagelUserActive = await new BagelUsersRequest({
          instance: this,
        })._bagelUserActive();
        try {
          if (
            bagelUserActive &&
            ERROR_401 &&
            error?.config?.url !== REFRESH_TOKEN_ENDPOINT
          ) {
            // const token =
            await new BagelUsersRequest({ instance: this }).refresh();
            const config = error.config;
            const token = await new BagelUsersRequest({
              instance: this,
            })._getAccessToken();

            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            };
            const response = await this.axiosInstance.request(config);
            return response;
          }
        } catch (refreshErr) {
          try {
            await this.users().logout();
            throw new Error('Auth: user logged out.');
          } catch (logoutErr: any) {
            throw new Error('Auth: There was an error trying to log user out.');
          }
        }

        if (bagelUserActive && ERROR_401) {
          await this.users().logout();
          throw new Error(
            'Auth: issue with user token refresh. user logged out.',
          );
        }
        throw error;
      },
    );
  }

  getProject(withSchemas = false): Promise<AxiosResponse<any, any>> {
    let url = `${this.baseEndpoint}/project`;
    if (withSchemas) url += '?withSchemas=true';
    return this.axiosInstance.get(url);
  }

  /**
   * @summary
   * Retrieve the schema of a collection.
   * This enables implementing things like dynamic forms or other dynamic pages, which rely on the schema to display different page components.
   * Schema will be retrieved for the parent collection, and will contain the schema for all nested collections inside the parent collection.
   * @example Request:
   * const {data: schema} = await db.schema("chat").get();
   * @param {string} collectionID - The ID of the collection you want to get the schema for.
   * @returns A new instance of the BagelMetaRequest class.
   * @see {@link https://docs.bageldb.com/meta-api/#get-schema}
   */
  schema(collectionID: string): {
    get: () => Promise<AxiosResponse<any, any>>;
  } {
    // return new BagelMetaRequest({ instance: this, collectionID });
    /**
     * @summary
     * Retrieve the schema of a collection.
     * This enables implementing things like dynamic forms or other dynamic pages, which rely on the schema to display different page components.
     * Schema will be retrieved for the parent collection, and will contain the schema for all nested collections inside the parent collection.
     * @example Request:
     * const {data: schema} = await db.schema("chat").get();
     * @returns A Promise with the schema of the collection.
     * @see Docs {@link https://docs.bageldb.com/meta-api/#get-schema}
     */
    return {
      get: () => {
        const url = `${this.baseEndpoint}/collection/${collectionID}/schema`;
        return this.axiosInstance.get(url);
      },
    };
  }

  /**
   * @summary
   * It returns a new BagelDBRequest object with the instance and collectionID properties set
   * @param {string} collectionID - The ID of the collection you want to access.
   * @returns A new BagelDBRequest object.
   * @see {@link https://docs.bageldb.com/content-api/#content-api}
   */
  collection(collectionID: string) {
    return new BagelDBRequest({ instance: this, collectionID });
  }

  /**
   * @summary
   * Bagel Auth with the JS library is designed to be used in a browser-like environment, except for the update password function which will only run using NodeJS.
   * @returns A new instance of the BagelUsersRequest class.
   * @see {@link https://docs.bageldb.com/bagelAuth-api/#bagel-auth-api-beta}
   */
  users() {
    return new BagelUsersRequest({ instance: this });
  }

  static get ASC(): 'ASC' {
    return 'ASC';
  }

  static get DESC(): 'DESC' {
    return 'DESC';
  }

  static get EQUAL(): '=' {
    return '=';
  }

  static get NOT_EQUAL(): '!=' {
    return '!=';
  }

  static get GREATER_THAN(): '>' {
    return '>';
  }

  static get LESS_THAN(): '<' {
    return '<';
  }

  static get WITHIN(): 'within' {
    return 'within';
  }

  /**
   * @summary
   * It takes a latitude, longitude, and distance and returns a string that can be
   * used in a query to find all the points within that distance
   * @param {number} lat - latitude of the point to search around
   * @param {number} lng - longitude
   * @param {number} distance - The distance in meters from the point.
   * @returns A string with the lat, lng, and distance.
   * @see {@link https://docs.bageldb.com/concepts/#geopoint}
   * @see {@link https://docs.bageldb.com/content-api/#querying}
   * @todo add link to documentation
   */
  static GeoPointQuery(lat: number, lng: number, distance: number) {
    return `${lat},${lng},${distance}`;
  }
}

export default Bagel;
export { BagelUsersRequest, BagelDBRequest, Bagel as BagelDB };
