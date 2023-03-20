import 'dart:async';
import '../bagel_db.dart';
import 'package:dio/dio.dart';
import 'bagel_db_functions.dart';

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
  BagelUser? _user;
  BagelUser? get user => _user;
  BagelUsersRequest(this.instance) {
    dio = Dio(BaseOptions(headers: {
      'Authorization': 'Bearer ${instance.token}',
      "Accept-Version": "v1"
    }));
  }

  init() async {
    await _getLocalUser();
  }

  _getLocalUser() async {
    Map usr = instance.sp.get(Collections.user);
    await _userHandler(usr);
  }

  String? _getUserID() {
    Map usr = instance.sp.get(Collections.user);
    return usr["userID"];
  }

  StreamController<AuthEvent>? _userStateController;

  Stream<AuthEvent> authStateChange() {
    if (_userStateController == null || _userStateController!.isClosed)
      _userStateController = StreamController<AuthEvent>.broadcast(
          onListen: () => _getLocalUser(),
          onCancel: () => _userStateController?.close(),
          sync: true);
    return _userStateController!.stream;
  }

  @Deprecated(
      'use the getter [user] to get BagelUser or Null to determine if a user is logged in')
  bool isLoggedIn() {
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

  _userHandler(usr) async {
    if (usr.isEmpty) {
      // user has logged out
      _userStateController?.sink.add(AuthEvent());
      return;
    }
    Map<String, dynamic>? access = instance.sp.get(Collections.access);
    if (access.isEmpty) return _logout();
    try {
      DateTime now = DateTime.now();
      DateTime expiryTime = DateTime.parse(access["expires_in"]);
      if (now.isAfter(expiryTime)) await _refresh();
    } catch (err) {
      rethrow;
    }
    _setUser(usr["userID"], email: usr["email"], phone: usr["phone"]);
  }

  /// Create a user with a an email and password
  Future<BagelUser?> create(email, password) async {
    String url = '$authEndpoint/user';
    Map body = {"email": email, "password": password};
    try {
      Response res = await dio.post(url, data: body);
      _storeTokens(res.data);
      return _setUser(res.data["user_id"], email: email);
    } catch (err) {
      if (err is DioError) throw (err.response.toString());
    }
    return null;
  }

  String? _getOtpRequestNonce() {
    Map<String, dynamic>? otpRequest = instance.sp.get(Collections.nonce);
    if (otpRequest.isNotEmpty) {
      DateTime expiryTime = DateTime.parse(otpRequest["expires_in"]);
      if (DateTime.now().isAfter(expiryTime)) {
        throw ("OTP request has expired, try again");
      }
      return otpRequest["nonce"];
    } else {
      return null;
    }
  }

  _storeOtpRequestNonce(Map otpRequest) {
    DateTime expires =
        DateTime.now().add(Duration(seconds: otpRequest["expires_in"]));
    instance.sp.set(Collections.nonce,
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
    String? nonce = _getOtpRequestNonce();
    if (nonce == null)
      throw ("Couldn't find OTP nonce, please run requestOTP first");
    String url = '$authEndpoint/user/otp/verify/$nonce';
    Map body = {"otp": otp};
    try {
      Response res = await dio.post(url, data: body);
      _storeTokens(res.data);
      return _getUser();
    } catch (e) {
      if (e is DioError) throw (e.response.toString());
    }
    return null;
  }

  /// Sends the OTP message again via a different provider when the user did not receive the message
  Future<String?> resendOtp() async {
    String? nonce = _getOtpRequestNonce();
    if (nonce == null)
      throw ("Couldn't find OTP nonce, please run requestOTP first");
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

  /// When the user is logged in via email and password, requesting a password reset will send them an email with a link to reset their password.
  Future<void> requestPasswordReset(String email) async {
    String url = '$authEndpoint/user/resetpassword';
    Map body = {"email": email};
    try {
      await dio.post(url, data: body);
    } catch (e) {
      if (e is DioError) throw (e.response.toString());
    }
  }

  /// This method can delete a user in one of 2 situations: the first is an authenticated deleting themselves (do not provide [userID]). The second is an admin deleting a user using an admin token. When a [userID], the method will assume the instance token has Admin access.
  Future<void> deleteUser({String? userID}) async {
    String? token;
    if (userID != null)
      token = instance.token;
    else {
      token = getAccessToken();
      userID = _getUserID();
    }
    if (token == null || userID == null)
      throw ("UserID not provided, a user must be authenticated or userID provided");

    Options options = Options(
        headers: {'Authorization': 'Bearer $token', "Accept-Version": "v1"});

    String url = '$authEndpoint/user/$userID';
    try {
      await Dio().delete(url, options: options);
      return _logout();
    } catch (err) {
      if (err is DioError) throw (err.response.toString());
    }
    return;
  }

  /// Get the currently logged in user's info
  Future<BagelUser?> _getUser() async {
    String? accessToken = getAccessToken();
    Options options = Options(headers: {
      'Authorization': 'Bearer $accessToken',
      "Accept-Version": "v1"
    });
    String url = '$authEndpoint/user';
    try {
      Response res = await dio.get(url, options: options);
      return _setUser(
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
    instance.sp.set(Collections.user,
        {"userID": user.userID, "email": user.email, "phone": user.phone});
  }

  Future _storeTokens(data) async {
    String accessToken = data["access_token"],
        refreshToken = data["refresh_token"];
    int expires = data["expires_in"];
    instance.sp.set(Collections.access, {
      "expires_in": DateTime.now().add(Duration(seconds: expires)).toString(),
      "accessToken": accessToken,
      "refreshToken": refreshToken
    });
  }

  Future<String?> _getRefreshToken() async {
    Map<String, dynamic>? refreshToken = instance.sp.get(Collections.access);
    return refreshToken["refreshToken"];
  }

  String? getAccessToken() {
    Map<String, dynamic>? accessToken = instance.sp.get(Collections.access);
    return accessToken["accessToken"];
  }

  _setUser(userID, {String? email, String? phone}) {
    _user = BagelUser();
    if (email != null) _user!.email = email;
    if (phone != null) _user!.phone = phone;
    _user!.userID = userID;
    _storeBagelUser(_user!);
    AuthEvent event = AuthEvent(user: _user, loggedin: true);
    _userStateController?.sink.add(event);
    return _user;
  }

  void _logout() {
    _user = null;
    _userStateController?.sink.add(AuthEvent());
    instance.sp.delete(Collections.access);
    instance.sp.delete(Collections.user);
  }

  /// Log the user out
  void logout() => _logout();

  /// is used to refresh the users auth token without having to login with username and password
  Future<Response?> _refresh() async {
    if (await _getRefreshToken() == null) {
      _logout();
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
      _logout();
    }
    return null;
  }
}
