import 'dart:async';

import 'package:dio/dio.dart';
import 'package:localstore/localstore.dart';

import 'bagel_db_functions.dart';

String authEndpoint = "https://auth.bageldb.com/api/public";

class Collections {
  static String user = "user";
  static String access = "access";
}

class BagelUser {
  String? userID, email, phone;
  BagelUser({
    this.userID,
    this.email,
    this.phone,
  });
}

class AuthEvent {
  BagelUser? user;
  bool loggedin;
  AuthEvent({this.user, this.loggedin = false});
}

class BagelUsersRequest {
  BagelDB instance;
  late Dio dio;
  final _db = Localstore.instance;
  BagelUser? _user;
  BagelUser? get user => _user;
  BagelUsersRequest(this.instance) {
    dio = Dio(BaseOptions(headers: {
      'Authorization': 'Bearer ${this.instance.token}',
      "Accept-Version": "v1"
    }));

    _db
        .collection(Collections.user)
        .doc(Collections.user)
        .get()
        .then((element) {
      _userHandler(element);
    });
  }

  /// use the getter [user] to get BagelUser or Null to determine if a user is logged in
  @deprecated
  Future<bool> isLoggedIn() async {
    return _user != null;
  }

  /// use the getter [user] instead to get the current user;
  @deprecated
  BagelUser? getUser() {
    return _user;
  }

  /// use the getter [user] instead to get the currenly logged in BagelUser
  @deprecated
  String? getUserID() {
    return _user?.userID;
  }

  void _userHandler(usr) async {
    if (usr == null) return; // user has logged out
    Map<String, dynamic>? access =
        await _db.collection(Collections.access).doc("access").get();
    if (access == null) return _logout();

    try {
      DateTime now = DateTime.now();
      DateTime expiryTime = DateTime.parse(access["expires_in"]);
      if (now.isAfter(expiryTime)) await _refresh();
    } catch (err) {
      throw (err);
    }

    await _setUser(usr["userID"], email: usr["email"], phone: usr["phone"]);
  }

  /// Create a user with a an email and password
  Future<BagelUser?> create(email, password) async {
    String url = '$authEndpoint/user';
    Map body = {"email": email, "password": password};
    try {
      Response res = await dio.post(url, data: body);
      _storeTokens(res.data);
      return await _setUser(res.data["user_id"], email: email);
    } catch (err) {
      if (err is DioError) throw (err.response.toString());
    }
  }

  Future<String> _getOtpRequestNonce() async {
    Map<String, dynamic>? otpRequest =
        await _db.collection(Collections.access).doc("nonce").get();
    if (otpRequest != null) {
      DateTime expiryTime = DateTime.parse(otpRequest["expires_in"]);
      if (new DateTime.now().isAfter(expiryTime))
        throw ("OTP request has expired, try again");
      return otpRequest["nonce"];
    } else {
      return "";
    }
  }

  _storeOtpRequestNonce(Map otpRequest) {
    DateTime expires =
        new DateTime.now().add(Duration(seconds: otpRequest["expires_in"]));
    _db
        .collection(Collections.access)
        .doc("nonce")
        .set({"nonce": otpRequest["nonce"], "expires_in": expires.toString()});
  }

  /// Request the user receive a One Time Password either via SMS or Email
  Future<String> requestOtp(emailOrPhone) async {
    String url = '$authEndpoint/user/otp';
    Map body = {"emailOrPhone": emailOrPhone};

    Response res = await dio.post(url, data: body);
    _storeOtpRequestNonce(res.data);
    return res.data["nonce"];
  }

  /// Validate the user's received One Time Password
  Future<BagelUser?> validateOtp(String otp) async {
    String nonce = await _getOtpRequestNonce();
    String url = '$authEndpoint/user/otp/verify/$nonce';
    Map body = {"otp": otp};
    try {
      Response res = await dio.post(url, data: body);
      _storeTokens(res.data);
      return await _getUser();
    } catch (e) {
      if (e is DioError) throw (e.response.toString());
    }
  }

