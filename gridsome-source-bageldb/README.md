# @bageldb/gridsome-source

> BagelDB source for Gridsome.
> This package is under development and may the API might change without warning.

## Install

- `npm install @bageldb/gridsome-source`

## Usage

The plugin accepts two option arguments named `apiToken` and `collections`. The api token will be generated in the project settings area. The collections object should be structured as follows:

```js
const collections = {
  name: "blog", // id of the collection
  typeName: "BlogPosts", // (optional) name of type for GraphQL
  sort: { field: "<fieldName>", sortOrder: "<ASC/DESC>" }, // optional
};

module.exports = {
  plugins: [
    {
      use: "@bageldb/gridsome-source",
      options: {
        apiToken: "BAGEL_TOKEN", // required
        collections: collections,
      },
    },
  ],
};
```
