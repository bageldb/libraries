import { AxiosPromise } from 'axios';
import { baseEndpoint } from './common';
import BagelDBRequest from './bagelDBRequest';
import { structArgs } from './interfaces';
export default class BagelMetaRequest extends BagelDBRequest {
  constructor({ instance, collectionID }: structArgs) {
    super({ instance, collectionID });
  }

  /**
   * @summary
   * Retrieve the schema of a collection.
   * This enables implementing things like dynamic forms or other dynamic pages, which rely on the schema to display different page components.
   * Schema will be retrieved for the parent collection, and will contain the schema for all nested collections inside the parent collection.
   * @example Request:
   * const {data: schema} = await db.schema("chat").get();
   * @returns {AxiosPromise} A Promise with the schema of the collection.
   * @see Docs {@link https://docs.bageldb.com/meta-api/#get-schema}
   */
  get(): AxiosPromise {
    return new Promise((resolve, reject) => {
      const url = `${baseEndpoint}/collection/${this.collectionID}/schema`;
      this.instance.axiosInstance
        .get(url)
        .then((res) => {
          if (res?.status >= 200 && res?.status < 400) {
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
