import 'package:flutter/foundation.dart';

class SessionManager {
  static String? token;
  static Map<String, dynamic>? user;
  static Uint8List? profilePhotoBytes;
  static final ValueNotifier<int> profilePhotoVersion = ValueNotifier<int>(0);

  static bool get isLoggedIn => token != null;
  static bool get hasProfilePhoto =>
      profilePhotoBytes != null || profilePhotoUrl != null;

  static String? get profilePhotoUrl {
    final url = user?['ava_pict_url'] ?? user?['ava_pict'];
    final value = url?.toString().trim();
    return value == null || value.isEmpty ? null : value;
  }

  static void saveSession({
    required String authToken,
    required Map<String, dynamic> userData,
  }) {
    token = authToken;
    user = userData;
    profilePhotoBytes = null;
    profilePhotoVersion.value++;
  }

  static void updateUser(Map<String, dynamic> userData) {
    user = {...?user, ...userData};
    profilePhotoBytes = null;
    profilePhotoVersion.value++;
  }

  static void clear() {
    token = null;
    user = null;
    profilePhotoBytes = null;
    profilePhotoVersion.value++;
  }

  static void saveProfilePhoto(Uint8List photoBytes) {
    profilePhotoBytes = photoBytes;
    profilePhotoVersion.value++;
  }

  static void clearProfilePhoto() {
    profilePhotoBytes = null;
    profilePhotoVersion.value++;
  }
}
