import { AxiosPromise } from 'axios';
import { baseEndpoint } from './common';
import { BagelDBRequest } from './common';
import { structArgs } from './interfaces';
export default class BagelMetaRequest extends BagelDBRequest {
  constructor({ instance, collectionID }: structArgs) {
    super({ instance, collectionID });
  }

  get(): AxiosPromise {
    return new Promise((resolve, reject) => {
      const url = `${baseEndpoint}/collection/${this.collectionID}/schema`;
      this.instance.axiosInstance
        .get(url)
        .then((res) => {
          if (res.status >= 200 && res.status < 400) {
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
}
