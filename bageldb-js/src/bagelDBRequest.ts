import type { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';
import type FormData from 'form-data';
import { axios, liveEndpoint, isNode, isReactNative } from './common';
import type {
  bagelType,
  fileUploadArgs,
  BagelGeoPointQuery,
  structArgs, /* Exporting the type Filter
  from the mongodb module. */
} from './interfaces';

import type {
  Document as mongoDoc,
  // RootFilterOperators,
  // FilterOperators,
  Filter,
  // FilterOperations,
} from 'mongodb/mongodb';

export default class BagelDBRequest {
  instance: bagelType;

  collectionID: string;

  _pageNumber: number | string;

  itemsPerPage: number | string;

  callEverything: boolean;

  _query: any[];

  nestedCollectionsIDs: any[];

  axiosInstance: AxiosInstance;

  apiToken: string;

  _projectOn: string;

  _projectOff: string;

  requestID: string;

  client!: EventSource;

  _item: string | undefined;

  _field: string | undefined;

  sortField: string;

  sortOrder: string;

  [x: string]: any;

  constructor({ instance, collectionID }: structArgs) {
    this.instance = instance;
    this.collectionID = collectionID;
    this._pageNumber = 1;
    this.itemsPerPage = 100;
    this.callEverything = false;
    this._query = [];
    this.nestedCollectionsIDs = [];
    this.axiosInstance = axios.create();
    this.apiToken = instance.apiToken;
    this._projectOn = '';
    this._projectOff = '';
    this.requestID = '';
    this.sortField = '';
    this.sortOrder = '';
    this._rawMongoQuery = undefined;
    // this.client;
    this._item = undefined;
    this._field = undefined;
  }

  /**
   *@summary
   * The function takes in a query object and adds it to the query chain.
   * @example
   * db.collection('posts').find({
   *    "authorName": "John",
   *    "dateField": "Date(2022-02-22)",
   *    "nestedCollection": {
   *     "$elemMatch": {
   *        "nestedField": "nestedValue"
   *      }
   *    }
   * }).get()
   * @param mongoQueryObj
   * @returns class instance
   */
  find<TSchema extends mongoDoc>(
    mongoQueryObj: Filter<TSchema | Filter<TSchema>> & Record<string, any>,
    // | FilterOperations<TSchema>
    // | FilterOperators<TSchema>
    // | RootFilterOperators<TSchema>,
  ) {
    this._rawMongoQuery = JSON.stringify(mongoQueryObj);
    return this;
  }

  // Pagination
  /**
   * @summary
   * Use built in pagination, you can set the number of items {@link perPage|per page} and the page you would like to retreive.
   * It sets the page number to the value passed in.
   * @param {number | string} pageNumber - The page number to retrieve. (@default value is 1)
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/#pagination}
   */
  pageNumber(pageNumber: number | string) {
    this._pageNumber = `${pageNumber}`;
    return this;
  }

  /**
   * @summary
   * Use built in pagination, you can set the number of items per page and the page you would like to retreive using {@link pageNumber|pageNumber}.
   *
   * It takes a number or a string, converts it to a string, and returns the
   * current instance of the class
   * @param {number | string} perPage - The number of items to return per page (@default value is 100).
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/#pagination}
   */
  perPage(perPage: number | string) {
    this.itemsPerPage = `${perPage}`;
    return this;
  }

  /**
   * This function is used to retrieve all data from a collection.
   * @returns Bagel class instance
   * @todo Add to the documentation.
   */
  everything() {
    this.callEverything = true;
    return this;
  }

  /**
   * @summary
   * Get a Collection
   *
   * For a nested collection, item(itemsID) and collection(collectionID) can be chained till the correct collection and item is reached
   * @param {string} collectionSlug - The slug of the collection you want to nest.
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/#get-collection}
   */
  collection(collectionSlug: string) {
    this.nestedCollectionsIDs.push(collectionSlug);
    return this;
  }

  /**
   * @summary
   * The function takes in an item id/slug as a string, and if the id is valid, it will add
   * it to the query chain.
   * @param {string} _id - string
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/#get-a-single-item}
   */
  item(_id: string) {
    if (!_id)
      throw new Error(`
      item id must be defined as a non-empty string value.
      The item you provided is currently set to: '${_id}', with type: '${typeof _id}'
       `);
    if (this._item) {
      if (this.nestedCollectionsIDs.length % 2 === 0)
        throw new Error(
          'a nested item can only be placed after a nested collection',
        );
      this.nestedCollectionsIDs.push(_id);
    } else {
      this._item = _id;
    }
    return this;
  }

  /**
   * @summary
   * "This function adds a query to the query array."
   *
   * The first thing we do is check if the key is empty. If it is, we return the
   * current instance of the class for chaining.
   * @param {string} key - The key to query on.
   * @param {'=' | '!=' | '>' | '<' | 'regex' | 'within'} operator  - '=' | '!=' |'>' | '<' | 'regex' | 'within'
   * @param {string | string[] | BagelGeoPointQuery} value - string | string[] | BagelGeoPointQuery
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/#querying}
   */
  query(
    key: string,
    operator: '=' | '!=' | '>' | '<' | 'regex' | 'within',
    value: string | string[] | BagelGeoPointQuery | boolean,
  ) {
    if (!key) return this;
    if (Array.isArray(value)) value = value.join(',');
    const query = key + ':' + operator + ':' + value;
    this._query.push(encodeURIComponent(query));
    return this;
  }

  /**
   * Sort the data by the given field and order, and return the query object.
   * @param {string} field - The field to sort by.
   * @param {'asc' | 'desc'} order - 'asc' | 'desc'
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/rest/#query-params}
   */
  sort(field: string, order: 'asc' | 'desc') {
    this.sortField = field;
    this.sortOrder = order || '';
    return this;
  }

  /**
   * @summary It is possible to project on and project off for all fields in an item, enabling you to retrieve only exactly what is required in the response body
   *
   * It is not possible to mix both {@link projectOn|projectOn} and {@link projectOff|projectOff}.
   *
   * Metadata field will always be retrieved unless explicitly projectedOff i.e _id, _lastUpdateDate and _createdDate
   *
   * @NOTE ⚠️ **_that nested collection fields in a collection will only be returned if projected on_**
   * @param {string} slugs - string - A comma separated list of slugs to project
   * on.
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/#projection}
   */
  projectOn(slugs: string) {
    this._projectOn = slugs;
    return this;
  }

  /**
   * @summary It is possible to project on and project off for all fields in an item, enabling you to retrieve only exactly what is required in the response body
   *
   * It is not possible to mix both {@link projectOn|projectOn} and {@link projectOff|projectOff}.
   *
   * Metadata field will always be retrieved unless explicitly projectedOff i.e _id, _lastUpdateDate and _createdDate
   *
   * @NOTE ⚠️ **_nested collection fields in a collection will only be returned if projected on_**
   * @param {string} slugs - A comma separated list of slugs you want to remove from the projection.
   * @returns Bagel class instance
   * @see Docs {@link https://docs.bageldb.com/content-api/#projection}
   */
  projectOff(slugs: string) {
    this._projectOff = slugs;
    return this;
  }

  /**
   * selectedImage expects a file stream i.e fs.createReadStream(filename) OR a blob
   * imageLink can be a link to a file stored somewhere on the web
   * The method checks if imageLink exists and if not will use selectedImage
   * The request is sent via a FormData request.
   * @param {string} imageSlug - The field's slug of the image you want to upload.
   * @param {fileUploadArgs} Object - { selectedImage, imageLink, altText, fileName }
   * @NOTE ⚠️ **_Either imageLink or imageFile must be included but not both_**
   *
   * @returns The response from the server.
   * @see Docs {@link https://docs.bageldb.com/content-api/#uploading-asset}
   */
  async uploadImage(
    imageSlug: string,
    { selectedImage, imageLink, altText, fileName }: fileUploadArgs,
  ): Promise<AxiosResponse<any, any>> {
    const form = new globalThis.FormData();
    const nestedID = this.nestedCollectionsIDs.join('.');

    if (altText) form.append('altText', altText);

    if (imageLink) {
      form.append('imageLink', imageLink);
    } else {
      form.append(
        'imageFile',
        selectedImage,
        isReactNative ? undefined : fileName,
      );
    }

    const url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/image?imageSlug=${imageSlug}&nestedID=${nestedID}`;
    if (isReactNative) {
      //   //? react-native
      const res = await this.instance.axiosInstance.put(url, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: () => form,
      });
      return res;
    }
    let formHeaders: FormData.Headers | undefined;

    if (isNode()) formHeaders = (form as unknown as FormData)?.getHeaders?.();

    const res = await this.instance.axiosInstance.put(url, form, {
      headers: formHeaders,
    });
    return res;
  }

  /**
   * It deletes an item from a collection
   * @NOTE ⚠️ **_this action is irreversible_**
   * @returns A promise that resolves to the response from the server.
   * @see Docs {@link https://docs.bageldb.com/content-api/#delete-item}
   */
  delete() {
    const nestedID = this.nestedCollectionsIDs.join('.');
    let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}`;
    if (nestedID) url = url + `?nestedID=${nestedID}`;
    return new Promise((resolve, reject) => {
      this.instance.axiosInstance
        .delete(url)
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  /**
   * @summary
   * When creating an item the _id will be set for you by the server.
   *
   * If you require to set the _id of the item, use the set method.
   * @example
   * data = { name: 'John' }
   * db.collection('COLLECTION_SLUG').item('YOUR_CUSTOM_ITEM_ID').set(data);
   * @param {object} data - The data you want to set when creating the item.
   * @returns A promise that resolves to the response from the server.
   * @see Docs {@link https://docs.bageldb.com/content-api/#set-item-id}
   */
  set(data: Record<string, any>): AxiosPromise {
    const nestedID = this.nestedCollectionsIDs.join('.');
    let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}?set=true`;
    if (nestedID) url = url + `&nestedID=${nestedID}`;
    return new Promise((resolve, reject) => {
      this.instance.axiosInstance
        .put(url, JSON.stringify(data))
        .then(async (res) => {
          resolve(res);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * @summary
   * Takes a data object, and updates the item with the new data.
   * @example
   * data = { name: 'Jane' }
   * db.collection('COLLECTION_SLUG').item('ITEM_ID').put(data);
   * @param {object} data - an object with the data you want to update
   * @returns A promise that resolves to the response from the server.
   * @see Docs {@link https://docs.bageldb.com/content-api/#update-item}
   */
  put(data: Record<string, any>): AxiosPromise {
    const nestedID = this.nestedCollectionsIDs.join('.');
    let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}`;
    if (nestedID) url = url + `?nestedID=${nestedID}`;
    return new Promise((resolve, reject) => {
      this.instance.axiosInstance
        .put(url, JSON.stringify(data))
        .then(async (res) => {
          resolve(res);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * @summary
   * It takes a data object, creates an item with the data and adds it to the collection.
   * @example
   * data = { name: 'John' }
   * db.collection('COLLECTION_SLUG').item('YOUR_CUSTOM_ITEM_ID').post(data);
   * @param {object} data - an object with the data you want to add to the newly created item
   * @returns A promise that resolves to the response from the API.
   * @see Docs {@link https://docs.bageldb.com/content-api/#create-item}
   */
  post(data: Record<string, any>): AxiosPromise {
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items`;
      if (nestedID) url = url + `/${this._item}?nestedID=${nestedID}`;
      this.instance.axiosInstance
        .post(url, data)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @summary
   * Appends an item to a field that is of type "Item Reference"
   * @example
   * db.collection('COLLECTION_SLUG').item('ITEM_ID').append('FIELD_SLUG', 'ITEM_REF_ID');
   * @param {string} fieldSlug - The slug of the field you want to append to.
   * @param {string} ItemRefID - The ID of the item you want to append to the
   * field.
   * @returns A promise that resolves to the response from the API.
   * @see Docs {@link https://docs.bageldb.com/content-api/#update-reference-field}
   */
  append(fieldSlug: string, ItemRefID: string): AxiosPromise {
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/field/${fieldSlug}`;
      if (nestedID) url = url + `?nestedID=${nestedID}`;
      this.instance.axiosInstance
        .put(url, { value: ItemRefID })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @summary
   * Removes a reference from a field that is of type "Item Reference"
   * @example
   * db.collection('COLLECTION_SLUG').item('ITEM_ID').unset('FIELD_SLUG', 'ITEM_REF_ID');
   * @param {string} fieldSlug - The slug of the field you want to unset.
   * @param {string} ItemRefID - The ID of the item you want to unset.
   * @returns The promise is being returned.
   * @see Docs {@link https://docs.bageldb.com/content-api/#update-reference-field}
   */
  unset(fieldSlug: string, ItemRefID: string): AxiosPromise {
    const nestedID = this.nestedCollectionsIDs.join('.');
    if (nestedID)
      throw new Error('Unset is not yet supported in nested collections');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/field/${fieldSlug}`;
      if (nestedID) url = url + `?nestedID=${nestedID}`;
      this.instance.axiosInstance
        .delete(url, { data: { value: ItemRefID } })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  field(fieldSlug: string) {
    if (!fieldSlug || fieldSlug.match(/\s/))
      throw new Error(`field slug can't be ${fieldSlug}`);
    this._field = fieldSlug;
    return this;
  }

  increment(incrementValue: string | number): AxiosPromise {
    if (!this._field)
      throw new Error('field must be set to use the increment method');
    if (typeof incrementValue === 'string' && isNaN(parseFloat(incrementValue)))
      throw new Error('Increment value must be a number');
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/field/${this._field}?increment=${incrementValue}`;
      if (nestedID) url = url + `&nestedID=${nestedID}`;
      this.instance.axiosInstance
        .put(url)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  decrement(decrementValue: string | number): AxiosPromise {
    if (!this._field)
      throw new Error('field must be set to use the decrement method');
    if (typeof decrementValue == 'string')
      decrementValue = parseFloat(decrementValue);
    if (isNaN(decrementValue))
      throw new Error('Increment value must be a number');
    if (decrementValue > 0) decrementValue = decrementValue * -1;
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/field/${this._field}?increment=${decrementValue}`;
      if (nestedID) url = url + `&nestedID=${nestedID}`;
      this.instance.axiosInstance
        .put(url)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  value(fieldSlug: string, value: unknown): AxiosPromise {
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/field/${fieldSlug}`;
      if (nestedID) url = url + `?nestedID=${nestedID}`;
      this.instance.axiosInstance
        .delete(url, { data: { value } })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getCount() {
    try {
      this._pageNumber = 1;
      this.itemsPerPage = '0';
      const res = await this.get();
      return res.headers['item-count'];
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary
   * Depending on how the {@link collection|collection()} and {@link item|item()} methods were chained together.
   * Retrieves either the collection or a specific item from the collection.
   * @example
   * db.collection('COLLECTION_SLUG').get();
   * @example
   * db.collection('COLLECTION_SLUG').item('ITEM_ID').get();
   * @returns A promise that resolves to an AxiosResponse object.
   * @see Docs {@link https://docs.bageldb.com/content-api/#get-collection}
   * @see Docs {@link https://docs.bageldb.com/content-api/#get-a-single-item}
   */
  get() {
    // try {

    const params = new URLSearchParams();
    const nestedID = this.nestedCollectionsIDs.join('.');

    if (this._pageNumber) params.append('pageNumber', `${this._pageNumber}`);

    if (this.sortField) params.append('sort', this.sortField);

    if (this.sortOrder) params.append('order', this.sortOrder);

    if (this.itemsPerPage) params.append('perPage', `${this.itemsPerPage}`);

    if (this.callEverything)
      params.append('everything', `${this.callEverything}`);

    if (this._projectOff != '') params.append('projectOff', this._projectOff);

    if (this._projectOn != '') params.append('projectOn', this._projectOn);
    if (this._rawMongoQuery) params.append('find', this._rawMongoQuery);

    const itemID = this._item ? '/' + this._item : '';

    let url = `${this.instance.baseEndpoint}/collection/${
      this.collectionID
    }/items${itemID}?${params.toString()}`;
    if (this._query.length > 0) url = url + '&query=' + this._query.join('%2B');
    if (nestedID) url = url + `&nestedID=${nestedID}`;
    return this.instance.axiosInstance.get(url);
  }

  /**
   * @summary
   * View the bagelAuth users associated with an item.
   * @example
   * db.collection('COLLECTION_SLUG').item('ITEM_ID').users();
   * @returns {AxiosPromise} An array of bagelAuth users.
   * @example Response: [{ "userID": "213-3213c-123c123-1232133" }]
   * @see Docs {@link https://docs.bageldb.com/content-api/#view-bagel-users}
   */
  users(): AxiosPromise {
    if (!this._item) {
      throw new Error('Users can only be retrieved in relation to an item');
    }
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/bagelUsers`;
      if (nestedID) url = url + `?nestedID=${nestedID}`;
      this.instance.axiosInstance
        .get(url)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @summary
   * This function adds a user to the associated bagelUsers item's array
   * @NOTE ⚠️ **_In order to add a Bagel user - the api token must have User Admin permissions, it is suggested to only use this token server side_**
   * @example
   * db.collection('COLLECTION_SLUG').item('ITEM_ID').addUser('USER_ID');
   * @param {string} bagelUserID - The ID of the user you want to add to the item.
   * @returns A promise that resolves to the response from the server.
   * @see Docs {@link https://docs.bageldb.com/content-api/#add-a-bagel-user}
   */
  addUser(bagelUserID: string): AxiosPromise {
    if (!this._item) {
      throw new Error('Users can only be added in relation to an item');
    }
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/bagelUsers`;
      if (nestedID) url = url + `?nestedID=${nestedID}`;
      this.instance.axiosInstance
        .put(url, { userID: bagelUserID })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @summary
   * This function removes a user to the associated bagelUsers item's array
   * @NOTE ⚠️ **_In order to remove a Bagel user - the api token must have User Admin permissions, it is suggested to only use this token server side_**
   * @example
   * db.collection('COLLECTION_SLUG').item('ITEM_ID').addUser('USER_ID');
   * @param {string} bagelUserID - The ID of the user you want to remove from the item.
   * @returns A promise that resolves to the response from the server.
   * @see Docs {@link hhttps://docs.bageldb.com/content-api/#remove-a-bagel-user}
   */
  removeUser(bagelUserID: string): AxiosPromise {
    if (!this._item) {
      throw new Error('Users can only be removed in relation to an item');
    }
    const nestedID = this.nestedCollectionsIDs.join('.');
    return new Promise((resolve, reject) => {
      let url = `${this.instance.baseEndpoint}/collection/${this.collectionID}/items/${this._item}/bagelUsers`;
      if (nestedID) url = url + `?nestedID=${nestedID}`;
      this.instance.axiosInstance
        .delete(url, { data: { userID: bagelUserID } })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * @summary
   * It creates a new EventSource object, which is a Web API that allows you to listen to server-sent events
   * @param onmessage - A function that is called when a message is received.
   * @param onerror - A function that is called when an error occurs.
   * @returns {Promise<EventSource>} The client
   * @NOTE
   * Client is returned. It must be closed when it is no longer required using client.close()
   * onmessage and onerror are callback functions to process the data
   * see https://developer.mozilla.org/en-US/docs/Web/API/EventSource for more info on Server Side Events (SSE)
   */
  async listen(
    onmessage: (...args: any) => unknown,
    onerror: (...args: any) => unknown,
  ) {
    if (!onmessage) {
      throw new Error('onMessage callback must be defined');
    }

    const eventSrc = globalThis.EventSource;

    let token: string | null | AxiosResponse<string, any>;
    if (await this.instance.users()._bagelUserActive())
      token = await this.instance.users()._getAccessToken();
    else token = await this.apiToken;

    const nestedID = this.nestedCollectionsIDs.join('.');

    const url =
      liveEndpoint +
      `/collection/${this.collectionID}/live?authorization=${token}&nestedID=${nestedID}&itemID=${this._item}`;
    this.client = new eventSrc(url);

    /**
     * If the client is closed, and the user is active, refresh the user, get the
     * access token, and create a new client
     * @param event - The event object that was passed to the event handler.
     * @returns The function errorHandler is being returned.
     */
    const errorHandler = async (event: Event) => {
      if (this.client.readyState === eventSrc.CLOSED) {
        if (await this.instance.users()._bagelUserActive()) {
          await this.instance.users().refresh();
          token = await this.instance.users()._getAccessToken();
          const liveUrl =
            liveEndpoint +
            `/collection/${this.collectionID}/live?authorization=${token}&requestID=${this.requestID}&nestedID=${nestedID}&itemID=${this._item}`;
          this.client = new eventSrc(liveUrl);
          return;
        }
      }
      if (onerror) {
        onerror(event);
      }
    };

    this.client.addEventListener('start', (e: Event & Record<string, any>) => {
      this.requestID = e.data;
    });

    this.client.addEventListener('stop', async () => {
      if (await this.instance.users()._bagelUserActive())
        token = await this.instance.users()._getAccessToken();
      else token = await this.apiToken;

      this.client.close();
      const liveUrl =
        liveEndpoint +
        `/collection/${this.collectionID}/live?authorization=${token}&requestID=${this.requestID}&nestedID=${nestedID}&itemID=${this._item}`;
      this.client = new EventSource(liveUrl);
      this.client.onmessage = onmessage;
      this.client.onerror = errorHandler;
    });

    this.client.onmessage = onmessage;
    this.client.onerror = errorHandler;
    return this.client;
  }
}
