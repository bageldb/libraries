import { AxiosInstance, AxiosRequestHeaders } from 'axios';
import {
  BagelDBRequest,
  BagelMetaRequest,
  BagelUsersRequest,
  axios,
} from './common';
if (typeof document !== 'undefined') {
  console.log('bagelDB is running in a browser');
} else if (typeof globalThis?.navigator !== 'undefined' && globalThis?.navigator?.product === 'ReactNative') {
  // I'm in react-native
} else {
  // I'm in node js
  if (!globalThis?.EventSource) {
    try {
      (async ()=> {

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // const EventSource = require('eventsource');
        const EventSource = await import('eventsource');
        globalThis.EventSource = EventSource.default as any;
      })();

      // eslint-disable-next-line @typescript-eslint/no-implied-eval
    //   const setIt = new Function('try {return globalThis.EventSource = require("eventsource");}catch(e){return false;}');
    //   setIt();
    } catch (error) {
    //   console.warn('if you are running bagelDB in nodejs environment you might need the `eventsource` npm package for live data to function');
    }
  }
}

export default class Bagel {
  [x: string]: any;

  isServer: boolean;

  customStorage:  Storage | undefined;

  apiToken: string;

  axiosInstance: AxiosInstance;

  constructor(apiToken: string, options: { isServer?: boolean; customStorage?: Storage | undefined; } = { isServer: false, customStorage: undefined }) {
    this.isServer = !!options.isServer;
    this.customStorage = options.customStorage;
    this.apiToken = apiToken;
    this.axiosInstance = axios.create();
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        (config.headers as AxiosRequestHeaders)['Accept-Version'] = 'v1';
        if (
          await new BagelUsersRequest({ instance: this })._bagelUserActive() &&
          !config.url?.includes('user/token')
        ) {
          const bagelUserReq = new BagelUsersRequest({
            instance: this,
          });
          const accessToken = await bagelUserReq._getAccessToken();
          (config.headers as AxiosRequestHeaders).Authorization = 'Bearer ' + accessToken;
        } else {
          (config.headers as AxiosRequestHeaders).Authorization = 'Bearer ' + apiToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (
          await new BagelUsersRequest({ instance: this })._bagelUserActive() &&
          error.response &&
          error.response.status == 401 &&
          !error.config.url.includes('user/token')
        ) {
          return new BagelUsersRequest({ instance: this })
            .refresh()
            .then(async () => {
              const config = error.config;
              config.headers.Authorization = `Bearer ${await new BagelUsersRequest(
                { instance: this },
              )._getAccessToken()}`;
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
            .catch(() => {
              return Promise.reject(error);
            });
        }
        return Promise.reject(error);
      },
    );
  }

  schema(collectionID: string) {
    return new BagelMetaRequest({ instance: this, collectionID });
  }

  collection(collectionID: string) {
    return new BagelDBRequest({ instance: this, collectionID });
  }

  users() {
    return new BagelUsersRequest({ instance: this });
  }

  static get ASC() {
    return 'ASC';
  }

  static get DESC() {
    return 'DESC';
  }

  static get EQUAL() {
    return '=';
  }

  static get NOT_EQUAL() {
    return '!=';
  }

  static get GREATER_THAN() {
    return '>';
  }

  static get LESS_THAN() {
    return '<';
  }

  static get WITHIN() {
    return 'within';
  }

  static GeoPointQuery(lat: number, lng: number, distance: number) {
    return `${lat},${lng},${distance}`;
  }
}
