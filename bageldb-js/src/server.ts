import BagelDB from './index';

import BagelDBRequest from './bagelDBRequest';
import BagelUsersRequest from './users';
// globalThis.EventSource = require('eventsource');
import EventSource from 'eventsource';
globalThis.EventSource =
  globalThis?.EventSource ||
  (EventSource as unknown as typeof globalThis.EventSource);

import FormData from 'form-data';

if (!globalThis?.FormData) (globalThis as any).FormData = FormData;

export { BagelUsersRequest, BagelDBRequest, BagelDB };
export default BagelDB;
