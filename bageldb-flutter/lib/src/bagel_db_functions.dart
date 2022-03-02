import 'dart:async';
import 'dart:typed_data';
import 'package:universal_io/io.dart';
import 'package:dio/dio.dart';
import "dart:convert";

import 'bagel_db_users.dart';

///## **BagelDB** is a content management system with rich API features. For more info, visit here bageldb.com

/// *BagelDB* class is the base class for any bagelDB request, it must be given the api [token] created at app.bageldb.com
class BagelDB {
  String token;
  late BagelUsersRequest bagelUsersRequest = new BagelUsersRequest(this);
  BagelDB(this.token);

  /// return a *BagelDBRequest* object for a specific [collection]
  BagelDBRequest collection(String collection) {
    return BagelDBRequest(bagelDB: this, collectionID: collection);
  }

  /// return a *BagelUsersRequest* object to work with Bagel Users
  BagelUsersRequest users() {
    return bagelUsersRequest;
  }

  /// Get information about the collection schema
  BagelMetaRequest schema(String collection) {
    return BagelMetaRequest(instance: this, collectionID: collection);
  }

  static String get ASC => "ASC";

  static String get DESC => "DESC";

  static String get EQUAL => "=";

  static String get NOT_EQUAL => "!=";

  static String get GREATER_THAN => ">";

  static String get LESS_THAN => "<";

  /// used in GeoPoint Query for
  static String get WITHIN => "within";

  /// construct a geopoint query with a latitude longitude and the radius distance in meters to query the data
  static String GeoPointQuery(lat, lng, distance) {
    return '$lat,$lng,$distance';
  }
}

/// The base bagelDB response class, the response from bagelDB is inserted into the class
class BagelResponse {
  dynamic data;
  int? itemCount;
  int? statusCode;
  BagelResponse(
      {required this.data, required this.statusCode, this.itemCount = 0});

  @override
  String toString() {
    String str = 'status code: ${this.statusCode.toString()}'
        'ֿ\nitem count: ${this.itemCount.toString()}'
        '\ndata: ${this.data.toString()}';
    return str;
  }
}

class BagelMetaResponse {
  dynamic data;
  int? statusCode;

  BagelMetaResponse({required this.data, required this.statusCode});

  @override
  String toString() {
    String str = 'status code: ${this.statusCode.toString()}'
        '\ndata: ${this.data.toString()}';
    return str;
  }
}

class BagelMetaRequest {
  String collectionID;
  BagelDB instance;
  final String baseEndpoint = 'https://api.bagelstudio.co/api/public';

  Dio dio = Dio();
  BagelMetaRequest({required this.instance, required this.collectionID});

  /// get meta information about a collection, namely the schema structure
  Future<BagelMetaResponse> get() async {
    Options options = Options(headers: {
      'authorization': 'Bearer ${this.instance.token}',
      "Accept-Version": "v1"
    });
    String url = '$baseEndpoint/collection/${this.collectionID}/schema';
    Response response = await dio.get(url, options: options);
    BagelMetaResponse res = BagelMetaResponse(
      data: response.data,
      statusCode: response.statusCode,
    );
    return res;
  }
}

/// The builder for creating a bagelDB request, follow the builder pattern with the verbs get,
/// put, post and delete building and executing the request. There is also the ability to use the uploadImage builder,
/// for uploading images to an item
class BagelDBRequest {
  final BagelDB bagelDB;
  String collectionID, sortField, sortOrder;
  String? _item, _projectOff, _projectOn;
  List<String> nestedCollectionsIDs = [];
  int _pageNumber = 1;
  int? _perPage;
  List<String> _query = [];
  bool callEverything;

  final String baseEndpoint = 'https://api.bagelstudio.co/api/public';
  final String liveEndpoint = 'https://live.bageldb.com/api/public';
  late Dio dioInstance;
  bool dioInitialized = false;
  Future<Dio> _dio() async {
    if (!dioInitialized) {
      BagelUsersRequest userRequest = BagelUsersRequest(bagelDB);
      Map<String, dynamic> headers = {"Accept-Version": "v1"};
      String? token = await userRequest.getAccessToken();
      if (token != null)
        headers['authorization'] = 'Bearer $token';
      else
        headers['authorization'] = 'Bearer ${bagelDB.token}';
      dioInstance = Dio(BaseOptions(headers: headers));
      dioInitialized = true;
    }
    return dioInstance;
  }

