import 'dart:async';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:universal_io/io.dart';

import 'package:flutter_test/flutter_test.dart';

import '../lib/bagel_db.dart';

import '../.testToken.dart';

late BagelDB db;

init() async {
  print("starting tests ... \n\n\n");

  SharedPreferences.setMockInitialValues({});

  db = await BagelDB.init(token: testToken, logCurl: true);
}

final String docId = DateTime.now().millisecondsSinceEpoch.toString();

createUserTest() {
  group("auth test", () {
    test('create user test', () async {
      final user = await db.bagelUsersRequest.create(
        'a@a.com',
        '123456',
      );
      expect(user?.userID, isNotNull);
    });

    test('get token test', () async {
      final token = db.bagelUsersRequest.getAccessToken();
      expect(token, isNotNull);
    });
  });
}

createUserWithPhoneTest() {
  group('phone auth test', () {
    test('create user with phone test', () async {
      try {
        final res = await db.bagelUsersRequest.requestOtp(testPhone);
        print({"res": res});
        expect(res, isNotNull);
      } catch (e) {
        print('\n');
        print({"e": e});
      }
    });
  });
}

// b4 the this next test the use should have a password set
logUserInUsingPhoneTest() {
  group('phone auth test', () {
    test('login user with phone test', () async {
      try {
        final res =
            await db.bagelUsersRequest.validate(testPhone, testPassword);
        print({"pass": res!.phone == testPhone});
        expect(res.phone, testPhone);
      } catch (e) {
        print('\n');
        print({"e": e});
      }
    });
  });
}

listenItemTest() {
  group("stream test", () async {
    db.collection('testItems').listen((event) {
      test("check item", () async {
        // then
        expect(event.item["firstField"], contains("Dov"));
      });
      test("check data", () async {
        // then
        expect(event.data.length, greaterThan(0));
      });
    });
    Timer(Duration(seconds: 2),
        () => db.collection("testItems").post({"firstField": "Dov"}));
  });
}

getSchemaTest() {
  group("get schema test", () {
    test('basic schema fetching test', () async {
      // when
      BagelMetaResponse response = await db.schema('testItems').get();
      // then
      expect(response.statusCode, equals(200));
    });
  });
}

getItemsTest() {
  group('get items test', () {
    test('basic data fetching test', () async {
      // when
      BagelResponse response = await db.collection('testItems').get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0]["name"], contains("Dov"));
    });

    test('nested data fetching test', () async {
      // when
      BagelResponse response = await db
          .collection('testItems')
          .item("5ee22f080a6090a13e2f777b")
          .collection("nested")
          .get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data.length, equals(2));
    });

    test('basic field projection test', () async {
      // when
      BagelResponse response =
          await db.collection('testItems').projectOn(["name"]).get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0].length, greaterThan(2));
    });

    test('project off test', () async {
      // when
      BagelResponse response =
          await db.collection('testItems').projectOff("position").get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0].length, greaterThan(2));
    });
    test('basic query test', () async {
      BagelResponse response =
          await db.collection('testItems').query('name', '=', 'Dov').get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0]["name"], contains("Dov"));
      expect(response.itemCount, 1);
    });

    test('multiple queries test', () async {
      BagelResponse response = await db
          .collection('testItems')
          .query('position', '=', 'developer')
          .query('age', '>', '27')
          .get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0]["name"], contains("Nati"));
      expect(response.itemCount, greaterThan(2));
    });

    test('sort test', () async {
      BagelResponse response =
          await db.collection('testItems').sort('age').get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0]["name"], contains("sdf"));
    });

    test('descending sort test', () async {
      BagelResponse response =
          await db.collection('testItems').sort('age', sortOrder: 'desc').get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0]["name"], contains("Dov"));
    });

    test('ascending sort test', () async {
      BagelResponse response =
          await db.collection('testItems').sort('age', sortOrder: 'asc').get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data[0]["name"], contains("sdf"));
    });

    test('results per page test', () async {
      BagelResponse response =
          await db.collection('testItems').perPage(2).get();
      var data = response.data;
      // then
      expect(response.statusCode, equals(200));
      expect(data.length, lessThan(3));
    });

    test('everything success test', () async {
      BagelResponse response =
          await db.collection('testItems').everything().get().then((res) {
        return res;
      });
      var data = response.data;
      expect(response.statusCode, equals(200));
      expect(data[0]["seniority"][0]["item"]["seniority"], equals(21));
    });

    test('everything fail test', () async {
      BagelResponse falseResponse = await db.collection('testItems').get();
      var falseData = falseResponse.data;
      expect(falseResponse.statusCode, equals(200));
      expect(falseData[0]["seniority"][0]["item"], equals(null));
    });

    test('item test', () async {
      BagelResponse response = await db
          .collection('testItems')
          .item('5ee22f0e0a6090a13e2f777c')
          .get();
      var data = response.data;
      expect(response.statusCode, equals(200));
      //expect(data, null);
      expect(data["name"], contains('Nati'));
    });
  });
}

