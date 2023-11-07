# 0.0.1

- The initial version.

# 0.1.0

- Add an example in `example` directory
- Add more descriptive README
- Add more documantation to the functions

# 0.1.1

- API & example editing

# 0.1.2

- Add longer description

# 0.1.3

- Edit the contructor of `BagelDB` object
- Add a link to a detailes example repo on Github

# 0.1.4

- Add `pageNumber` query
- Internal changes in the endpoints

# 0.1.6

- Added nullsafety to the package
- Added method `schema` to retrieve the collection schema

# 0.1.7

- Added support for all platforms: Android, IOS and Web
- Added Support for nested collection for all CRUD operations
- Added field projection for all requests
- Bug Fixes

# 0.1.8

- Added support for appending or unsetting an item to a reference list instead of putting the entire array
- Added Support for flutter web

# 0.1.9

- validate `set()` and `post()` methods item is set
- solidify `query()` and other methods return the right types

# 0.1.10

- Breaking Change: `put()`, `set()` and `post()` do not take named parameters anymore, the Map is received is now a positional argument

# 0.1.11

- Bug fixes with nested collection request

# 0.1.12

- Added `data` parameter to the `listen()` method, now returning the full payload, allowing listen to be used as a `get()` and get properly updated when data changes

# 0.1.13

- `listen()` stability bug fix
- fixed `itemCount` bug on `get()`

# 0.1.14

- Realtime payload bug fix

# 0.1.15

- Realtime nested collection bug fix

# 0.1.16

- User authentication is now available in the flutter library.
- OTP is also available via the new `requestOtp(emailOrPhone)` then `validateOtp(otp)` methods.

# 0.1.17

- Otp bug fix, now throwing an error for the wrong password

# 0.1.18

- GeoPoint query static constructor
- Minor OTP bug fix

# 0.1.19

- Changes to how user login state is managed, bug fixes
- deprecated `getUserID()` `isLoggedIn()` and `getUser()` in favor of getter `user`
- Added `authStateChange` as a Stream to get notified on a users login state change

# 0.1.20

- BagelUser and AuthEvent export fix
- Change user getter to type BagelUser?
- Fixed listner initialization for veirfy functions

# 0.1.21

- Initialization bug fix

# 0.1.22

- Better error handling
- Instance consistancy for `users()`
- `authStateChange` bug fixes - wont add events after closing, and propely re-instatiate when opening again

# 0.1.23

- Refactor code and cleanup
- Add support to new methods in `users()` like:
  - `resendOtp()` Resends the OTP message to the user, utilizing an independant provider, to ensure maximum reliablity.
  - `requestPasswordReset(email)` will send a password reset email to the user
- Replaced localstore to `SharedPreferences`, this will log users out. To import the locally stored users tokens to the with this [migration code](https://github.com/bageldb/migrate_stored_users)

# 0.1.24

- Fixed async issue with SharedPreferences

# 0.1.25

- `listen()` now fetches a new item on event listner for improved item parsing

# 0.1.26

- `listen()` Improvements and fixes on update delete and create

# 0.1.27

- `get()` params bug fix

# 0.1.28

- Fix query double encoding

# 0.1.29

- When a refresh token is no longer valid, logges the user out and requires re-authentication

# 0.1.30

- Add: `deleteUser()` mthod to allow users to delete themselves or admins (with admin toekn) delete a user.

# 0.2.0

- This version is a major refactor and includes breaking Changes:
  - Now an async method `init()` must be called before using the db instance.
  - authStateChange is now a method, and not a static, and should be called as follows: `authStateChange()`
  - static strings for queries are now lower case and should be changed to the folowing: `ASC` => `asc` `DESC` => `desc` `EQUAL` => `equal` `NOT_EQUAL` => `notEqual` `GREATER_THAN` => `greaterThan` `LESS_THAN` => `lessThan` `WITHIN` => `within` `GeoPointQuery(lat, lng, distance)` => `geoPointQuery(lat, lng, distance)`

# 0.2.01

- Formatting fixes
- close stream when authStateChange is cancelled

# 0.2.02

- Add: `find()` method

# 0.2.21

- Add: `uploadAssets()` method

# 0.2.22

- Add: `phone` or `email` options in auth methods
- Add: config option `logCurl` to allow logging of curl requests

# 0.2.23

- Add: beta feature for mongodb like aggregation pipeline queries

# 0.2.24

- Add: `updatePassword()` method

# 0.2.24

- Add: `validateOtp()` t query param to ensure the otp is valid
