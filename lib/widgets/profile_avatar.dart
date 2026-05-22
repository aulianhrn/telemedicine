import 'package:flutter/material.dart';
import 'package:telemedicine/services/session_manager.dart';

class ProfileAvatar extends StatelessWidget {
  final double radius;
  final Color backgroundColor;

  const ProfileAvatar({
    super.key,
    this.radius = 20,
    this.backgroundColor = const Color(0xFFE5EEFF),
  });

  static const String fallbackImageUrl = "https://i.pravatar.cc/300?img=32";

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: SessionManager.profilePhotoVersion,
      builder: (context, version, _) {
        final photoBytes = SessionManager.profilePhotoBytes;
        final photoUrl = SessionManager.profilePhotoUrl;

        if (photoBytes != null) {
          return CircleAvatar(
            radius: radius,
            backgroundColor: backgroundColor,
            backgroundImage: MemoryImage(photoBytes),
          );
        }

        if (photoUrl != null) {
          return CircleAvatar(
            radius: radius,
            backgroundColor: backgroundColor,
            backgroundImage: NetworkImage(_versionedUrl(photoUrl, version)),
          );
        }

        return CircleAvatar(
          radius: radius,
          backgroundColor: backgroundColor,
          backgroundImage: const NetworkImage(fallbackImageUrl),
        );
      },
    );
  }

  String _versionedUrl(String url, int version) {
    final uri = Uri.tryParse(url);
    if (uri == null) {
      return url;
    }

    return uri
        .replace(queryParameters: {...uri.queryParameters, 'v': '$version'})
        .toString();
  }
}