  BagelDBRequest({
    required this.bagelDB,
    required this.collectionID,
    this.sortField = "",
    this.sortOrder = "",
    this.callEverything = false,
  });

  /// Build and execute a get request to bagelDB, for both full collection and item requests
  Future<BagelResponse> get() async {
    Map<String, dynamic> params = Map<String, dynamic>();

    if (this._pageNumber != 1)
      params["pageNumber"] = this._pageNumber.toString();
    if (this.sortField != "") params["sort"] = this.sortField;
    if (this.sortOrder != "") params["order"] = this.sortOrder;
    if (this._perPage != null) params["perPage"] = this._perPage.toString();
    if (this.callEverything)
      params["everything"] = this.callEverything.toString();
    if (this._projectOff != null) params["projectOff"] = this._projectOff!;
    if (this._projectOn != null) params["projectOn"] = this._projectOn!;

    String itemID = this._item != null ? '/' + this._item! : '';

    String url =
        '${this.baseEndpoint}/collection/${this.collectionID}/items$itemID?${params.toString()}';
    if (this._query.isNotEmpty) url = url + "&query=" + this._query.join("%2B");
    if (this.nestedCollectionsIDs.isNotEmpty) {
      String nestedID = this.nestedCollectionsIDs.join(".");
      url = '$url&nestedID=$nestedID';
    }
    Dio dio = await _dio();
    Response response = await dio.get(url, queryParameters: params);
    Headers headers = response.headers;
    BagelResponse res = BagelResponse(
      data: response.data,
      statusCode: response.statusCode!,
    );
    if (this._item == null)
      res.itemCount = int.tryParse((headers["item-count"]?.first ?? ""));
    return res;
  }

  /// Build and execute a post request to bagelDB. [item] should follow the collection schema as defined at app.bageldb.com
  ///
  Future<BagelResponse> post(Map<String, dynamic> item) async {
    String url = '${this.baseEndpoint}/collection/${this.collectionID}/items';

    if (this.nestedCollectionsIDs.isNotEmpty) {
      String nestedID = this.nestedCollectionsIDs.join(".");
      url = url + '/${this._item}?nestedID=$nestedID';
    }
    Dio dio = await _dio();
    return dio.post(url, data: item).then((Response res) async {
      return BagelResponse(data: res.data, statusCode: res.statusCode!);
    });
  }

  /// Build and execute a image upload to bagelDB, for a specific item in a collection. [image] should be a valid file object and [slug] is the field to which the image will be updated. The item() methods must have been used in order to execute uploadImage
  Future<BagelResponse> uploadImage(String slug, File image) async {
    String fileName = image.path.split('/').last;
    FormData formData = FormData.fromMap({
      "imageFile": await MultipartFile.fromFile(
        image.path,
        filename: fileName,
      ),
    });
    String url =
        '$baseEndpoint/collection/$collectionID/items/${this._item}/image?imageSlug=$slug';
    if (this.nestedCollectionsIDs.isNotEmpty) {
      String nestedID = this.nestedCollectionsIDs.join(".");
      url = '$url&nestedID=$nestedID';
    }
    Dio dio = await _dio();
    Response res = await dio.put(url, data: formData);
    return BagelResponse(data: res.data, statusCode: res.statusCode!);
  }

  /// Build and execute a put request to bagelDB. [item] should follow the collection schema as defined at app.bageldb.com
  Future<BagelResponse> put(Map<String, dynamic> item) async {
    if (this._item == null) throw ("item id must be set to use the method put");
    String url =
        '$baseEndpoint/collection/${this.collectionID}/items/${this._item}';
    if (this.nestedCollectionsIDs.isNotEmpty) {
      String nestedID = this.nestedCollectionsIDs.join(".");
      url = '$url?nestedID=$nestedID';
    }
    Dio dio = await _dio();
    Response res = await dio.put(url, data: item);
    return BagelResponse(data: res.data, statusCode: res.statusCode!);
  }

