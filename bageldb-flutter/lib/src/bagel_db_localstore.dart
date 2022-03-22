import 'package:hive/hive.dart';
import 'package:universal_io/io.dart';

abstract class IStorageColl {
  IStorageDoc doc(String name);
}

abstract class IStorageDoc {
  Future<Map<String, dynamic>?> get();
  Future set(Map<String, dynamic> data);
  Future delete();
}

abstract class IStorage {
  IStorageColl collection(String name);

  Future<Map<String, dynamic>?> get(String docPath);
  Future set(String docPath, Map<String, dynamic> data);
  Future delete(String docPath);
}

class LocalStoreDoc implements IStorageDoc {
  final String docName;
  final String collName;

  LocalStoreDoc(this.collName, this.docName);

  String get docId => '${collName}_$docName';

  @override
  Future<Map<String, dynamic>?> get() async {
    return LocalStore.instance.get(docId);
  }

  @override
  Future set(Map<String, dynamic> data) async {
    return await LocalStore.instance.set(docId, data);
  }

  @override
  Future delete() async {
    return await LocalStore.instance.delete(docId);
  }
}

class LocalStoreColl implements IStorageColl {
  final String name;
  LocalStoreColl(this.name);

  @override
  IStorageDoc doc(String docName) {
    return LocalStoreDoc(name, docName);
  }
}

class LocalStore implements IStorage {
  static LocalStore? _instance;

  Box<Map<dynamic, dynamic>>? _box;
  String _path = Directory.systemTemp.path;
  bool _isOpen = false;

  LocalStore._() {}

  static Future open(String path) async {
    instance._path = path;
    Hive..init(path);
    instance._box = await Hive.openBox<Map<dynamic, dynamic>>('bageldb_box');
    instance._isOpen = true;
  }

  static LocalStore get instance {
    return _instance ??= LocalStore._();
  }

  @override
  IStorageColl collection(String name) {
    return LocalStoreColl(name);
  }

  @override
  Future delete(String docPath) async {
    if (!_isOpen) await open(_path);
    await _box?.delete(docPath);
  }

  @override
  Future<Map<String, dynamic>?> get(String docPath) async {
    if (!_isOpen) await open(_path);
    var val = _box?.get(docPath);
    print('HIVE: get $docPath $val');
    return val == null
        ? Future.value(null)
        : Future.value(Map<String, dynamic>.from(val));
  }

  @override
  Future set(String docPath, Map<String, dynamic> data) async {
    if (!_isOpen) await open(_path);
    print('HIVE: set $docPath $data');
    await _box?.put(docPath, data);
  }
}
