import { AxiosInstance, AxiosRequestHeaders } from "axios";
import {
  BagelDBRequest,
  BagelMetaRequest,
  BagelUsersRequest,
  axios,
} from "./common";
export default class Bagel {
  [x: string]: any;
  isServer: boolean;
  customStorage:  Storage | undefined;
  apiToken: string;
  axiosInstance: AxiosInstance;
  constructor(apiToken: string, options: {isServer?: boolean; customStorage?: Storage | undefined; } = { isServer: false, customStorage: undefined }) {
    this.isServer = !!options.isServer;
    this.customStorage = options.customStorage;
    this.apiToken = apiToken;
    this.axiosInstance = axios.create();
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        (config.headers as AxiosRequestHeaders)["Accept-Version"] = "v1";
        if (
          await new BagelUsersRequest({ instance: this })._bagelUserActive() &&
          !config.url?.includes("user/token")
        ) {
          const accessToken = new BagelUsersRequest({
            instance: this,
          })._getAccessToken();
          (config.headers as AxiosRequestHeaders).Authorization = "Bearer " + accessToken;
        } else {
          (config.headers as AxiosRequestHeaders).Authorization = "Bearer " + apiToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
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
          !error.config.url.includes("user/token")
        ) {
          return new BagelUsersRequest({ instance: this })
            .refresh()
            .then(() => {
              const config = error.config;
              config.headers["Authorization"] = `Bearer ${new BagelUsersRequest(
                { instance: this }
              )._getAccessToken()}`;
              return new Promise((resolve, reject) => {
                axios
                  .request(config)
                  .then((response) => {
                    resolve(response);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });
            })
            .catch(() => {
              return Promise.reject(error);
            });
        }
        return Promise.reject(error);
      }
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
    return "ASC";
  }

  static get DESC() {
    return "DESC";
  }

  static get EQUAL() {
    return "=";
  }

  static get NOT_EQUAL() {
    return "!=";
  }

  static get GREATER_THAN() {
    return ">";
  }

  static get LESS_THAN() {
    return "<";
  }

  static get WITHIN() {
    return "within";
  }

  static GeoPointQuery(lat: number, lng: number, distance: number) {
    return `${lat},${lng},${distance}`;
  }
}
