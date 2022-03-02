const BagelDB = require("@bageldb/bagel-db")
const {createRemoteFileNode} = require(`gatsby-source-filesystem`)

exports.sourceNodes = async ({
								 actions,
								 createContentDigest,
								 createNodeId,
								 getNodesByType,
							 }, options) => {
	const {createNode, createTypes} = actions

	const bagelClient = new BagelDB(options.apiToken)
	const collections = options.collections

	for (let collection of collections) {
		let {data: collectionData} = await bagelClient.collection(collection).perPage(50).pageNumber(1).get()
		let i = 2;
		while (true) {
			let {data} = await bagelClient.collection(collection).perPage(50).pageNumber(i).get()
			if (data.length === 0) {
				break
			}
			collectionData.push(data)
			i++
		}
		collectionData.forEach(item => {
			createNode({
				id: createNodeId(item._id),
				parent: null,
				children: [],
				internal: {
					type: collection,
					content: JSON.stringify(item),
					contentDigest: createContentDigest(item),
				},
				...item,
			})
		})

		let {data: schema} = await bagelClient.schema(collection).get()
		createTypes(`
			type ImageField {
				extension: String!
				imageURL: String!
				altText: String! 
			}
		`)
		createTypes(`
			type ItemRef {
				itemRefID: String!
				value: String!
			}
		`)
		createTypes(`
			type Option {
				id: String!
				value: String!
			}
		`)
		let type = `type ${collection} implements Node {\n`
		schema.forEach(field => {
			switch (field.type) {
				case 1:
					type += field.slug + ": String\n"
					break
				case 2:
					type += field.slug + ": String\n"
					break
				case 3:
					type += field.slug + ": Float\n"
					break
				case 4:
					type += field.slug + ": Int\n"
					break
				case 5:
					type += field.slug + ": ImageField\n"
					break
				case 6:
					type += field.slug + ": [ItemRef]\n"
					break
				case 7:
					type += field.slug + ": Option\n"
					break
				case 8:
					type += field.slug + ": Boolean!\n"
					break
				case 9:
					type += field.slug + ": String\n"
					break
				case 10:
					type += field.slug + ": String\n"
					break
				case 11:
					type += field.slug + ": [ImageField]\n"
					break
				case 100:
					type += "_id: String!\n"
					type += "_lastUpdatedDate: String!\n"
					type += "_createdDate: String!\n"
					break
			}
		})
		type += `}`
		createTypes(type)
	}
}

exports.onCreateNode = async ({
								  node,
								  actions: {createNode},
								  createNodeId,
								  getCache,
							  }) => {
	if (node.internal.owner !== "@bageldb/gatsby-source-bageldb") return
	let content = JSON.parse(node.internal.content)
	for (const key of Object.keys(content)) {
		let value = content[key]
		if (!value.imageURL) continue
		const fileNode = await createRemoteFileNode({
			url: value.imageURL,
			parentNodeId: node.id,
			createNode,
			createNodeId,
			getCache,
		})
		if (fileNode) {
			node[`${key}Local___NODE`] = fileNode.id
		}
	}
}