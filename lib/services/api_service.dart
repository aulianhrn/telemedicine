import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:telemedicine/services/session_manager.dart';

class ApiService {
  static String get baseUrl {
    const configured = String.fromEnvironment('API_BASE_URL');

    if (configured.isNotEmpty) {
      return configured;
    }

    return 'https://backend-255520032221.us-central1.run.app/api';
  }

  static Map<String, String> get _headers {
    final headers = {'Content-Type': 'application/json'};
    final token = SessionManager.token;
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  static Map<String, String> get _authHeaders {
    final token = SessionManager.token;
    return token == null ? {} : {'Authorization': 'Bearer $token'};
  }

  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = _decodeMap(response);
    if (response.statusCode != 200) {
      throw Exception(data['message'] ?? 'Login gagal');
    }

    SessionManager.saveSession(
      authToken: data['token'] as String,
      userData: _normalizeUserAvatar(
        Map<String, dynamic>.from(data['user'] as Map),
      ),
    );

    return data;
  }

  static Future<Map<String, dynamic>> register({
    required String nama,
    required String email,
    required String password,
    required String nik,
    String? noHp,
    String? alamat,
    String? tanggalLahir,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'nama': nama,
        'email': email,
        'password': password,
        'role': 'ibu',
        'nik': nik,
        'no_hp': noHp,
        'alamat': alamat,
        'tanggal_lahir': tanggalLahir,
      }),
    );

    final data = _decodeMap(response);
    if (response.statusCode != 201) {
      throw Exception(data['message'] ?? 'Registrasi gagal');
    }

    SessionManager.saveSession(
      authToken: data['token'] as String,
      userData: _normalizeUserAvatar(
        Map<String, dynamic>.from(data['user'] as Map),
      ),
    );

    return data;
  }

  static Future<Map<String, dynamic>> me() async {
    final data = await _getMap('/auth/me');
    final user = _extractUser(data);
    if (user != null) {
      SessionManager.updateUser(_normalizeUserAvatar(user));
    }
    return data;
  }

  static Future<Map<String, dynamic>> uploadProfileAvatar({
    required Uint8List photoBytes,
    required String fileName,
    required bool replaceExisting,
  }) async {
    final request = http.MultipartRequest(
      replaceExisting ? 'PATCH' : 'POST',
      Uri.parse('$baseUrl/auth/me/avatar'),
    );

    request.headers.addAll(_authHeaders);
    request.files.add(
      http.MultipartFile.fromBytes(
        'ava_pict',
        photoBytes,
        filename: fileName,
        contentType: _avatarMediaType(fileName),
      ),
    );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    final data = _decodeMap(response);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['message'] ?? 'Upload foto profil gagal');
    }

    final user = _extractUser(data);
    if (user != null) {
      SessionManager.updateUser(_normalizeUserAvatar(user));
    }

    return data;
  }

  static Future<Map<String, dynamic>> dashboard() => _getMap('/dashboard');

  static Future<List<dynamic>> anak() => _getList('/anak');

  static Future<List<dynamic>> imunisasi({int? anakId}) {
    final query = anakId == null ? '' : '?anak_id=$anakId';
    return _getList('/imunisasi$query');
  }

  static Future<List<dynamic>> pemeriksaan({int? anakId}) {
    final query = anakId == null ? '' : '?anak_id=$anakId';
    return _getList('/pemeriksaan$query');
  }

  static Future<Map<String, dynamic>> _getMap(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
    );
    final data = _decodeMap(response);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['message'] ?? 'Request gagal');
    }
    return data;
  }

  static Future<List<dynamic>> _getList(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
    );
    final data = jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        data is Map ? data['message'] ?? 'Request gagal' : 'Request gagal',
      );
    }
    return data as List<dynamic>;
  }

  static Map<String, dynamic> _decodeMap(http.Response response) {
    if (response.body.isEmpty) {
      return {};
    }
    return Map<String, dynamic>.from(jsonDecode(response.body) as Map);
  }

  static Map<String, dynamic>? _extractUser(Map<String, dynamic> data) {
    final user = data['user'];
    if (user is Map) {
      return Map<String, dynamic>.from(user);
    }

    final nestedData = data['data'];
    if (nestedData is Map) {
      final nestedUser = nestedData['user'];
      if (nestedUser is Map) {
        return Map<String, dynamic>.from(nestedUser);
      }

      if (_looksLikeUser(nestedData)) {
        return Map<String, dynamic>.from(nestedData);
      }
    }

    return _looksLikeUser(data) ? Map<String, dynamic>.from(data) : null;
  }

  static bool _looksLikeUser(Map<dynamic, dynamic> data) {
    return data.containsKey('id') ||
        data.containsKey('nama') ||
        data.containsKey('email') ||
        data.containsKey('ava_pict') ||
        data.containsKey('ava_pict_url');
  }

  static Map<String, dynamic> _normalizeUserAvatar(Map<String, dynamic> user) {
    final avatarUrl = user['ava_pict_url'] != null
        ? _resolvePublicUrl(user['ava_pict_url'])
        : _resolveProfileFileUrl(user['ava_pict']);
    if (avatarUrl == null) {
      return user;
    }

    return {...user, 'ava_pict_url': avatarUrl};
  }

  static String? _resolvePublicUrl(Object? rawUrl) {
    final url = rawUrl?.toString().trim();
    if (url == null || url.isEmpty) {
      return null;
    }

    final uri = Uri.tryParse(url);
    if (uri != null && uri.hasScheme) {
      return url;
    }

    final apiUri = Uri.parse(baseUrl);
    final publicOrigin = apiUri.replace(path: '', query: null, fragment: null);
    final publicPath = url.startsWith('/') ? url : '/$url';
    return publicOrigin.resolve(publicPath).toString();
  }

  static String? _resolveProfileFileUrl(Object? fileName) {
    final value = fileName?.toString().trim();
    if (value == null || value.isEmpty) {
      return null;
    }

    final uri = Uri.tryParse(value);
    if (uri != null && uri.hasScheme) {
      return value;
    }

    if (value.startsWith('/')) {
      return _resolvePublicUrl(value);
    }

    return _resolvePublicUrl('/uploads/profile/$value');
  }

  static MediaType _avatarMediaType(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();

    return switch (extension) {
      'png' => MediaType('image', 'png'),
      'gif' => MediaType('image', 'gif'),
      'webp' => MediaType('image', 'webp'),
      'heic' => MediaType('image', 'heic'),
      'heif' => MediaType('image', 'heif'),
      _ => MediaType('image', 'jpeg'),
    };
  }
}
