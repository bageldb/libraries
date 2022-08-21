// import { isUndefined, without, keys, size, includes } from 'lodash';
import isUndefined from 'lodash/isUndefined';
import without from 'lodash/without';
import keys from 'lodash/keys';
import size from 'lodash/size';
import includes from 'lodash/includes';

export default class FallbackStorage {
  key: (index: any) => any;

  setItem: (key: any, value: any) => void;

  getItem: (key: any) => any;

  removeItem: (key: any) => void;

  clear: () => void;

  length: number;

  __protected: () => { data: any };

  constructor(data: Record<string, any>) {
    // const storage = this;

    if (!data) data = {};

    let keylist = keys(data);

    const nullOrValue = function (value: unknown): null | unknown {
      return isUndefined(value) ? null : value;
    };

    this.key = function (index) {
      const key = keylist[index];
      return nullOrValue(key);
    };

    this.setItem = function (key, value) {
      if (!includes(keylist, key)) keylist.push(key);
      data[key] = value;
      this.length = size(data);
    };

    this.getItem = function (key) {
      const value = data[key];
      return nullOrValue(value);
    };

    this.removeItem = function (key) {
      delete data[key];
      keylist = without(keylist, key);
      this.length = size(data);
    };

    this.clear = function () {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const _keys = keys(data);
      const remove = this.removeItem;
      _keys.forEach(function (key) {
        remove(key);
      });
    };

    this.length = size(data);

    this.__protected = function () {
      return {
        data,
      };
    };
  }
}
