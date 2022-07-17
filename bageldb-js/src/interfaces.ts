import type bagelDBRequestType from './bagelDBRequest';
import type bagelMetaRequestType from './bagelMetaRequest';
import type bagelUsersRequestType from './users';
import type bagelType from '.';
import Bagel from '.';

import BagelDBRequest from './bagelDBRequest';
import BagelMetaRequest from './bagelMetaRequest';
import BagelUsersRequest from './users';
// eslint-disable-next-line @typescript-eslint/naming-convention
type fileUploadArgs = {
  selectedImage?: any;
  imageLink?: string;
  altText?: string;
  fileName?: string;
} & (
  | {
    selectedImage: any;
  }
  | {
    imageLink: string;
  }
);

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

export type {
  fileUploadArgs,
  BagelUser,
  UserGroups,
  bagelDBRequestType,
  bagelMetaRequestType,
  bagelUsersRequestType,
  bagelType,
  structArgs,
  BagelGeoPointQuery,
};

export type { BagelUsersRequest, BagelDBRequest, BagelMetaRequest, Bagel };
