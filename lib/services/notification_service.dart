import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:telemedicine/services/api_service.dart';

class NotificationService {
  const NotificationService._();

  static String? _registeredToken;

  static Future<void> setupAfterAuth() async {
    if (kIsWeb) {
      return;
    }

    try {
      await _ensureFirebaseInitialized();
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();

      final token = await messaging.getToken();
      if (token == null || token.isEmpty) {
        return;
      }

      _registeredToken = token;
      await ApiService.registerDeviceToken(
        fcmToken: token,
        platform: _platformName,
      );

      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
        _registeredToken = newToken;
        await ApiService.registerDeviceToken(
          fcmToken: newToken,
          platform: _platformName,
        );
      });
    } catch (error) {
      debugPrint('Notification setup skipped: $error');
    }
  }

  static Future<void> unregisterCurrentDevice() async {
    final token = _registeredToken;
    if (token == null || token.isEmpty) {
      return;
    }

    try {
      await ApiService.unregisterDeviceToken(token);
      _registeredToken = null;
    } catch (error) {
      debugPrint('Notification unregister skipped: $error');
    }
  }

  static Future<void> _ensureFirebaseInitialized() async {
    if (Firebase.apps.isNotEmpty) {
      return;
    }

    await Firebase.initializeApp();
  }

  static String get _platformName {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'android';
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return 'ios';
    }

    return defaultTargetPlatform.name;
  }
}
