import {
  AxiosInstance,
  AxiosPromise,
  AxiosResponse,
  isNode,
  isReactNative,
  getExpires,
  getParsedJwt,
} from './common';
import type { BagelStorageType, bagelType, BagelUser } from './interfaces';
import type FormData from 'form-data';
import FallbackStorage from './fbStorage';

const AUTH_ENDPOINT = 'https://auth.bageldb.com/api/public';

export default class BagelUsersRequest {
  instance: bagelType;

  axios: AxiosInstance;

  bagelStorage: BagelStorageType;

  [x: string]: any;

  constructor({ instance }: { instance: bagelType }) {
    this.instance = instance;
    this.axios = this.instance.axiosInstance;
    this.bagelStorage =
      this.instance?.customStorage ||
      globalThis?.localStorage ||
      new FallbackStorage({});
  }

  _isBrowser(): boolean {
    return (
      typeof document !== 'undefined' ||
      (typeof navigator !== 'undefined' && navigator?.product === 'ReactNative')
    );
  }

  /**
   * Checks if the user is active.
   * @returns A boolean value.
   */
  async _bagelUserActive(): Promise<boolean> {
    const isBrowser = this._isBrowser();
    try {
      const bagelUserID = isBrowser && (await this.getBagelUserID());
      return bagelUserID !== null && (bagelUserID || '')?.length > 0;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary
   * It creates a new user in the database and returns the user's id
   * @NOTE ⚠️ **_On user creation, the user will automatically logged-in and any further BagelDB call will be made with their permissions_**
   * @example
   * const userID = await db.users().create(email, password)
   * @param {string} email - string - The email address of the user
   * @param {string} password - string - The password of the user
   * @returns A promise that resolves to the user_id of the user that was created.
   * @see Docs {@link https://docs.bageldb.com/bagelAuth-api/#user-creation}
   */
  create(email: string, password: string): Promise<string> {
    email = email.toLowerCase().trim();
    return new Promise((resolve, reject) => {
      const url = `${AUTH_ENDPOINT}/user`;
      const body = { email, password };
      this.axios
        .post(url, body)
        .then(async (res) => {
          if (res?.status == 201) {
            const { data } = res;
            if (this.instance.isServer) {
              resolve(data.user_id);
              return;
            }
            await this._storeTokens(data);
            await this._storeBagelUser(data?.user_id || '');
            resolve(data.user_id);
          } else {
            reject(res);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Validate the user's received One Time Password
   * It sends a POST request to the `/user/otp/verify/:nonce` endpoint with the OTP
   * code as the body, and if the request is successful, it stores the tokens and
   * the user ID in the local storage
   * @example
   * const userID = await db.users().validateOtp(otpCode);
   * @param {string} otp - string - the OTP code you received via SMS/Email
   * @returns The user_id
   */
  async validateOtp(otp: string) {
    const nonce = await this._getOtpRequestNonce();
    const url = `${AUTH_ENDPOINT}/user/otp/verify/${nonce}`;
    const body = { otp };
    try {
      const res = await this.axios.post(url, body);
      await this._storeTokens(res?.data);
      await this._storeBagelUser(res?.data?.user_id || '');

      return res?.data.user_id;
    } catch (err) {
      throw new Error('wrong authorization code ' + err);
    }
  }

  /**
   * @private
   * @summary
   * It gets the OTP request nonce from the storage and checks if it's expired
   * @returns The OTP request nonce
   */
  async _getOtpRequestNonce() {
    const otpRequest = await this.bagelStorage.getItem('bagel-nonce');
    const expires = Number(
      (await this.bagelStorage.getItem('bagel-expires')) || 0,
    );
    if (otpRequest && expires) {
      const date = new Date();

      if (date.setSeconds(date.getSeconds()) > expires)
        throw new Error('OTP request has expired, try requesting a renewed');
      return otpRequest;
    } else {
      throw new Error('Request an OTP first');
    }
  }

  /**
   * @summary
   * It sends a POST request to the /user/otp endpoint with the user's email or
   * phone number, and returns the nonce
   * @example
   * const nonce = await db.users().requestOtp(emailOrPhone);
   * @param {string} emailOrPhone - The email or phone number of the user.
   * @returns The nonce is being returned.
   */
  async requestOtp(emailOrPhone: string): Promise<string> {
    if (!emailOrPhone)
      throw new Error('email or phone must not be empty or undefined');
    emailOrPhone = emailOrPhone.toLowerCase().trim();
    const url = `${AUTH_ENDPOINT}/user/otp`;
    const body = { emailOrPhone: emailOrPhone };
    try {
      const res = await this.axios.post(url, body);
      await this._storeOtpRequestNonce(res?.data);
      return res?.data.nonce;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @private
   * @summary
   * It stores the nonce and the expiration time in the local storage
   * @param  - `nonce` - The nonce that was generated by the server.
   */
  async _storeOtpRequestNonce({
    nonce,
    expires_in,
  }: {
    nonce: string;
    expires_in: number;
  }) {
    await this.bagelStorage.setItem('bagel-nonce', nonce);
    await this.bagelStorage.setItem(
      'bagel-expires',
      `${getExpires(expires_in)}`,
    );
  }

  /**
   * @summary
   * On user login the user id is returned if successful and any further BagelDB call will be made with their permissions.
   * @NOTE ⚠️ **_There is no need to refresh the user's tokens as this will happen automatically when using the JS library_**
   * @example
   * const userID = await db.users().validate(email, password);
   * @param {string} email - string - The email of the user
   * @param {string} password - string - The password of the user
   * @returns A promise that resolves to the user_id of the user that was validated.
   */
  async validate(email: string, password: string): Promise<string> {
    try {
      email = email.toLowerCase().trim();
      if (!email || !password) throw new Error('email or password is empty');
      const url = `${AUTH_ENDPOINT}/user/verify`;
      const body = { email, password };
      const { data } = await this.axios.post(url, body);
      await this._storeTokens(data);
      await this._storeBagelUser(data.user_id);
      return data.user_id;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary
   * This function returns a promise that resolves to an AxiosResponse object
   * containing a BagelUser object
   * @example Request:
   * db.users().getUser()
   * @returns {AxiosResponse<BagelUser, any>} A promise that resolves to an with a BagelUser object
   * @see Docs {@link https://docs.bageldb.com/bagelAuth-api/#user-info}
   */
  async getUser(): Promise<AxiosResponse<BagelUser, any>> {
    try {
      const userIsActive = await this._bagelUserActive();
      if (!userIsActive) {
        throw new Error(
          'a Bagel User must be logged in to get Bagel User info ' +
            userIsActive,
        );
      }
      const url = `${AUTH_ENDPOINT}/user`;
      const res = await this.axios.get<BagelUser>(url);
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary
   * It takes an email address as a parameter, sends it to the backend, and returns
   * a promise
   * @param {string} email - The email address of the user requesting a password
   * reset.
   * @returns A promise that resolves to an AxiosPromise<unknown>
   */
  requestPasswordReset(email: string): AxiosPromise<unknown> {
    email = email.toLowerCase().trim();
    return new Promise((resolve, reject) => {
      const url = `${AUTH_ENDPOINT}/user/resetpassword`;
      const body = { email };
      this.axios
        .post(url, body)
        .then((res) => {
          if (res?.status == 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @summary
   * This function updates the password of a user with the given email address
   * @NOTE ⚠️ **_Using this function in the browser will throw an error_**
   * @example
   * db.users().updatePassword("test@gmail.com", "NewPasswordThatShouldBeStrong")
   * @param {string} email - The email of the user you want to update the password for.
   * @param {string} updatedPassword - The new password that you want to set for the user.
   * @returns {AxiosPromise<unknown>} A promise
   */
  updatePassword(
    email: string,
    updatedPassword: string,
  ): AxiosPromise<unknown> {
    email = email.toLowerCase().trim();
    return new Promise((resolve, reject) => {
      if (this._isBrowser()) {
        reject(
          new Error(
            'Update Password feature is only available when using NodeJS',
          ),
        );
        return;
      }
      const url = `${AUTH_ENDPOINT}/user/updatePassword`;
      const body = { email: email, password: updatedPassword };
      this.axios
        .post(url, body)
        .then((res) => {
          if (res?.status == 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @private
   * @summary
   * It stores the user ID in the bagel storage
   * @param {string} userID - The user ID of the user that you want to store.
   */
  async _storeBagelUser(userID: string): Promise<void> {
    await this.bagelStorage.setItem('bagel-user', userID);
  }

  /**
   * @private
   * It stores the access token, refresh token, and expiration time in the bagel storage
   * @param {Record<string, any>} data
   */
  async _storeTokens(data: Record<string, any>): Promise<void> {
    if (data?.access_token) {
      await this.bagelStorage.setItem('bagel-access', data.access_token);

      if (!data?.user_id) {
        const token = getParsedJwt(data.access_token);
        if (token)
          await this.bagelStorage.setItem(
            'bagel-user',
            `${token?.bagelUserID || ''}`,
          );
      }
    }

    if (data?.expires_in)
      await this.bagelStorage.setItem(
        'bagel-expires',
        `${getExpires(data.expires_in)}`,
      );

    if (data?.refresh_token)
      await this.bagelStorage.setItem('bagel-refresh', data.refresh_token);
  }

  /**
   * @summary
   * It gets the bagel user ID from the bagel storage.
   * @example
   * db.users().getBagelUserID()
   * @returns The bagelUserID
   */
  async getBagelUserID(): Promise<string | null> {
    try {
      const bagelUser = await this.bagelStorage.getItem<string>('bagel-user');
      return bagelUser;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @private
   * @summary
   * It gets the refresh token from the storage
   * @returns A promise that resolves to a string or null.
   */
  async _getRefreshToken(): Promise<string | null> {
    const refreshToken = await this.bagelStorage.getItem<string>(
      'bagel-refresh',
    );
    return refreshToken;
  }

  /**
   * @private
   * @summary
   * If the access token is expired, refresh it. Otherwise, return the access token
   * @returns A promise that resolves to a string or null or an axios promise that resolves to a string.
   */
  async _getAccessToken(): Promise<string | null | AxiosPromise<string>> {
    const storedExp = Number(
      (await this.bagelStorage.getItem('bagel-expires')) || 0,
    );
    if (!storedExp) return this.refresh();
    const now = new Date(storedExp);

    // ? check if the access token is expired
    if (now.setSeconds(now.getSeconds()) > storedExp) return this.refresh();
    else return this.bagelStorage.getItem('bagel-access');
  }

  /**
   * @summary
   * It removes the user, access, and refresh tokens from bagel storage
   * @example
   * db.users().logout()
   */
  async logout(): Promise<void> {
    await this.bagelStorage.removeItem('bagel-user');
    await this.bagelStorage.removeItem('bagel-access');
    await this.bagelStorage.removeItem('bagel-refresh');
    await this.bagelStorage.removeItem('bagel-expires');
    await this.bagelStorage.removeItem('bagel-nonce');
  }

  /**
   * It gets the refresh token from the local storage, and if it exists, it sends a
   * POST request to the server with the refresh token and the client id. If the
   * server responds with a 200 status code, it stores the new access token and
   * refresh token in the local storage and returns the access token
   * @example
   * db.users().refresh()
   * @returns {string} The access token.
   */
  async refresh() {
    try {
      const refreshToken = await this._getRefreshToken();
      if (!refreshToken) {
        throw new Error('No Bagel User is logged in');
      }

      const url = `${AUTH_ENDPOINT}/user/token`;
      const form = new globalThis.FormData();

      form.append('grant_type', 'refresh_token');
      form.append('refresh_token', refreshToken);
      form.append('client_id', 'project-client');

      if (isReactNative) {
        //   //? react-native
        const res = await this.instance.axiosInstance.post(url, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: () => form,
        });

        if (res?.status === 200) {
          const { data } = res;
          await this._storeTokens(data);
          return data.access_token;
        }
      }

      let formHeaders: FormData.Headers | undefined;
      if (isNode()) formHeaders = (form as unknown as FormData)?.getHeaders?.();

      const res = await this.axios.post(url, form, {
        headers: formHeaders,
      });

      if (res?.status === 200) {
        const { data } = res;
        await this._storeTokens(data);
        return data.access_token;
      }
    } catch (err) {
      throw err;
    }
  }
}
