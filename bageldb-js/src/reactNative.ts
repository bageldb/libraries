import BagelDB from './index';
import { BagelDBRequest, BagelMetaRequest, BagelUsersRequest } from './common';
import FallbackStorage from './fbStorage';
const formData = require('form-data');

if (!globalThis?.localStorage)  globalThis.localStorage = new FallbackStorage({});

globalThis.BagelFormData = formData;

export { BagelUsersRequest, BagelDBRequest, BagelMetaRequest, BagelDB };
export default BagelDB;
