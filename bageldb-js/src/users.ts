
import { AxiosInstance, AxiosPromise } from "./common";
import { bagelType, BagelUser } from "./interfaces";
import FallbackStorage  from './fbStorage';


const AUTH_ENDPOINT = "https://auth.bageldb.com/api/public";

if (!globalThis?.localStorage) {
  globalThis.localStorage = new FallbackStorage({});
}

export default class BagelUsersRequest {
  instance: bagelType;
  axios: AxiosInstance;
  bagelStorage: Storage;
  [x: string]: any;

  constructor({ instance }: { instance: bagelType}) {
    this.instance = instance;
    this.axios = this.instance.axiosInstance;
    this.bagelStorage = this.instance?.customStorage || globalThis?.localStorage;
  }

  _isBrowser(): boolean {
    const isNode = new Function(
      "try {return this===global;}catch(e){return false;}"
      );

      return !isNode();
  }

  async _bagelUserActive(): Promise<boolean> {
    const isBrowser =  this._isBrowser();
   const bagelUserID = await this.getBagelUserID();
    return (
      isBrowser && bagelUserID !== null && bagelUserID.length > 0
    );
  }

  create(email: string, password: string): AxiosPromise<any> {
    email = email.toLowerCase().trim();
    return new Promise((resolve, reject) => {
      const url = `${AUTH_ENDPOINT}/user`;
      const body = { email, password };
      this.axios
        .post(url, body)
        .then(async (res) => {
          if (res.status == 201) {
            const { data } = res;
            if (this.instance.isServer) {
              resolve(data.user_id);
              return;
            }
            await this._storeTokens(data);
            await this._storeBagelUser(data.user_id);
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

  /// Validate the user's received One Time Password
  async validateOtp(otp: Record<string, any>) {
    const nonce = await this._getOtpRequestNonce();
    const url = `${AUTH_ENDPOINT}/user/otp/verify/${nonce}`;
    const body = { otp };
    try {
      const res = await this.axios.post(url, body);
      await this._storeTokens(res.data);
      return res.data["user_id"];
    } catch (err) {
      throw "wrong authorization code";
    }
  }

  async _getOtpRequestNonce() {
    const otpRequest = await this.bagelStorage.getItem("bagel-nonce");
    const expires = +(await this.bagelStorage.getItem("bagel-expires") || "");
    if (otpRequest && expires) {
      const date = new Date();
      if (expires <= date.setSeconds(date.getSeconds()))
        throw "OTP request has expired, try again";
      return otpRequest;
    } else {
      throw "Request an OTP first";
    }
  }

  async requestOtp(emailOrPhone: string) {
    emailOrPhone = emailOrPhone.toLowerCase().trim();
    const url = `${AUTH_ENDPOINT}/user/otp`;
    const body = { emailOrPhone: emailOrPhone };
    try {
      const res = await this.axios.post(url, body);
      await this._storeOtpRequestNonce(res.data);
      return res.data["nonce"];
    } catch (error) {
      return error;
    }
  }

  async _storeOtpRequestNonce({
    nonce,
    expires_in,
  }: {
    nonce: string;
    expires_in: number;
  }) {
    const expires = new Date();
    const storedExpire = `${expires.setSeconds(
      expires.getSeconds() + expires_in
    )}`;
   await this.bagelStorage.setItem("bagel-nonce", nonce);
   await this.bagelStorage.setItem("bagel-expires", storedExpire);
  }

  validate(email: string, password: string): AxiosPromise<any> {
    email = email.toLowerCase().trim();
    return new Promise((resolve, reject) => {
      const url = `${AUTH_ENDPOINT}/user/verify`;
      const body = { email, password };
      this.axios
        .post(url, body)
        .then(async (res) => {
          if (res.status == 200) {
            const { data } = res;
            await this._storeTokens(data);
            await this._storeBagelUser(data.user_id);
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

  getUser(): AxiosPromise<BagelUser> {
    return new Promise(async (resolve, reject) => {
      if (!(await this._bagelUserActive())) {
        reject(
          new Error("a Bagel User must be logged in to get Bagel User info"+(await this._bagelUserActive()))
        );
        return;
      }
      const url = `${AUTH_ENDPOINT}/user`;
      this.axios
        .get(url)
        .then((res) => {
          if (res.status == 200) {
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

  requestPasswordReset(email: string): AxiosPromise<unknown> {
    email = email.toLowerCase().trim();
    return new Promise((resolve, reject) => {
      const url = `${AUTH_ENDPOINT}/user/resetpassword`;
      const body = { email };
      this.axios
        .post(url, body)
        .then((res) => {
          if (res.status == 200) {
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

  updatePassword(email: string, updatedPassword: string): AxiosPromise<unknown> {
    email = email.toLowerCase().trim();
    return new Promise((resolve, reject) => {
      if (this._isBrowser()) {
        reject(
          new Error(
            "Update Password feature is only available when using NodeJS"
          )
        );
        return;
      }
      const url = `${AUTH_ENDPOINT}/user/updatePassword`;
      const body = { email: email, password: updatedPassword };
      this.axios
        .post(url, body)
        .then((res) => {
          if (res.status == 200) {
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

  async _storeBagelUser(userID: string): Promise<void> {
   await this.bagelStorage.setItem("bagel-user", userID);
  }

  async _storeTokens(data: Record<string, any>): Promise<void> {
   await this.bagelStorage.setItem("bagel-access", data.access_token);
    const expires: any = new Date();
    expires.setSeconds(expires.getSeconds() + data.expires_in);
   await this.bagelStorage.setItem("bagel-expires", expires);
   await this.bagelStorage.setItem("bagel-refresh", data.refresh_token);
  }

  async getBagelUserID(){
    return await this.bagelStorage.getItem("bagel-user") as string;
  }

  async _getRefreshToken(): Promise<string | null> {
    return await this.bagelStorage.getItem("bagel-refresh");
  }

  async _getAccessToken(): Promise<string | null | AxiosPromise<string>> {
    const e = await this.bagelStorage.getItem("bagel-expires") || "";
    const expires = new Date(e);
    if (expires <= new Date()) return this.refresh();
    else return await this.bagelStorage.getItem("bagel-access");
  }

  async logout(): Promise<void> {
   await this.bagelStorage.removeItem("bagel-user");
   await this.bagelStorage.removeItem("bagel-access");
   await this.bagelStorage.removeItem("bagel-refresh");
  }

  refresh(): AxiosPromise<string> {
    return new Promise(async (resolve, reject) => {
      if (!(await this._getRefreshToken())) {
        reject(new Error("No Bagel User is logged in"));
        return;
      }
      const url = `${AUTH_ENDPOINT}/user/token`;
      const body = `grant_type=refresh_token&refresh_token=${await this._getRefreshToken()}&client_id=project-client`;
      this.axios
        .post(url, body)
        .then(async (res) => {
          if (res.status === 200) {
            const { data } = res;
            await this._storeTokens(data);
            resolve(data.access_token);
          } else {
            reject(res);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
