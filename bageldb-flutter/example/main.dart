// Copyright 2020 Bagel Studio ltd. All rights reserved.
// For an example app, see https://github.com/bagelstudio/bagel_pizza

import 'dart:io';

import '../lib/bagel_db.dart';

// create an instance of BagelDB
BagelDB bagelDB = BagelDB('BearerTestToken'); // replace with your project id

// a var that will hold the response from BagelDB
BagelResponse response = BagelResponse(data: {}, statusCode: 0);

// get data using Builder pattern
void getFromBagelDB() async {
  // simple get request
  await bagelDB.collection('testItems').get();

  // get with query
  await bagelDB
      .collection('testItems')
      .query('position', '=', 'developer')
      .query('age', '>', '27')
      .get();

  // sort the data by parameter
  await bagelDB.collection('testItems').sort('age').get();

  // sort with order
  await bagelDB.collection('testItems').sort('age', sortOrder: 'asc').get();

  // define how many results will be in each page
  await bagelDB.collection('testItems').perPage(2).get();

  // include all the details for item
  await bagelDB.collection('testItems').everything().get();

  // get a specific item
  await bagelDB
      .collection('testItems')
      .item('5dr22f010a1466a13e2f967a' /*replace with your item id*/)
      .get();
}

// post item. Post returns the id of item that created
void postToBagelDB() async {
  // post item to BagelDB
  await bagelDB.collection('testItems').post({
    'name': 'Baz',
    'age': 25,
    'position': 'CTO'
  } /* replace with your item */);

  await bagelDB.collection('testItems').item("customId").set({
    'name': 'Baz',
    'age': 25,
    'position': 'CTO'
  } /* Creates an item with an custom id you set :: if the item exists it will just update it*/);
}

// put item
void putInBagelDB() async {
  // post item to BagelDB
  await bagelDB.collection('testItems').item('5dr22f010a1466a13e2f967a').put({
    'name': 'Baz',
    'age': 34,
    'position': 'CEO',
  });
}

void deleteFromBagelDB() async {
  await bagelDB
      .collection('testItems')
      .item('5dr22f010a1466a13e2f967a')
      .delete();
}

// uploading image
void uploadImage() async {
  File image = File('/Users/userName/Desktop/photo-test.jpeg');
  await bagelDB
      .collection("users")
      .item("3423432")
      .uploadImage("profilePic", image);
}

void getCollectionSchema() async {
  await bagelDB.schema('testItems').get();
}
