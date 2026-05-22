import 'dart:typed_data';

class SessionManager {
  static String? token;
  static Map<String, dynamic>? user;
  static Uint8List? profilePhotoBytes;

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
    profilePhotoBytes = null;
  }

  static void saveProfilePhoto(Uint8List photoBytes) {
    profilePhotoBytes = photoBytes;
  }

  static void clearProfilePhoto() {
    profilePhotoBytes = null;
  }
}
