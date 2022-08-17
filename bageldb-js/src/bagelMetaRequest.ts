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
   * @returns A Promise with the schema of the collection.
   * @see Docs {@link https://docs.bageldb.com/meta-api/#get-schema}
   */
  async get() {
    try {
      const url = `${this.baseEndpoint}/collection/${this.collectionID}/schema`;

      const res = await this.axiosInstance.get(url);
      return res;

    } catch (error) {
      throw new Error(JSON.stringify({ error }, null, 2));

    }
  }
}
