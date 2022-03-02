const BagelDB = require('@bageldb/bagel-db');

class BagelDBSource {
	static defaultOptions() {
		return {
			apiToken: '',
			collections: []
		}
	}

	constructor(api, options) {
		api.loadSource(async actions => {
			const bagelDB = new BagelDB(options.apiToken);

			for (const col of options.collections) {
				const collection = actions.addCollection({
					typeName: col.typeName || col.name
				});
				let sortField = '';
				let sortOrder = '';
				if (col.sort && col.sort.field) {
					sortField = col.sort.field;
					sortOrder = col.sort.sortOrder ? col.sort.sortOrder : '';
				}
				try {
					const res = await bagelDB.collection(col.name).everything().sort(sortField, sortOrder).get();
					const allItems = res.data;
					let itemCount = parseInt(res.headers["item-count"]);
					if (itemCount > 100) {
						let cycles = Math.ceil(itemCount / 100)
						for (let i = 2; i <= cycles; i++) {
							let { data } = await bagelDB.collection(col.name).everything().pageNumber(i).sort(sortField, sortOrder).get();
							for (const item of data) {
								allItems.push(item)
							}
						}
					}
					for (const item of allItems) {
						if (col.template && col.template.friendlyURL) {
							let friendlyURL = col.template.friendlyURL
							if (item[friendlyURL]) {
								item._pathName = item[friendlyURL].toLowerCase().replace(/[\s]+/gi, "-")
							}
						}
						item.id = item._id
						collection.addNode(item)
					}
				} catch (err) {
					throw (err)
				}
			}
		})
	}
}

module.exports = BagelDBSource;