import type bagelDBRequestType from './bagelDBRequest';
import type bagelUsersRequestType from './users';
import type bagelType from './index';
import Bagel from './index';

import BagelDBRequest from './bagelDBRequest';
import BagelUsersRequest from './users';
import { AxiosRequestHeaders } from 'axios';

type FileUploadArgs = {
  selectedImage?: any;
  imageLink?: string;
  altText?: string;
  fileName?: string;
} & ({ selectedImage: any } | { imageLink: string });

type AssetUploadArgs = {
  selectedAsset?: any;
  assetLink?: string;
  fileName?: string;
} & ({ selectedAsset: any } | { assetLink: string });

type AssetUploadRes = {
  imageName: string | '';
  altText: string | '';
  imageUrl: string | '';
  extension: string | '';
}[];

type UserGroups = string;
interface BagelUser {
  userID?: string;
  email?: string;
  createdDate?: string;
  lastLoggedIn?: string;
  userGroups?: UserGroups[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface StructArgs {
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
  [key: string]: any;
  isServer?: boolean;
  customStorage?: BagelStorageType;
  baseEndpoint?: string;
  customReqHeaders?: AxiosRequestHeaders;
  enableDebug?: boolean;
}

type DateQuery =
  `Date(${number}${number}${number}${number}-${number}${number}-${number}${number})`;

export type {
  FileUploadArgs as fileUploadArgs,
  FileUploadArgs,
  AssetUploadArgs,
  AssetUploadRes,
  BagelUser,
  UserGroups,
  bagelDBRequestType,
  bagelUsersRequestType,
  bagelType,
  StructArgs,
  BagelGeoPointQuery,
  BagelConfigOptions,
  BagelStorageType,
  DateQuery,
};

export type { BagelUsersRequest, BagelDBRequest, Bagel };
