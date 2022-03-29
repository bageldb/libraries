import BagelDB from './index';
import { BagelDBRequest, BagelMetaRequest, BagelUsersRequest } from './common';
import FallbackStorage from './fbStorage';

if (!globalThis?.localStorage)  globalThis.localStorage = new FallbackStorage({});

export { BagelUsersRequest, BagelDBRequest, BagelMetaRequest, BagelDB };
export default BagelDB;
