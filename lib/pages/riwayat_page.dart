import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/models/growth_summary.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/services/formatters.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';
import 'package:telemedicine/widgets/growth_summary_widgets.dart';
import 'package:telemedicine/widgets/profile_avatar.dart';

class RiwayatPage extends StatefulWidget {
  final bool showBottomNavbar;
  final VoidCallback? onBackToHome;

  const RiwayatPage({
    super.key,
    this.showBottomNavbar = true,
    this.onBackToHome,
  });

  @override
  State<RiwayatPage> createState() => _RiwayatPageState();
}

class _RiwayatPageState extends State<RiwayatPage> {
  late final Future<_RiwayatData> _riwayatFuture;
  int? _selectedChildId;

  @override
  void initState() {
    super.initState();
    _riwayatFuture = _loadRiwayatData();
  }

  Future<_RiwayatData> _loadRiwayatData() async {
    final results = await Future.wait([
      ApiService.anak(),
      ApiService.pemeriksaan(),
    ]);
    final children = results[0]
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    final items = results[1]
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    return _RiwayatData(children: children, items: items);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF006E2F)),
          onPressed: () {
            if (widget.onBackToHome != null) {
              widget.onBackToHome!();
              return;
            }

            Navigator.pushReplacementNamed(context, AppRoutes.home);
          },
        ),
        title: const Text(
          "Riwayat Pemeriksaan",
          style: TextStyle(
            color: Color(0xFF006E2F),
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: ProfileAvatar(radius: 18),
          ),
        ],
      ),
      body: FutureBuilder<_RiwayatData>(
        future: _riwayatFuture,
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

          final data = snapshot.data!;
          _selectedChildId ??= data.children.isEmpty
              ? null
              : _childId(data.children.first);
          final items = _sortByLatestCheckup(
            _filterBySelectedChild(data.items, data.children),
          );
          final first = items.isEmpty
              ? null
              : Map<String, dynamic>.from(items.first as Map);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.green.shade100,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.child_care,
                          color: Colors.green,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              first?['nama_anak']?.toString() ??
                                  "Belum ada data",
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade100,
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Text(
                                  "Status: ${first?['status_gizi'] ?? '-'}",
                                  style: const TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              first == null
                                  ? "-"
                                  : "Pemeriksaan terakhir ${displayDate(first['tanggal_pemeriksaan'])}",
                              style: const TextStyle(color: Colors.grey),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              "Terdaftar di Posyandu Melati",
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                if (data.children.length > 1) ...[
                  _childDropdown(data.children),
                  const SizedBox(height: 14),
                ],
                _nutritionStatusSection(first),
                const SizedBox(height: 24),
                if (items.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text("Belum ada riwayat pemeriksaan."),
                  )
                else
                  ...items.map((item) {
                    final data = Map<String, dynamic>.from(item as Map);
                    final status =
                        data['status_gizi']?.toString().toLowerCase() ?? '';
                    final isGood =
                        status.contains('baik') || status.contains('normal');

                    return timelineItem(
                      date: displayDate(data['tanggal_pemeriksaan']),
                      weight: "${data['berat_badan'] ?? '-'} kg",
                      height: "${data['tinggi_badan'] ?? '-'} cm",
                      head: "${data['lingkar_kepala'] ?? '-'} cm",
                      noteTitle: "Catatan ${data['nama_bidan'] ?? 'Bidan'}",
                      note: data['catatan']?.toString() ?? '-',
                      isGood: isGood,
                    );
                  }),
                const SizedBox(height: 20),
                Column(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.history, color: Colors.grey),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      "Menampilkan semua riwayat pemeriksaan",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(height: 90),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: widget.showBottomNavbar
          ? const BottomNavbar(currentIndex: 2)
          : null,
    );
  }

  Widget _childDropdown(List<Map<String, dynamic>> children) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8EEF4)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: _selectedChildId,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down),
          items: children.map((child) {
            return DropdownMenuItem<int>(
              value: _childId(child),
              child: Text("Lihat riwayat pemeriksaan ${_childName(child)}"),
            );
          }).toList(),
          onChanged: (value) => setState(() => _selectedChildId = value),
        ),
      ),
    );
  }

  Widget _nutritionStatusSection(Map<String, dynamic>? latestCheckup) {
    final childId = _childId(latestCheckup);

    if (childId == null) {
      return NutritionStatusCard(data: _nutritionFromHistory(latestCheckup));
    }

    return FutureBuilder<GrowthSummary>(
      future: ApiService.mobileGrowthSummary(childId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                SizedBox(width: 12),
                Text('Memuat status gizi dan z-score...'),
              ],
            ),
          );
        }

        if (snapshot.hasError || snapshot.data == null) {
          return NutritionStatusCard(
            data: _nutritionFromHistory(latestCheckup),
          );
        }

        return NutritionStatusCard(data: snapshot.data!.nutritionStatus);
      },
    );
  }

  NutritionStatusData _nutritionFromHistory(
    Map<String, dynamic>? latestCheckup,
  ) {
    final data = latestCheckup == null
        ? <String, dynamic>{}
        : Map<String, dynamic>.from(latestCheckup);

    return NutritionStatusData(
      title: 'Status Gizi dan Z-Score',
      status: data['status_gizi']?.toString() ?? '-',
      zScore:
          data['z_score']?.toString() ??
          data['zscore']?.toString() ??
          data['zScore']?.toString() ??
          '-',
      dateLabel: displayDate(data['tanggal_pemeriksaan']),
      rawData: data,
    );
  }

  int? _childId(Map<String, dynamic>? data) {
    final id =
        data?['anak_id'] ??
        data?['child_id'] ??
        data?['id_anak'] ??
        data?['id'];
    if (id is int) {
      return id;
    }

    return int.tryParse(id?.toString() ?? '');
  }

  List<Map<String, dynamic>> _filterBySelectedChild(
    List<Map<String, dynamic>> items,
    List<Map<String, dynamic>> children,
  ) {
    final selectedId = _selectedChildId;
    if (selectedId == null || children.isEmpty) {
      return items;
    }

    final selectedChild = children.firstWhere(
      (child) => _childId(child) == selectedId,
      orElse: () => <String, dynamic>{},
    );
    final selectedName = _childName(selectedChild).toLowerCase();

    return items.where((item) {
      final itemChildId = _childId(item);
      if (itemChildId != null) {
        return itemChildId == selectedId;
      }

      return _childName(item).toLowerCase() == selectedName;
    }).toList();
  }

  String _childName(Map<String, dynamic> data) {
    return data['nama_anak']?.toString() ??
        data['nama']?.toString() ??
        data['child_name']?.toString() ??
        'Anak';
  }

  List<dynamic> _sortByLatestCheckup(List<dynamic> items) {
    final sorted = List<dynamic>.from(items);
    sorted.sort((a, b) {
      final dateA = a is Map ? _parseDate(a['tanggal_pemeriksaan']) : null;
      final dateB = b is Map ? _parseDate(b['tanggal_pemeriksaan']) : null;

      if (dateA == null && dateB == null) {
        return 0;
      }
      if (dateA == null) {
        return 1;
      }
      if (dateB == null) {
        return -1;
      }

      return dateB.compareTo(dateA);
    });
    return sorted;
  }

  DateTime? _parseDate(dynamic value) {
    if (value == null || value.toString().isEmpty) {
      return null;
    }

    return DateTime.tryParse(value.toString());
  }

  Widget timelineItem({
    required String date,
    required String weight,
    required String height,
    required String head,
    required String noteTitle,
    required String note,
    required bool isGood,
  }) {
    final accentColor = isGood
        ? const Color(0xFF16A34A)
        : const Color(0xFFF97316);
    final noteColor = isGood
        ? const Color(0xFF0284C7)
        : const Color(0xFFDB2777);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 42,
            child: Stack(
              alignment: Alignment.topCenter,
              children: [
                Positioned(
                  top: 0,
                  bottom: 0,
                  child: Container(width: 1.5, color: const Color(0xFFDDE5DF)),
                ),
                Positioned(
                  top: 0,
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: accentColor.withValues(alpha: 0.18),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: accentColor.withValues(alpha: 0.12),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.calendar_month,
                      color: accentColor,
                      size: 21,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: _timelineCard(
                date: date,
                weight: weight,
                height: height,
                head: head,
                noteTitle: noteTitle,
                note: note,
                isGood: isGood,
                accentColor: accentColor,
                noteColor: noteColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _timelineCard({
    required String date,
    required String weight,
    required String height,
    required String head,
    required String noteTitle,
    required String note,
    required bool isGood,
    required Color accentColor,
    required Color noteColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: accentColor.withValues(alpha: 0.16)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.045),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  date,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF111827),
                  ),
                ),
              ),
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isGood ? Icons.verified : Icons.warning_amber,
                  color: accentColor,
                  size: 18,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: measurementCard(
                  "Berat Badan",
                  weight,
                  Icons.monitor_weight,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: measurementCard("Tinggi Badan", height, Icons.height),
              ),
            ],
          ),
          const SizedBox(height: 10),
          FractionallySizedBox(
            widthFactor: 0.55,
            child: measurementCard("Lingkar Kepala", head, Icons.face),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: noteColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: noteColor.withValues(alpha: 0.12)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        noteTitle,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: noteColor,
                        ),
                      ),
                      const SizedBox(height: 7),
                      Text(
                        note,
                        style: const TextStyle(
                          height: 1.45,
                          fontSize: 13,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget measurementCard(String title, String value, IconData icon) {
    return Container(
      constraints: const BoxConstraints(minHeight: 76),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAF8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE7EEE8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: Colors.grey.shade500),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF006E2F),
            ),
          ),
        ],
      ),
    );
  }
}

class _RiwayatData {
  final List<Map<String, dynamic>> children;
  final List<Map<String, dynamic>> items;

  const _RiwayatData({required this.children, required this.items});
}
