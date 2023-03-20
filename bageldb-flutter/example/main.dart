// Copyright 2020 Bagel Studio ltd. All rights reserved.
// For an example app, see https://github.com/bagelstudio/bagel_pizza

import 'dart:io';

import 'package:bagel_db/bagel_db.dart';

const String bagelToken =
    "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFwaS1rZXkiLCJ0eXAiOiJKV1QifQ.eyJvcmdhbml6YXRpb25JRCI6IjYzOTUwNDMwMDUiLCJwcm9qZWN0SUQiOiJidnRiYm5pMjNha2cwMGZ0bHQzZyIsImF1ZCI6Imh0dHBzOi8vYXBwLmJhZ2VsZGIuY29tIiwianRpIjoiYTQ2ZGZjNTMtOWM4OS00ODdjLTlhNDEtYTU5Yjk0NGEzYTI1IiwiaXNzIjoiaHR0cHM6Ly9hdXRoZW50aWNhdGlvbi5iYWdlbGRiLmNvIiwic3ViIjoiYnZ0YmJuaTIzYWtnMDBmdGx0M2cifQ.MVjrVub7ysP-WDAKmemSmbQdoo1HymQdGPmun5I35xzJ3c5-KjhOBgr89x7Sr-63X_JxxFw0xQZUbNd516tB_3gITmj7Og7jRwjjvlHCtgtqqEnAEteT-wsttxO3qSeHgZT88KPXc04ax9lv77YZ7OKkMT2yTyIG8G7751bEdvkq09MZF02E2xV4Y0e-aHVHhTUn2XOtyCh1nwlJQ_JQa0zsEn5-RlFhV-pHozqu4MJykTB5G6U43qoBQq-KNy2yLd603nlq2naa2zfgkIrGA-AmksxyrrQ05l0nR5EL7R8Gf_q1SKAZf3conmsnvVMBopRgX06wHd3OIcJDQj-Hy8D6tY-aBlGQoShuLgXY3izNnVXQ_CjVPJtQesB2U5kuGTfqvoxafGkv0VFiDn8XxMxJ6S2qFz5tsXs2fm4ibpgdGjXQWOdQqFZvTIUSquJcpwHneqlhC_Cm0-LvFapILqFpg00aqOdt8F4Rf9CdyJEYJtR66blU4yD5TqrP825M-pSOVs59b-LmfR8e502kSx89-bluiSeU9vXJG5QJDzgSYbWPkK2bPlYe9REul4AZbXvd-92OGkWA0NMV4XHalL5RNpXvNE122phA4KVXRQAoT5jchim1pMlb40m5EVKIQOc-q7ZEaHuU1pi4XnJj5rdSWTMQDT9J_aWJmXM-dOg";

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
