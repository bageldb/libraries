## Description

This plugin for Gatsby, sources data from [BagelDB](http://bageldb.com/) collections and inserts the data into Gatsby graphql. As a bonus, the library will also download all images referenced to allow using [Gatsby Images](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/) plugin.

### Learning Resources

To learn more about BagelDB and use it to its full potential check out the BagelDB docs [here](https://docs.bageldb.com)

## Installation

1. `npm install @bageldb/gatsby-source-bageldb`

1. Inside your projects `gatsby-config.js`, add to the plugins field the following:
```json
  plugins: [{
    resolve: "@bageldb/gatsby-source-bageldb",
    options: {
      apiToken: "<API_TOKEN>", // <- Your BagelDB api token, with read permissions on the required collections
      collections: ["REQUIRED_COLLECTIONS"] // <- All the collections you need sourced i.e "bio", "posts"
    }]
```

The recommended way to use the token, is to make use of environment variables. Set an environment variable to be BAGELDB_TOKEN and then use it in the config as such:
```json
  plugins: [{
    resolve: "@bageldb/gatsby-source-bageldb",
    options: {
      apiToken: process.env.BAGELDB_TOKEN, // <- Your BagelDB api token, with read permissions on the required collections
      collections: ["REQUIRED_COLLECTIONS"] // <- All the collections you need sourced i.e "bio", "posts"
    }]
```

## How to query for data

You can now query the data as you would other forms of data, with simple graphql queries.

For Images fields, the plugin creates a new key for the local file so that you can use Gatsby Images. To keep the original data as well as the downloaded version, the plugin creates a new Node called `<IMAGE_SLUG>Local` which contains the local file, as an example query, getting a bios, with a profile picture:
```json
    allBio {
    	nodes {
    		profilePicLocal {
    			id
    			childImageSharp {
       				gatsbyImageData(width: 200)
     			}
    		}
    		profilePic {
    			altText
    		}
    	}
    }
```