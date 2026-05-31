import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/models/app_notification.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/theme/app_colors.dart';

class NotificationBell extends StatelessWidget {
  final Color color;

  const NotificationBell({super.key, this.color = AppColors.primary});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<NotificationListResult>(
      future: ApiService.notifications(limit: 1),
      builder: (context, snapshot) {
        final unreadCount = snapshot.data?.unreadCount ?? 0;

        return IconButton(
          onPressed: () =>
              Navigator.pushNamed(context, AppRoutes.notifications),
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(Icons.notifications_outlined, color: color),
              if (unreadCount > 0)
                Positioned(
                  right: -2,
                  top: -4,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 16),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 4,
                      vertical: 2,
                    ),
                    decoration: const BoxDecoration(
                      color: AppColors.danger,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      unreadCount > 9 ? '9+' : '$unreadCount',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
