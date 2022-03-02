import type bagelDBRequestType from "./bagelDBRequest";
import type bagelMetaRequestType from "./bagelMetaRequest";
import type bagelUsersRequestType from "./users";
import type bagelType from ".";
import Bagel from ".";
import { BagelDBRequest, BagelMetaRequest, BagelUsersRequest } from "./common";
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

interface structArgs {
  instance: bagelType;
  collectionID:  string;
 }
export {
  fileUploadArgs,
  BagelUser,
  UserGroups,
  bagelDBRequestType,
  bagelMetaRequestType,
  bagelUsersRequestType,
  bagelType,
  structArgs
};

export type {
  BagelUsersRequest,
  BagelDBRequest,
  BagelMetaRequest,
  Bagel,
 };