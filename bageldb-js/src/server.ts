import BagelDB from './index';

import BagelDBRequest from './bagelDBRequest';
import BagelUsersRequest from './users';


import FormData from 'form-data';

if (!globalThis?.FormData) (globalThis as any).FormData = FormData;

export { BagelUsersRequest, BagelDBRequest, BagelDB };
export default BagelDB;
