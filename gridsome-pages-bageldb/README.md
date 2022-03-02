# @bageldb/gridsome-pages

> BagelDB Pages for Gridsome.
> This package is under development and may the API might change without warning.

## Install

- `npm install @bageldb/gridsome-pages`

## Usage

The plugin relies on [@bageldb/gridsome-source](https://www.npmjs.com/package/@bageldb/gridsome-source), meaning the source plugin must be installed for this plugin to work.
The plugin accepts one argument named `collections`. the collection

| name        | Required | Default Value         | Details                                                              |
| ----------- | -------- | --------------------- | -------------------------------------------------------------------- |
| friendlyURL | no       | the `_id` of the item | set the field in BagelDB that will determine the url of the page     |
| path        | yes      |                       | the path of the template https://yourdomain.com/{path}/{friendlyURL} |
| component   | yes      |                       | the name of the vue component in the template folder                 |

```js
const collections = {
  name: "blog", // id of the collection
  template: {
    friendlyURL: "slug", // the name of the field that will be used as a slug - if this
    path: "blog",
    component: "blog",
  },
};

module.exports = {
  plugins: [
    {
      use: "@bageldb/gridsome-pages",
      options: {
        collections: collections,
      },
    },
  ],
};
```