  /// Authenticate the user with an email and password
  Future<BagelUser?> validate(String email, String password) async {
    String url = '$authEndpoint/user/verify';
    Map body = {"email": email, "password": password};
    try {
      Response res = await dio.post(url, data: body);
      _storeTokens(res.data);
      return await _setUser(res.data["user_id"], email: email);
    } catch (e) {
      if (e is DioError) throw (e.response.toString());
    }
  }

  /// Get the currently logged in user's info
  Future<BagelUser?> _getUser() async {
    String? accessToken = await getAccessToken();
    Options options = Options(headers: {
      'Authorization': 'Bearer $accessToken',
      "Accept-Version": "v1"
    });
    String url = '$authEndpoint/user';
    try {
      Response res = await dio.get(url, options: options);
      return await _setUser(
        res.data["userID"],
        email: res.data["email"],
        phone: res.data["phone"],
      );
    } catch (err) {
      if (err is DioError) throw (err.response.toString());
    }
  }

  _storeBagelUser(BagelUser user) {
    _db
        .collection(Collections.user)
        .doc(Collections.user)
        .set({"userID": user.userID, "email": user.email, "phone": user.phone});
  }

  Future _storeTokens(data) async {
    String accessToken = data["access_token"],
        refreshToken = data["refresh_token"];
    int expires = data["expires_in"];
    await _db.collection(Collections.access).doc("access").set({
      "expires_in": DateTime.now().add(Duration(seconds: expires)).toString(),
      "accessToken": accessToken,
      "refreshToken": refreshToken
    });
  }

  // ignore: close_sinks
  StreamController<AuthEvent>? _userStateController;
  bool _stateControllerOpen = false;
  Stream<AuthEvent> get authStateChange {
    
    void startListen() async {
      _stateControllerOpen = true;
    }
    
    void stopListen() {
      _userStateController?.close();
      _stateControllerOpen = false;
    }

    _userStateController = StreamController<AuthEvent>.broadcast(
      onListen: startListen,
      onCancel: stopListen,
      sync: true,
    );
    return _userStateController!.stream;
  }

  Future<String?> _getRefreshToken() async {
    Map<String, dynamic>? refreshToken =
        await _db.collection(Collections.access).doc("access").get();
    return refreshToken?["refreshToken"];
  }

  Future<String?> getAccessToken() async {
    Map<String, dynamic>? accessToken =
        await _db.collection(Collections.access).doc("access").get();
    return accessToken?["accessToken"];
  }

  _setUser(userID, {String? email, String? phone}) {
    _user = BagelUser();
    if (email != null) _user!.email = email;
    if (phone != null) _user!.phone = phone;
    _user!.userID = userID;
    _storeBagelUser(_user!);
    if (_stateControllerOpen) {
      AuthEvent event = AuthEvent(user: _user, loggedin: true);
      _userStateController?.add(event);
    }
    return _user;
  }

  void _logout() async {
    _user = null;
    if (_stateControllerOpen) _userStateController?.add(AuthEvent());
    await _db.collection(Collections.access).doc("access").delete();
    await _db.collection(Collections.user).doc("user").delete();
  }

  /// Log the user out
  void logout() => _logout();

  /// is used to refresh the users auth token without having to login with username and password
  Future<Response> _refresh() async {
    if (await _getRefreshToken() == null) {
      throw ("Couldn't get refresh token");
    }

    String url = '$authEndpoint/user/token';
    String? refreshToken = await _getRefreshToken();
    String body =
        'grant_type=refresh_token&refresh_token=$refreshToken&client_id=project-client';
    try {
      Options options = Options(headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ${this.instance.token}',
        // "Accept-Version": "v1"
      });
      Response res = await dio.post(url, data: body, options: options);
      if (res.statusCode == 200) {
        await _storeTokens(res.data);
      }
      return res;
    } catch (err) {
      throw (err);
    }
  }
}
