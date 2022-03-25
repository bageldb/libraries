import BagelDB from '../index';
import { BagelDBRequest, BagelMetaRequest, BagelUsersRequest } from '../common';
// globalThis.EventSource = require('eventsource');
import EventSource from 'eventsource';
globalThis.EventSource = EventSource as unknown as typeof globalThis.EventSource;
export {
  BagelUsersRequest,
  BagelDBRequest,
  BagelMetaRequest,
  BagelDB,
};
export default BagelDB;
// module.exports = BagelDB;