postItemTest() {
  group('post item test', () {
    // given

    // test('simple post test', () async {
    //   BagelResponse response = await db.collection('testItems').post({
    //     "_id": "",
    //     'name': 'Renana',
    //     'age': "34",
    //     'position': 'CPO',
    //     "dateType": "",
    //     "imageTesting": []
    //   });
    //   // then
    //   expect(response.statusCode, equals(201));
    // });

    // test('post with image test', () async {
    //   Directory current = Directory.current;
    //   File file = File(current.path + '/test/images-2.jpg');
    //   BagelResponse response = await db.collection('testItems').post({
    //     'name': 'Renana',
    //     'age': 34,
    //     'position': 'COO',
    //   });
    //   String _id = response.data["id"];
    //   BagelResponse res =
    //       await db.collection("testItems").item(_id).uploadImage("image", file);
    //   // then
    //   expect(response.statusCode, equals(201));
    //   expect(res.statusCode, equals(201));
    // });

    test('post multiple assets', () async {
      // BagelDB db = await BagelDB.init(token: testToken);
      File file = File(Directory.current.path + '/test/images-2.jpg');

      List<Map<String, dynamic>> assets = [
        {
          "selectedImage": file,
          "altText": 'log',
          "fileName": 'logo.png',
        },
        {
          "assetLink": 'https://cdn.quasar.dev/logo-v2/svg/logo.svg',
          "altText": 'log',
          "fileName": 'logo.png',
        }
      ];

      BagelResponse response = await db.uploadAssets(assets);
      print(response.data);
      expect(response.statusCode, equals(200));
    });

    // test('nested data posting test', () async {
    //   BagelResponse res;
    //   BagelResponse res2;
    //   // when

    //   res = await db
    //       .collection('testItems')
    //       .item("60f72f59f5e0695c5b808d9c")
    //       .collection("nested")
    //       .post({"nestedItem": "this is my string"});
    //   res2 = await db
    //       .collection('testItems')
    //       .item("60f72f59f5e0695c5b808d9c")
    //       .collection("nested")
    //       .item(res.data["id"])
    //       .set({'nestedItem': "testString number 2"});

    //   expect(res.statusCode, lessThan(299));
    //   expect(res2.statusCode, lessThan(299));
    // });
  });
}

putItemTest() {
  group('put item test', () {
    test('put test', () async {
      // when
      BagelResponse response = await db
          .collection('testItems')
          .item('5ee773795539f58b09d54447')
          .put({
        "dateType": null,
        'name': 'Renana',
        'age': 34,
        'position': 'Product Manager',
      });
      // then
      expect(response.statusCode, lessThan(300));
    });

    test('set item', () async {
      // when
      BagelResponse response =
          await db.collection('testItems').item(docId).set({
        'name': 'Renana',
        'age': 34,
        'position': 'Product Manager',
      });
      // then
      expect(response.statusCode, lessThan(300));
    });

    test('append a reference item', () async {
      // when

      BagelResponse response = await db
          .collection('testItems')
          .item(docId)
          .append("seniority", "5ee2451c0a6090a13e2f7782");
      // then
      expect(response.statusCode, lessThan(300));
    });
    test('unset a reference item', () async {
      // when
      BagelResponse response = await db
          .collection('testItems')
          .item(docId)
          .unset("seniority", "5ee2451c0a6090a13e2f7782");
      // then
      expect(response.statusCode, lessThan(300));
    });
  });
}

deleteItemTest() {
  group('delete item test', () {
    test('delete test', () async {
      BagelResponse response = await db.collection('testItems').post({
        "_id": "",
        'name': 'Renana',
        'age': 34,
        'position': 'CFO',
        "dateType": ""
      });
      String _id = response.data["id"];
      BagelResponse res = await db.collection("testItems").item(_id).delete();
      expect(res.statusCode, equals(200));
    });
  });
}

Future<void> main() async {
  setUpAll(() {
    // ↓ required to avoid HTTP error 400 mocked returns
    HttpOverrides.global = null;
  });
  TestWidgetsFlutterBinding.ensureInitialized();
  await init();
  logUserInUsingPhoneTest();
  // postItemTest();
  // createUserTest();
  // getItemsTest();
  // putItemTest();
  // deleteItemTest();
}
