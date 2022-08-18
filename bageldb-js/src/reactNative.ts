import BagelDB from './index';
import BagelDBRequest from './bagelDBRequest';

import BagelUsersRequest from './users';
import FallbackStorage from './fbStorage';

if (!globalThis?.localStorage)
  globalThis.localStorage = new FallbackStorage({});

export { BagelUsersRequest, BagelDBRequest, BagelDB };
export default BagelDB;
