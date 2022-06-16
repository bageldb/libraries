import 'dart:async';
import '../bagel_db.dart';
import 'package:dio/dio.dart';
import 'bagel_db_functions.dart';
import 'bage_db_shared_prefs.dart';

String authEndpoint = "https://auth.bageldb.com/api/public";

class Collections {
  static String user = "user";
  static String access = "access";
  static String nonce = "nonce";
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
  late final SP _sp = SP();
  BagelUser? _user;
  BagelUser? get user => _user;
  BagelUsersRequest(this.instance) {
    dio = Dio(BaseOptions(headers: {
      'Authorization': 'Bearer ${instance.token}',
      "Accept-Version": "v1"
    }));
    _getLocalUser();
  }

  _getLocalUser() async {
    await _sp.init();
    Map usr = _sp.get(Collections.user);
    _userHandler(usr);
  }

  final StreamController<AuthEvent> _userStateController =
      StreamController<AuthEvent>.broadcast(
    sync: true,
  );

  Stream<AuthEvent> get authStateChange {
    _getLocalUser();
    return _userStateController.stream;
  }

  @Deprecated(
      'use the getter [user] to get BagelUser or Null to determine if a user is logged in')
  Future<bool> isLoggedIn() async {
    return _user != null;
  }

  @Deprecated('use the getter [user] instead to get the current user')
  BagelUser? getUser() {
    return _user;
  }

  @Deprecated(
      "use the getter [user] instead to get the currenly logged in BagelUser")
  String? getUserID() {
    return _user?.userID;
  }

  void _userHandler(usr) async {
    if (usr.isEmpty) {
      // user has logged out
      _userStateController.add(AuthEvent(loggedin: false));
      return;
    }
    Map<String, dynamic>? access = _sp.get(Collections.access);
    if (access.isEmpty) return _logout();

    try {
      DateTime now = DateTime.now();
      DateTime expiryTime = DateTime.parse(access["expires_in"]);
      if (now.isAfter(expiryTime)) await _refresh();
    } catch (err) {
      rethrow;
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
    return null;
  }

  Future<String> _getOtpRequestNonce() async {
    Map<String, dynamic>? otpRequest = _sp.get(Collections.nonce);
    if (otpRequest.isNotEmpty) {
      DateTime expiryTime = DateTime.parse(otpRequest["expires_in"]);
      if (DateTime.now().isAfter(expiryTime)) {
        throw ("OTP request has expired, try again");
      }
      return otpRequest["nonce"];
    } else {
      return "";
    }
  }

  _storeOtpRequestNonce(Map otpRequest) {
    DateTime expires =
        DateTime.now().add(Duration(seconds: otpRequest["expires_in"]));
    _sp.set(Collections.nonce,
        {"expires_in": expires.toString(), "nonce": otpRequest["nonce"]});
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
    return null;
  }

  /// Sends the OTP message again via a different provider when the user did not receive the message
  Future<String?> resendOtp() async {
    String nonce = await _getOtpRequestNonce();
    try {
      String url = '$authEndpoint/user/otp/resend/$nonce';
      Response res = await dio.post(url);
      _storeOtpRequestNonce(res.data);
      return res.data["nonce"];
    } catch (e) {
      if (e is DioError) throw (e.response.toString());
    }
    return null;
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
    return null;
  }

  Future<void> requestPasswordReset(String email) async {
    String url = '$authEndpoint/user/resetpassword';
    Map body = {"email": email};
    try {
      await dio.post(url, data: body);
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
    return null;
  }

  _storeBagelUser(BagelUser user) {
    _sp.set(Collections.user,
        {"userID": user.userID, "email": user.email, "phone": user.phone});
  }

  Future _storeTokens(data) async {
    String accessToken = data["access_token"],
        refreshToken = data["refresh_token"];
    int expires = data["expires_in"];
    _sp.set(Collections.access, {
      "expires_in": DateTime.now().add(Duration(seconds: expires)).toString(),
      "accessToken": accessToken,
      "refreshToken": refreshToken
    });
  }

  Future<String?> _getRefreshToken() async {
    Map<String, dynamic>? refreshToken = _sp.get(Collections.access);
    return refreshToken["refreshToken"];
  }

  Future<String?> getAccessToken() async {
    Map<String, dynamic>? accessToken = _sp.get(Collections.access);
    return accessToken["accessToken"];
  }

  _setUser(userID, {String? email, String? phone}) {
    _user = BagelUser();
    if (email != null) _user!.email = email;
    if (phone != null) _user!.phone = phone;
    _user!.userID = userID;
    _storeBagelUser(_user!);
    AuthEvent event = AuthEvent(user: _user, loggedin: true);
    _userStateController.add(event);
    return _user;
  }

  void _logout() async {
    _user = null;
    _userStateController.add(AuthEvent());
    await _sp.delete(Collections.access);
    await _sp.delete(Collections.user);
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
        'Authorization': 'Bearer ${instance.token}',
        // "Accept-Version": "v1"
      });
      Response res = await dio.post(url, data: body, options: options);
      if (res.statusCode == 200) {
        await _storeTokens(res.data);
      }
      return res;
    } catch (err) {
      rethrow;
    }
  }
}
