'use-strict'

import { create, request }  from "axios";
import { parse, serialize } from "cookie";
import { BagelDB, BagelUsersRequest } from "@bageldb/bagel-db";

const AUTH_ENDPOINT = "https://auth.bageldb.com/api/public"
class BagelNuxtUser extends BagelUsersRequest {
    constructor({ instance }) {
        super({ instance })
        this.ctx = this.instance.ctx
    }

    _bagelUserActive() {
        return this.getBagelUserID() != null && this.getBagelUserID().length > 0
    }

    getUser() {
        return new Promise(async (resolve, reject) => {
            if (!this._bagelUserActive()) {
                reject(new Error("a Bagel User must be logged in to get Bagel User info"))
                return
            }
            let url = `${AUTH_ENDPOINT}/user`;
            await this.instance.axiosInstance.get(url).then((res) => {
                if (res.status == 200) {
                    resolve(res)
                } else {
                    reject(res)
                }
            }).catch((err) => {
                reject(err)
            });
        })
    }

    _isBrowser() {
        var isNode = new Function("try {return this===global;}catch(e){return false;}");
        return !isNode()
    }

    _getCookie(key) {
        let cookieStr;
        if (!process.client && this.ctx.req) {
            cookieStr = this.ctx.req.headers.cookie
        } else if (process.client) {
            cookieStr = document.cookie
        }

        const cookies = parse(cookieStr || '') || {}
        return cookies[key]
    }

    _setCookie(key, value, options) {
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
                cookies.filter((v, i, arr) =>
                    arr.findIndex((val) => val.startsWith(v.substr(0, v.indexOf('=')))) === i
                )
            )
        }
        return value
    }

    _removeCookie(key) {
        this._setCookie(key, undefined, { maxAge: -1 })
    }

    _storeBagelUser(userID) {
        this._setCookie('bagel-user', userID)
    }

    _storeTokens(accessToken, refreshToken) {
        this._setCookie('bagel-access', accessToken)
        this._setCookie('bagel-refresh', refreshToken)
    }

    getBagelUserID() {
        return this._getCookie("bagel-user")
    }

    _getRefreshToken() {
        return this._getCookie("bagel-refresh")
    }

    _getAccessToken() {
        return this._getCookie("bagel-access")
    }

    logout() {
        this._removeCookie('bagel-user')
        this._removeCookie('bagel-user')
        this._removeCookie('bagel-refresh')
    }
}


export default class BagelNuxt extends BagelDB {
    constructor(apiToken, ctx) {
        super(apiToken)
        this.ctx = ctx;
        this.axiosInstance = create();
        this.axiosInstance.interceptors.request.use((config) => {
            config.headers["Accept-Version"] = "v1";
            if (new BagelNuxtUser({ instance: this })._bagelUserActive() && !config.url.includes("user/token")) {
                let accessToken = new BagelNuxtUser({ instance: this })._getAccessToken()
                config.headers.Authorization = "Bearer " + accessToken;
            } else {
                config.headers.Authorization = "Bearer " + apiToken;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        this.axiosInstance.interceptors.response.use(
            response => {
                return response;
            }, (error) => {
                if (new BagelNuxtUser({ instance: this })._bagelUserActive() && error.response && error.response.status == 401 && !error.config.url.includes("user/token")) {
                    return new BagelNuxtUser({ instance: this }).refresh().then(() => {
                        const config = error.config;
                        config.headers["Authorization"] = `Bearer ${new BagelNuxtUser({ instance: this })._getAccessToken()}`;
                        return new Promise((resolve, reject) => {
                            request(config)
                                .then(response => {
                                    resolve(response);
                                })
                                .catch(error => {
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
};