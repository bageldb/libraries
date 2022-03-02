class BagelDBPages {
	static defaultOptions() {
		return {
			collections: []
		}
	}
	constructor(api, options) {
		api.createPages(async ({ graphql, createPage }) => {

			let pages = options.collections.filter(col => col.template)
			for (let page of pages) {
				let collectionName = page.typeName || page.name
				collectionName = collectionName[0].toUpperCase() + collectionName.slice(1, collectionName.length);
				let allItems = `all${collectionName}`
				let path = page.template.path || page.typeName || page.name;
				const pageObj = await graphql(`{
				${allItems}{edges {
					node {
					  id
					  ${page.template.friendlyURL}
					}
				  }
				}
			  }`);
				pageObj.data[allItems].edges.forEach(({ node }) => {
					let component = page.template.component.replace(".vue", "")
					let p = `/${path}/${node[page.template.friendlyURL || "id"]}`
					createPage({
						path: p,
						component: `./src/templates/${component}.vue`,
						context: node
					})
				})
			}
		})
	}
}

module.exports = BagelDBPages;