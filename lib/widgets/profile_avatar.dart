import 'package:flutter/material.dart';
import 'package:telemedicine/services/session_manager.dart';
import 'package:telemedicine/theme/app_colors.dart';

class ProfileAvatar extends StatelessWidget {
  final double radius;
  final Color backgroundColor;

  const ProfileAvatar({
    super.key,
    this.radius = 20,
    this.backgroundColor = AppColors.primarySoft,
  });

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
          return _NetworkAvatar(
            radius: radius,
            backgroundColor: backgroundColor,
            url: _versionedUrl(photoUrl, version),
          );
        }

        return _FallbackAvatar(
          radius: radius,
          backgroundColor: backgroundColor,
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

class _NetworkAvatar extends StatelessWidget {
  final double radius;
  final Color backgroundColor;
  final String url;

  const _NetworkAvatar({
    required this.radius,
    required this.backgroundColor,
    required this.url,
  });

  @override
  Widget build(BuildContext context) {
    final size = radius * 2;

    return ClipOval(
      child: Container(
        width: size,
        height: size,
        color: backgroundColor,
        child: Image.network(
          url,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return _FallbackAvatar(
              radius: radius,
              backgroundColor: backgroundColor,
            );
          },
        ),
      ),
    );
  }
}

class _FallbackAvatar extends StatelessWidget {
  final double radius;
  final Color backgroundColor;

  const _FallbackAvatar({required this.radius, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: radius,
      backgroundColor: backgroundColor,
      child: Icon(Icons.person, color: AppColors.primary, size: radius),
    );
  }
}
