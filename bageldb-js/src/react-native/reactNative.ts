import BagelDB from '../index';
import { BagelDBRequest, BagelMetaRequest, BagelUsersRequest } from '../common';
import FallbackStorage from '../fbStorage';
import FormData from 'form-data';

if (!globalThis?.localStorage) {
  globalThis.localStorage = new FallbackStorage({});
}
if (!globalThis?.FormData) {
  (globalThis as any).FormData = FormData;
}
console.log('running in react native!!');

export { BagelUsersRequest, BagelDBRequest, BagelMetaRequest, BagelDB };
export default BagelDB;
