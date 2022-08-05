import { AxiosError, AxiosInstance, AxiosRequestHeaders } from 'axios';

import BagelDBRequest from './bagelDBRequest';
import BagelMetaRequest from './bagelMetaRequest';
import BagelUsersRequest from './users';
import { axios } from './common';

class Bagel {
  [x: string]: any;

  isServer: boolean;

  customStorage: Storage | undefined;

  apiToken: string;

  axiosInstance: AxiosInstance;

  constructor(
    apiToken: string,
    options: { isServer?: boolean; customStorage?: Storage | undefined } = {
      isServer: false,
      customStorage: undefined,
    },
  ) {
    this.isServer = !!options.isServer;
    this.customStorage = options.customStorage;
    this.apiToken = apiToken;
    this.axiosInstance = axios.create({
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    /* Intercepting the request and adding the Authorization header to the request. */
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        (config.headers as AxiosRequestHeaders)['Accept-Version'] = 'v1';
        if (
          (await new BagelUsersRequest({
            instance: this,
          })._bagelUserActive()) &&
          !config.url?.includes('user/token')
        ) {
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
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    /* Intercepting the response and checking if the response is 401 and if it is,
    it is refreshing the token and then retrying the request. */
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        if (
          (await new BagelUsersRequest({
            instance: this,
          })._bagelUserActive()) &&
          error.response &&
          error.response?.status == 401 &&
          !error?.config?.url?.includes?.('user/token')
        ) {
          return new BagelUsersRequest({ instance: this })
            .refresh()
            .then(async () => {
              const config = error.config;
              const token = await new BagelUsersRequest({
                instance: this,
              })._getAccessToken();

              (
                config.headers as Record<string, string>
              ).Authorization = `Bearer ${token}`;
              return new Promise((resolve, reject) => {
                axios
                  .request(config)
                  .then((response) => {
                    resolve(response);
                  })
                  .catch((err) => {
                    reject(err);
                  });
              });
            })
            .catch(async (refreshErr: any) => {
              try {
                await this.users().logout();
                Promise.reject({
                  Error: refreshErr,
                  message: 'BagelAuth: Token expired. user logged out.',
                });
              } catch (logoutErr: any) {
                Promise.reject({
                  Error: logoutErr,
                  message:
                    'BagelAuth: Token expired. There was an error trying to log user out.',
                });
              }
            });
        }
        Promise.reject(error);
      },
    );
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
  schema(collectionID: string) {
    return new BagelMetaRequest({ instance: this, collectionID });
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
export {
  BagelUsersRequest,
  BagelDBRequest,
  BagelMetaRequest,
  Bagel as BagelDB,
};
