const isUndefined = (value: unknown): boolean  => typeof value === 'undefined';

const without = <T>(array: T[], ...values: T[]): T[]  => array.filter((item) => !values.includes(item));

const keys = (object: Record<string, any>): string[]  => Object.keys(object);

const size = (collection: Record<string, any> | any[]): number  => collection.length;

const includes = (collection: Record<string, any> | any[], value: any): boolean  => collection.includes(value);

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
