# BagelDB

BagelDB is a content management system with rich API features. The CMS aims to offer an all in one service for web and app developers, from data delivery to search functionality. While at the same time, the aim is that data administrators will have an ability to access the data, filtering based on their requirements and than export the data if necessary. Our main focuses are content delivery speed and developer and data-admin experience.

For further documentation on how to use this library go [here](https://docs.bageldb.com)
## Install it

### npm

```console
npm install @bageldb/bagel-db
```

```js
import Bagel from '@bageldb/bagel-db'

/** OR **/

const Bagel = require('@bageldb/bagel-db')

const db = new Bagel(TOKEN)
```

if using with a CDN

```html
<script src="https://unpkg.com/@bageldb/bagel-db"></script>

<script>
    const db = new Bagel(TOKEN)
</script>

```