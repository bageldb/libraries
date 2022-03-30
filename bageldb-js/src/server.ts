import BagelDB from './index';

import BagelDBRequest from './bagelDBRequest';
import BagelMetaRequest from './bagelMetaRequest';
import BagelUsersRequest from './users';
// globalThis.EventSource = require('eventsource');
import EventSource from 'eventsource';
globalThis.EventSource =
  EventSource as unknown as typeof globalThis.EventSource;

import FallbackStorage from './fbStorage';
import FormData from 'form-data';

if (!globalThis?.localStorage) globalThis.localStorage = new FallbackStorage({});

if (!globalThis?.FormData) (globalThis as any).FormData = FormData;


export { BagelUsersRequest, BagelDBRequest, BagelMetaRequest, BagelDB };
export default BagelDB;