  /// Set an item in order to determine the id of the item yourself.
  /// in the event the itemID already exists, [set()] will simply update the exising item
  Future<BagelResponse> set(Map<String, dynamic> item) async {
    if (this._item == null) throw ("item id must be set to use the method set");
    String url =
        '${this.baseEndpoint}/collection/${this.collectionID}/items/${this._item}?set=true';
    if (this.nestedCollectionsIDs.isNotEmpty) {
      String nestedID = this.nestedCollectionsIDs.join(".");
      url = '$url&nestedID=$nestedID';
    }
    Dio dio = await _dio();
    Response res = await dio.put(url, data: item);
    return BagelResponse(data: res.data, statusCode: res.statusCode!);
  }

  /// Build and execute a delete request to bagelDB.
  Future<BagelResponse> delete() async {
    String url =
        '$baseEndpoint/collection/${this.collectionID}/items/${this._item}';
    if (this.nestedCollectionsIDs.isNotEmpty) {
      String nestedID = this.nestedCollectionsIDs.join(".");
      url = '$url?nestedID=$nestedID';
    }
    Dio dio = await _dio();
    Response res = await dio.delete(url);
    return BagelResponse(data: res.data, statusCode: res.statusCode!);
  }

  /// quering the collection with a [key] and [value] parameters, by the [queryOperator]. The following are valid queryOperators '=', '!=', 'regex', '>', '<'. The value can also be a comma seperated list of values, allowing for an 'in' query.
  /// For example: ```query('age', '=', '32')``` or for an itemRef query ```query('position.itemRefID', '=', '[432EWDWE]')```
  BagelDBRequest query(String key, String queryOperator, dynamic value) {
    String query = key + ":" + queryOperator + ":" + value.toString();
    this._query.add(Uri.encodeQueryComponent(query));
    return this;
  }

  /// sort data by [sortTerm] - a specific field, for example ```age```,
  /// and by [sortField] - ```desc``` for descending order, ```asc``` for ascending order.
  BagelDBRequest sort(String sortField, {String? sortOrder}) {
    this.sortField = sortField;
    if (sortOrder != null) this.sortOrder = sortOrder;
    return this;
  }

  /// Append a reference to an ItemRef field to avoid having to put the enire array
  /// This halps avoid conflicts between different clients

  Future<BagelResponse> append(fieldSlug, value) async {
    String url =
        '$baseEndpoint/collection/${this.collectionID}/items/${this._item}/field/$fieldSlug';
    if (nestedCollectionsIDs.isNotEmpty) {
      String nestedID = nestedCollectionsIDs.join(".");
      url = url + '?nestedID=$nestedID';
    }
    Dio dio = await _dio();
    Response response = await dio.put(url, data: {"value": value});
    BagelResponse res = BagelResponse(
      data: response.data,
      statusCode: response.statusCode!,
    );
    return res;
  }

  /// Unset simply removes a reference to an ItemRef field avoid having to put the enire array
  /// This halps avoid conflicts between different clients
  Future<BagelResponse> unset(fieldSlug, value) async {
    String url =
        '$baseEndpoint/collection/${this.collectionID}/items/${this._item}/field/$fieldSlug';
    if (nestedCollectionsIDs.isNotEmpty) {
      String nestedID = this.nestedCollectionsIDs.join(".");
      url = url + '?nestedID=$nestedID';
    }
    Dio dio = await _dio();
    Response response = await dio.delete(url, data: {"value": value});
    BagelResponse res = BagelResponse(
      data: response.data,
      statusCode: response.statusCode!,
    );
    return res;
  }

  /// Select only the fields you want the fields you want to receive by using a comma seperated list
  /// Project on cannot be used togher with [projectOff] they are mutually exclusive
  BagelDBRequest projectOn(slugs) {
    if (_projectOff != null)
      throw ("You can't use both ProjectOn and ProjectOff in the same call");
    if (slugs is List<String>) {
      this._projectOn = slugs.join(",");
    } else if (slugs is String) {
      this._projectOn = slugs;
    }
    return this;
  }

  /// Remove the feields you want to remove from the payload to reduce the payload size and imrove efficeincy
  /// Project on cannot be used togher with [projectOn] they are mutually exclusive
  BagelDBRequest projectOff(dynamic slugs) {
    if (_projectOn != null)
      throw ("You can't use both ProjectOn and ProjectOff in the same call");
    if (slugs is String) {
      this._projectOff = slugs;
    } else if (slugs is List<String>) {
      this._projectOff = slugs.join(",");
    }
    return this;
  }

