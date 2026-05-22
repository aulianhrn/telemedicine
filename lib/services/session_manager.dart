class SessionManager {
  static String? token;
  static Map<String, dynamic>? user;

  static bool get isLoggedIn => token != null;

  static void saveSession({
    required String authToken,
    required Map<String, dynamic> userData,
  }) {
    token = authToken;
    user = userData;
  }

  static void clear() {
    token = null;
    user = null;
  }
}
