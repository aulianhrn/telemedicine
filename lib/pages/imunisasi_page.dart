import 'package:flutter/material.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/services/formatters.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';
import 'package:telemedicine/widgets/notification_bell.dart';
import 'package:telemedicine/widgets/profile_avatar.dart';

class JadwalImunisasiPage extends StatefulWidget {
  final bool showBottomNavbar;

  const JadwalImunisasiPage({super.key, this.showBottomNavbar = true});

  @override
  State<JadwalImunisasiPage> createState() => _JadwalImunisasiPageState();
}

class _JadwalImunisasiPageState extends State<JadwalImunisasiPage> {
  late final Future<List<dynamic>> _imunisasiFuture;
  late DateTime _visibleMonth;

  @override
  void initState() {
    super.initState();
    _imunisasiFuture = ApiService.imunisasi();
    final now = DateTime.now();
    _visibleMonth = DateTime(now.year, now.month);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),

      // ================= APP BAR =================
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            const ProfileAvatar(radius: 20),

            const SizedBox(width: 12),

            const Text(
              "Posyandu Kita",
              style: TextStyle(
                color: Color(0xFF006E2F),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [const NotificationBell()],
      ),

      // ================= BODY =================
      body: FutureBuilder<List<dynamic>>(
        future: _imunisasiFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  snapshot.error.toString().replaceFirst('Exception: ', ''),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final items = snapshot.data ?? [];
          final nextItems = items
              .where((item) => item is Map && item['status'] == 'pending')
              .cast<Map>()
              .toList();
          final next = nextItems.isNotEmpty ? nextItems.first : null;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ================= HEADER =================
                const Text(
                  "Jadwal Imunisasi",
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),

                const SizedBox(height: 6),

                const Text(
                  "Pantau jadwal tumbuh kembang si kecil secara berkala.",
                  style: TextStyle(color: Colors.grey),
                ),

                const SizedBox(height: 20),

                // ================= CALENDAR =================
                _calendarCard(items: items, next: next),

                const SizedBox(height: 24),

                // ================= REMINDER =================
                const Text(
                  "PENGINGAT TERDEKAT",
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),

                const SizedBox(height: 10),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF006E2F),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green.shade300,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: const Text(
                          "Mendatang",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      Text(
                        next?['nama_vaksin']?.toString() ?? "Belum ada jadwal",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 12),

                      Row(
                        children: [
                          const Icon(
                            Icons.calendar_today,
                            color: Colors.white70,
                            size: 18,
                          ),

                          const SizedBox(width: 8),

                          Text(
                            displayDate(next?['tanggal_jadwal']),
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ],
                      ),

                      const SizedBox(height: 10),

                      Row(
                        children: const [
                          Icon(
                            Icons.location_on,
                            color: Colors.white70,
                            size: 18,
                          ),

                          SizedBox(width: 8),

                          Text(
                            "Posyandu Melati 04",
                            style: TextStyle(color: Colors.white70),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF006E2F),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          onPressed: () {},
                          child: const Text(
                            "Lihat Detail Lokasi",
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // ================= VAKSIN LIST =================
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text(
                      "RIWAYAT & DAFTAR VAKSIN",
                      style: TextStyle(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),

                    Text(
                      "Lihat Semua",
                      style: TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                if (items.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Text("Belum ada data imunisasi."),
                  )
                else
                  ...items.map((item) {
                    final data = Map<String, dynamic>.from(item as Map);
                    final done = data['status'] == 'selesai';
                    return vaksinItem(
                      title: data['nama_vaksin']?.toString() ?? '-',
                      subtitle: done
                          ? "Diberikan pada ${displayDate(data['tanggal_imunisasi'])}"
                          : "Jadwal: ${displayDate(data['tanggal_jadwal'])}",
                      status: done ? "Selesai" : "Mendatang",
                      done: done,
                    );
                  }),

                const SizedBox(height: 90),
              ],
            ),
          );
        },
      ),

      // ================= BOTTOM NAVIGATION =================
      bottomNavigationBar: widget.showBottomNavbar
          ? const BottomNavbar(currentIndex: 1)
          : null,
    );
  }

  Widget _calendarCard({required List<dynamic> items, required Map? next}) {
    final firstDay = DateTime(_visibleMonth.year, _visibleMonth.month);
    final startDate = firstDay.subtract(Duration(days: firstDay.weekday - 1));
    final days = List.generate(
      42,
      (index) => startDate.add(Duration(days: index)),
    );
    final markedDates = _markedDates(items);
    final selectedDate = _parseDate(next?['tanggal_jadwal']);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE8EEF4)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _monthTitle(_visibleMonth),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0B1C30),
                  ),
                ),
              ),
              _monthButton(
                icon: Icons.chevron_left,
                onPressed: () => _changeMonth(-1),
              ),
              const SizedBox(width: 6),
              _monthButton(
                icon: Icons.chevron_right,
                onPressed: () => _changeMonth(1),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: const [
              _WeekdayLabel("Sen"),
              _WeekdayLabel("Sel"),
              _WeekdayLabel("Rab"),
              _WeekdayLabel("Kam"),
              _WeekdayLabel("Jum"),
              _WeekdayLabel("Sab"),
              _WeekdayLabel("Min"),
            ],
          ),
          const SizedBox(height: 10),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: days.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
              childAspectRatio: 1,
            ),
            itemBuilder: (context, index) {
              final day = days[index];
              return _calendarDay(
                day: day,
                currentMonth: day.month == _visibleMonth.month,
                selected: _isSameDate(day, selectedDate),
                today: _isSameDate(day, DateTime.now()),
                marked: markedDates[_dateKey(day)],
              );
            },
          ),
          const SizedBox(height: 14),
          Row(
            children: const [
              _LegendDot(color: Color(0xFF006E2F), label: "Jadwal terdekat"),
              SizedBox(width: 16),
              _LegendDot(color: Colors.blue, label: "Ada imunisasi"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _monthButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: 36,
      height: 36,
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, size: 22),
        padding: EdgeInsets.zero,
        style: IconButton.styleFrom(
          backgroundColor: const Color(0xFFF1F5FF),
          foregroundColor: const Color(0xFF006E2F),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
    );
  }

  Widget _calendarDay({
    required DateTime day,
    required bool currentMonth,
    required bool selected,
    required bool today,
    required String? marked,
  }) {
    final hasMark = marked != null;
    final textColor = selected
        ? Colors.white
        : currentMonth
        ? const Color(0xFF0B1C30)
        : Colors.grey.shade400;

    return Container(
      decoration: BoxDecoration(
        color: selected ? const Color(0xFF006E2F) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        border: today && !selected
            ? Border.all(color: const Color(0xFF006E2F), width: 1.5)
            : null,
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Text(
            '${day.day}',
            style: TextStyle(
              color: textColor,
              fontWeight: selected || today ? FontWeight.bold : FontWeight.w500,
            ),
          ),
          if (hasMark)
            Positioned(
              bottom: 7,
              child: Container(
                width: 5,
                height: 5,
                decoration: BoxDecoration(
                  color: selected ? Colors.white : Colors.blue,
                  shape: BoxShape.circle,
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _changeMonth(int offset) {
    setState(() {
      _visibleMonth = DateTime(
        _visibleMonth.year,
        _visibleMonth.month + offset,
      );
    });
  }

  Map<String, String> _markedDates(List<dynamic> items) {
    final result = <String, String>{};
    for (final item in items) {
      if (item is! Map) {
        continue;
      }

      final date = _parseDate(
        item['tanggal_jadwal'] ?? item['tanggal_imunisasi'],
      );
      if (date != null) {
        result[_dateKey(date)] = item['status']?.toString() ?? 'imunisasi';
      }
    }
    return result;
  }

  DateTime? _parseDate(dynamic value) {
    if (value == null) {
      return null;
    }

    final parsed = DateTime.tryParse(value.toString());
    return parsed == null
        ? null
        : DateTime(parsed.year, parsed.month, parsed.day);
  }

  bool _isSameDate(DateTime date, DateTime? other) {
    return other != null &&
        date.year == other.year &&
        date.month == other.month &&
        date.day == other.day;
  }

  String _dateKey(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  String _monthTitle(DateTime date) {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    return '${months[date.month - 1]} ${date.year}';
  }

  // ================= VAKSIN ITEM =================
  Widget vaksinItem({
    required String title,
    required String subtitle,
    required String status,
    required bool done,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: done ? Colors.green.shade100 : Colors.blue.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              done ? Icons.check_circle : Icons.schedule,
              color: done ? Colors.green : Colors.blue,
            ),
          ),

          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),

                const SizedBox(height: 4),

                Text(subtitle, style: const TextStyle(color: Colors.grey)),
              ],
            ),
          ),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: done ? Colors.green.shade100 : Colors.blue.shade100,
              borderRadius: BorderRadius.circular(30),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: done ? Colors.green : Colors.blue,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _WeekdayLabel extends StatelessWidget {
  final String label;

  const _WeekdayLabel(this.label);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Center(
        child: Text(
          label,
          style: const TextStyle(
            color: Color(0xFF6D7B6C),
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(color: Color(0xFF6D7B6C), fontSize: 12),
        ),
      ],
    );
  }
}
