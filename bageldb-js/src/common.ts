import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';
import BagelDBRequest from './bagelDBRequest';
import BagelMetaRequest from './bagelMetaRequest';
import BagelUsersRequest from './users';

const baseEndpoint = 'https://api.bageldb.com';
const liveEndpoint = 'https://live.bageldb.com/api/public';

export {
  BagelUsersRequest,
  BagelDBRequest,
  BagelMetaRequest,
};
export {
  AxiosInstance,
  axios,
  baseEndpoint,
  liveEndpoint,
  AxiosPromise,
  AxiosResponse
};
