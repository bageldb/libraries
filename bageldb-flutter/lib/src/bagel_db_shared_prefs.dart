import 'package:shared_preferences/shared_preferences.dart';

class SP {
  late SharedPreferences instance;
  bool hasInit = false;
  Future<SharedPreferences> init() async {
    instance = await SharedPreferences.getInstance();
    hasInit = true;
    return instance;
  }

  Map<String, dynamic> get(String key) {
    if (!hasInit) throw ("Must init BagelDB before running");
    final res = <String, dynamic>{};
    String? str = instance.getString(key);
    if (str == null) return res;
    for (String keyValue in str.split(';;;')) {
      List<String> kv = keyValue.split(':::');
      String k = kv[0];
      String v = kv[1];
      res[k] = v;
    }
    return res;
  }

  delete(String key) async {
    await instance.remove(key);
  }

  set(String key, Map<String, dynamic> value) {
    List<String> vals = [];
    for (var k in value.keys) {
      vals.add('$k:::${value[k]}');
    }
    instance.setString(key, vals.join(';;;'));
  }
}
