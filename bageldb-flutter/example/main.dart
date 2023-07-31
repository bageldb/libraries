// Copyright 2020 Bagel Studio ltd. All rights reserved.
// For an example app, see https://github.com/bagelstudio/bagel_pizza

import 'dart:io';

import 'package:bagel_db/bagel_db.dart';

const String bagelToken = 'your token here';

class Db {
  Db._();
  static Db? _instance;
  static Db get instance => _instance ??= Db._();
  Future<BagelDB> init({String? token}) async {
    db = await BagelDB.init(token: token);
    return db;
  }
}

late BagelDB db;

void init() async {
  db = await Db.instance.init(token: bagelToken);
}

// create an instance of BagelDB

// a var that will hold the response from BagelDB
BagelResponse response = BagelResponse(data: {}, statusCode: 0);

// get data using Builder pattern
void getFromBagelDB() async {
  // simple get request
  await db.collection('testItems').get();

  // get with query
  await db
      .collection('testItems')
      .query('position', '=', 'developer')
      .query('age', '>', '27')
      .get();

  // sort the data by parameter
  await db.collection('testItems').sort('age').get();

  // sort with order
  await db.collection('testItems').sort('age', sortOrder: 'asc').get();

  // define how many results will be in each page
  await db.collection('testItems').perPage(2).get();

  // include all the details for item
  await db.collection('testItems').everything().get();

  // get a specific item
  await db
      .collection('testItems')
      .item('5dr22f010a1466a13e2f967a' /*replace with your item id*/)
      .get();
}

// post item. Post returns the id of item that created
void postTodb() async {
  // post item to db
  await db.collection('testItems').post({
    'name': 'Baz',
    'age': 25,
    'position': 'CTO'
  } /* replace with your item */);

  await db.collection('testItems').item("customId").set({
    'name': 'Baz',
    'age': 25,
    'position': 'CTO'
  } /* Creates an item with an custom id you set :: if the item exists it will just update it*/);
}

// put item
void putInBagelDB() async {
  // post item to BagelDB
  await db.collection('testItems').item('5dr22f010a1466a13e2f967a').put({
    'name': 'Baz',
    'age': 34,
    'position': 'CEO',
  });
}

void deleteFromBagelDB() async {
  await db.collection('testItems').item('5dr22f010a1466a13e2f967a').delete();
}

// uploading image
void uploadImage() async {
  File image = File('/Users/userName/Desktop/photo-test.jpeg');
  await db.collection("users").item("3423432").uploadImage("profilePic", image);
}

void getCollectionSchema() async {
  await db.schema('testItems').get();
}
