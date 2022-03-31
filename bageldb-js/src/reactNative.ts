import BagelDB from './index';
import BagelDBRequest from './bagelDBRequest';
import BagelMetaRequest from './bagelMetaRequest';
import BagelUsersRequest from './users';
import FallbackStorage from './fbStorage';

if (!globalThis?.localStorage)  globalThis.localStorage = new FallbackStorage({});

export { BagelUsersRequest, BagelDBRequest, BagelMetaRequest, BagelDB };
export default BagelDB;
