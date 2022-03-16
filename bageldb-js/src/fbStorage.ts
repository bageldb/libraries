 import {isUndefined, without, keys, size, includes} from 'lodash-es';

 export default class FallbackStorage {
    key: (index: any) => any
    setItem: (key: any, value: any) => void
    getItem: (key: any) => any
    removeItem: (key: any) => void
    clear: () => void
    length: number
    __protected: () => { data: any; }

 constructor (data) {

     let storage = this;

     if (!data) data = {};

     let keylist = keys(data);

     let nullOrValue = function(value) {
       return isUndefined(value) ? null : value;
     };

     this.key = function(index) {
         let key = keylist[index];
         return nullOrValue(key);
     };

     this.setItem = function(key, value) {
         if (!includes(keylist, key)) keylist.push(key);
         data[ key ] = value;
         storage.length = size( data );
     };

     this.getItem = function(key) {
         let value = data[ key ];
         return nullOrValue(value);
     };

     this.removeItem = function(key) {
       delete data [ key ];
       keylist = without( keylist, key );
       storage.length = size( data );
     };

     this.clear = function() {
         let _keys = keys( data );
         let remove = this.removeItem;
         _keys.forEach(function(key) {
             remove(key);
         });
     };

     this.length = size( data );

     this.__protected = function() {
         return {
             data
         };
     };

    }
 };


