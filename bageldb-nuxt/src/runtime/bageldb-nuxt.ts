

import { BagelUsersRequest, BagelDB } from '@bageldb/bagel-db/src/server';
import type { BagelUser } from '@bageldb/bagel-db/src/interfaces';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { parse, serialize } from './cookies';

const AUTH_ENDPOINT = 'https://auth.bageldb.com/api/public';
// const axios = _axios.default;

class BagelNuxtUser extends BagelUsersRequest {
  constructor({ instance }: { instance: any }) {
    super({ instance })
    this.ctx = this.instance.ctx
  }

  async _bagelUserActive() {
    const userId = await this.getBagelUserID()
    return userId !== null && userId?.length > 0
  }

  getUser(): Promise<AxiosResponse<BagelUser, any>> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!this._bagelUserActive()) {
        reject(new Error("a Bagel User must be logged in to get Bagel User info"))
        return
      }
      const url = `${AUTH_ENDPOINT}/user`;
      await this.instance
        .axiosInstance
        .get(url)
        .then(
          (res) => {
            if (res.status == 200) {
              resolve(res)
            } else {
              reject(res)
            }
          })
        .catch(
          (err) => {
            reject(err)
          });
    })
  }

  _isBrowser() {
    const isNode = new Function("try {return this===global;}catch(e){return false;}");
    return !isNode()
  }

  _getCookie(key: string) {
    let cookieStr: string | undefined = undefined;
    if (!process.client && this.ctx.req) {
      cookieStr = this.ctx.req.headers.cookie
    } else if (process.client) {
      cookieStr = document.cookie
    }
    const cookies = parse(cookieStr || '') || {}


    return cookies[key]
  }

  _setCookie(key: string, value?: string, options = {} as Record<string, any>) {
    if ((process.server && !this.ctx.res)) return
    const _key = key
    const _value = typeof value === 'string' ? value : JSON.stringify(value)
    const _options = options || {}
    _options.expires = new Date(Date.now() + 7 * 864e5)
    const serializedCookie = serialize(_key, _value, _options)

    if (process.client) {
      // Set in browser
      document.cookie = serializedCookie
    } else if (process.server && this.ctx.res) {
      // Send Set-Cookie header from server side
      const cookies = (this.ctx.res.getHeader('Set-Cookie')) || []
      cookies.unshift(serializedCookie)
      this.ctx.res.setHeader(
        'Set-Cookie',
        cookies.filter((v: string, i: any, arr: any[]) =>
          arr.findIndex((val: string) => val.startsWith(v.substr(0, v.indexOf('=')))) === i
        )
      )
    }
    return _value
  }

  _removeCookie(key: string) {
    this._setCookie(key, undefined, { maxAge: -1 })
  }

  _storeBagelUser(userID: string): any {
    this._setCookie('bagel-user', userID)
  }

  async _storeTokens(data: Record<string, any>): Promise<void> {
    if (data?.access_token) {
      this._setCookie('bagel-access', data.access_token)
    }

    if (data?.expires_in) {
      const expires = new Date(Date.now() + data.expires_in * 1000)
      this._setCookie('bagel-expires', expires.toISOString())
    }

    if (data?.refresh_token) {
      this._setCookie('bagel-refresh', data.refresh_token)
    }
  }

  async getBagelUserID() {
    return this._getCookie("bagel-user")
  }

  async _getRefreshToken() {
    return this._getCookie("bagel-refresh")
  }

  async _getAccessToken() {
    return this._getCookie("bagel-access")
  }

  async logout() {
    this._removeCookie('bagel-user')
    this._removeCookie('bagel-user')
    this._removeCookie('bagel-refresh')
  }
}


// module.exports =
export default class BagelNuxt extends BagelDB {
  constructor(apiToken: string, ctx: { alias: string; token: string; }) {
    super(apiToken)
    this.ctx = ctx;
    this.axiosInstance = axios.create();

    this.axiosInstance
      .interceptors
      .request
      .use(
        async (config) => {
          if (!config.headers) {
            config.headers = {};
          }
          config.headers["Accept-Version"] = "v1";
          const userIsActive = await new BagelNuxtUser({ instance: this })._bagelUserActive();
          if (userIsActive && !config.url?.includes("user/token")) {
            const accessToken = new BagelNuxtUser({ instance: this })._getAccessToken()
            config.headers.Authorization = "Bearer " + accessToken;
          } else {
            config.headers.Authorization = "Bearer " + apiToken;
          }
          return config;
        }, (error) => {
          return Promise.reject(error);
        });

    this.axiosInstance
      .interceptors
      .response
      .use(
        response => {
          return response;
        },
        async (error) => {
          const userIsActive = await new BagelNuxtUser({ instance: this })._bagelUserActive();
          if (userIsActive && error.response && error.response.status == 401 && !error.config.url.includes("user/token")) {
            return new BagelNuxtUser({ instance: this }).refresh().then(() => {
              const config = error.config;
              config.headers["Authorization"] = `Bearer ${new BagelNuxtUser({ instance: this })._getAccessToken()}`;
              return new Promise((resolve, reject) => {
                axios.request(config)
                  .then((response: unknown) => {
                    resolve(response);
                  })
                  .catch((error: any) => {
                    reject(error);
                  });
              });
            }).catch(() => {
              return Promise.reject(error);
            })
          }
          return Promise.reject(error);
        });
  }

  users() {
    return new BagelNuxtUser({ instance: this })
  }

}
