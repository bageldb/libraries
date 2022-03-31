import BagelDB from './index';
import BagelDBRequest from './bagelDBRequest';
import BagelMetaRequest from './bagelMetaRequest';
import BagelUsersRequest from './users';
import FallbackStorage from './fbStorage';
console.log('hey, this is REACT-NATIVE!!');

if (!globalThis?.localStorage)  globalThis.localStorage = new FallbackStorage({});

export { BagelUsersRequest, BagelDBRequest, BagelMetaRequest, BagelDB };
export default BagelDB;
