import 'dart:convert';
import 'package:http/http.dart' as http;
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
      userData: Map<String, dynamic>.from(data['user'] as Map),
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
      userData: Map<String, dynamic>.from(data['user'] as Map),
    );

    return data;
  }

  static Future<Map<String, dynamic>> me() => _getMap('/auth/me');

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
}
