import 'dart:convert';
import 'package:dio/dio.dart';

class CurlInterceptor extends InterceptorsWrapper {
  CurlInterceptor({this.logCurl = false});

  final bool logCurl;

  @override
  Future<void> onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    if (logCurl) print(_generateCurlCommand(options));
    handler.next(options);
  }

  @override
  Future<void> onResponse(
      Response response, ResponseInterceptorHandler handler) async {
    handler.next(response);
  }

  @override
  Future<void> onError(
      DioException err, ErrorInterceptorHandler handler) async {
    handler.next(err);
  }

  String _generateCurlCommand(RequestOptions options) {
    List<String> components = [
      'curl',
      '-X',
      options.method,
      _escape(options.uri.toString())
    ];

    options.headers.forEach((key, value) {
      components.add('-H');
      components.add('\'$key: $value\'');
    });

    if (options.data != null) {
      final data = options.data is FormData
          ? options.data.fields.map((e) => '${e.key}=${e.value}').join('&')
          : json.encode(options.data);
      components.add('-d');
      components.add(_escape(data));
    }

    return components.join(' ');
  }

  String _escape(String string) {
    return "'$string'".replaceAll('\n', '\\n').replaceAll('\r', '\\r');
  }
}
