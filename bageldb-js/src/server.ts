import BagelDB from './index';

import BagelDBRequest from './bagelDBRequest';
import BagelUsersRequest from './users';


import * as _FormData from 'form-data';

const FormData = _FormData.default;

if (!globalThis?.FormData) (globalThis as any).FormData = FormData;

export { BagelUsersRequest, BagelDBRequest, BagelDB };
export default BagelDB;