  /// define the [resultsPerPage] - how many results will be in each page
  BagelDBRequest perPage(int resultsPerPage) {
    this._perPage = resultsPerPage;
    return this;
  }

  /// define the [pageNumber] - the index of the page
  BagelDBRequest pageNumber(int? pageNumber) {
    this._pageNumber = pageNumber ?? 1;
    return this;
  }

  /// defines the request for a specific item by the item's [_id] either in top level collection or in nested collection
  BagelDBRequest item(String _id) {
    if (this._item != null) {
      if (this.nestedCollectionsIDs.length % 2 == 0)
        throw ("a nested item can only be placed after a nested collection");
      this.nestedCollectionsIDs.add(_id);
    } else {
      this._item = _id;
    }
    return this;
  }

  /// specify whether the request should include all the details for item references
  BagelDBRequest everything() {
    this.callEverything = true;
    return this;
  }

  /// GET, PUT and POST to nested collections
  BagelDBRequest collection(collectionSlug) {
    this.nestedCollectionsIDs.add(collectionSlug);
    return this;
  }

  /// Trigger a callback when an item gets updated created or deleted on BagelDB on a full collection or on a single item
  void listen(Function(BagelEvent) onData) async {
    String requestID = "", nestedID = "";
    if (this.nestedCollectionsIDs.isNotEmpty)
      nestedID = this.nestedCollectionsIDs.join(".");
    Response<ResponseBody> rs;
    List<dynamic> data;
    BagelResponse res = await this.get();
    data = res.data;
    _listen() async {
      String token = await BagelUsersRequest(this.bagelDB).getAccessToken() ??
          this.bagelDB.token;
      String uri =
          '$liveEndpoint/collection/${this.collectionID}/live?authorization=$token&requestID=$requestID&nestedID=$nestedID&itemID=${this._item ?? ""}';
      Dio dio = await _dio();
      rs = await dio.get<ResponseBody>(uri,
          options: Options(
            responseType: ResponseType.stream,
            headers: {'Access-Control-Allow-Origin': true},
          ));
      rs.data?.stream.listen((e) async {
        Event event = Event.fromUint8List(e);
        if (event.type == "start") {
          requestID = event.data;
          onData(BagelEvent(trigger: event.type, data: data));
        } else if (event.type == "stop") {
          _listen();
        } else if (event.type == "message") {
          dynamic response;
          try {
            response = json.decode(event.data);
          } catch (err) {
            response = {};
            RegExp r = new RegExp(r'"itemID":"(\w*)');
            response["itemID"] = r.firstMatch(event.data)?.group(1);
            this._item = response["itemID"];
            response["item"] = {};
            RegExp trgr = new RegExp(r'"trigger":"(\w*)');
            response["trigger"] = trgr.firstMatch(event.data)?.group(1);
          }
          switch (response["trigger"]) {
            case "update":
              int i = data.indexWhere(
                  (element) => element["_id"] == response["itemID"]);
              if (i != -1) {
                data[i] = response["item"];
                onData(BagelEvent.fromPayload(response, data));
              }
              break;
            case "delete":
              data =
                  data.map((element) => element != response["itemID"]).toList();
              onData(BagelEvent.fromPayload(response, data));
              break;
            case "create":
              data.add(response["item"]);
              onData(BagelEvent.fromPayload(response, data));
              break;
          }
        }
      });
    }

    _listen();
  }
}

class Event {
  final String type;
  dynamic data;
  Event({required this.type, this.data});

  factory Event.fromUint8List(Uint8List event) {
    String s = String.fromCharCodes(event);
    List<String> pList = s.trim().split("\n");
    Event e = Event(
        type: pList.first.replaceFirst("event:", "").trim(),
        data: pList.last.replaceFirst("data:", "").trim());
    return e;
  }
}

class BagelEvent {
  String? trigger, collectionID, organization, projectID, itemID;
  List<dynamic> data;
  dynamic item;
  BagelEvent(
      {this.trigger,
      this.collectionID,
      this.organization,
      this.item,
      this.projectID,
      required this.data,
      this.itemID});

  factory BagelEvent.fromPayload(dynamic response, List<dynamic> data) {
    return BagelEvent(
      collectionID: response["collectionID"],
      projectID: response["projectID"],
      itemID: response["itemID"],
      trigger: response["trigger"],
      item: response["item"] != {} ? response["item"] : null,
      data: data,
    );
  }
}
