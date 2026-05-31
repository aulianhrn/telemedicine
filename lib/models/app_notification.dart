class AppNotification {
  final int id;
  final String title;
  final String body;
  final String type;
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime? createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.data,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: _asInt(json['id']) ?? 0,
      title: json['judul']?.toString() ?? json['title']?.toString() ?? '-',
      body: json['isi']?.toString() ?? json['body']?.toString() ?? '-',
      type: json['tipe']?.toString() ?? json['type']?.toString() ?? 'info',
      data: _asMap(json['data']),
      isRead: json['is_read'] == true || json['is_read'] == 1,
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
    );
  }
}

class NotificationListResult {
  final int unreadCount;
  final List<AppNotification> items;

  const NotificationListResult({
    required this.unreadCount,
    required this.items,
  });

  factory NotificationListResult.fromJson(Map<String, dynamic> json) {
    final rawItems = json['data'];

    return NotificationListResult(
      unreadCount: _asInt(json['unread_count']) ?? 0,
      items: rawItems is List
          ? rawItems
                .whereType<Map>()
                .map(
                  (item) =>
                      AppNotification.fromJson(Map<String, dynamic>.from(item)),
                )
                .toList()
          : <AppNotification>[],
    );
  }
}

int? _asInt(Object? value) {
  if (value is int) {
    return value;
  }

  return int.tryParse(value?.toString() ?? '');
}

Map<String, dynamic> _asMap(Object? value) {
  if (value is Map<String, dynamic>) {
    return value;
  }

  if (value is Map) {
    return Map<String, dynamic>.from(value);
  }

  return {};
}
