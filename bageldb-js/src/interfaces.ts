import type bagelDBRequestType from './bagelDBRequest';
import type bagelUsersRequestType from './users';
import type bagelType from '.';
import Bagel from '.';

import BagelDBRequest from './bagelDBRequest';
import BagelUsersRequest from './users';
import { AxiosRequestHeaders } from 'axios';
// eslint-disable-next-line @typescript-eslint/naming-convention
type fileUploadArgs = {
  selectedImage?: any;
  imageLink?: string;
  altText?: string;
  fileName?: string;
} & ({ selectedImage: any } | { imageLink: string });

type UserGroups = string;
interface BagelUser {
  userID?: string;
  email?: string;
  createdDate?: string;
  lastLoggedIn?: string;
  userGroups?: UserGroups[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface structArgs {
  instance: bagelType;
  collectionID: string;
}

type BagelGeoPointQuery = ReturnType<typeof Bagel.GeoPointQuery>;

type BagelStorageType =
  | Storage
  | {
    getItem<T>(
      key: string,
      callback?: (err: any, value: T | null) => void
    ): Promise<T | null>;

    setItem<T>(
      key: string,
      value: T,
      callback?: (err: any, value: T) => void
    ): Promise<T>;

    removeItem(key: string, callback?: (err: any) => void): Promise<void>;

    clear?(callback?: (err: any) => void): Promise<void>;

    length?(
      callback?: (err: any, numberOfKeys: number) => void
    ): Promise<number>;

    key?(
      keyIndex: number,
      callback?: (err: any, key: string) => void
    ): Promise<string>;

    keys?(callback?: (err: any, keys: string[]) => void): Promise<string[]>;

    iterate?<T, U>(
      iteratee: (value: T, key: string, iterationNumber: number) => U,
      callback?: (err: any, result: U) => void
    ): Promise<U>;
  };

interface BagelConfigOptions {
  isServer?: boolean;
  customStorage?: BagelStorageType;
  baseEndpoint?: string;
  customReqHeaders?: AxiosRequestHeaders;
}
export type {
  fileUploadArgs,
  BagelUser,
  UserGroups,
  bagelDBRequestType,
  bagelUsersRequestType,
  bagelType,
  structArgs,
  BagelGeoPointQuery,
  BagelConfigOptions,
  BagelStorageType,
};

export type { BagelUsersRequest, BagelDBRequest, Bagel };
