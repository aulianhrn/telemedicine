import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/models/growth_summary.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/services/formatters.dart';
import 'package:telemedicine/services/session_manager.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';
import 'package:telemedicine/widgets/growth_summary_widgets.dart';
import 'package:telemedicine/widgets/notification_bell.dart';
import 'package:telemedicine/widgets/profile_avatar.dart';

class HomePage extends StatefulWidget {
  final bool showBottomNavbar;
  final ValueChanged<int>? onTabSelected;

  const HomePage({super.key, this.showBottomNavbar = true, this.onTabSelected});

  @override
  State<HomePage> createState() => _HomePageState();
}

/// INFO BOX WIDGET
class InfoBox extends StatelessWidget {
  final String title;
  final String value;

  const InfoBox({super.key, required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5FF),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Color(0xFF006E2F),
            ),
          ),
        ],
      ),
    );
  }
}

/// QUICK MENU WIDGET
class QuickMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const QuickMenuItem({
    super.key,
    required this.icon,
    required this.label,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: const Color(0xFFE5EEFF),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, color: const Color(0xFF006E2F)),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}

/// ARTICLE CARD WIDGET
class ArticleCard extends StatelessWidget {
  final String image;
  final String category;
  final String title;
  final VoidCallback? onTap;

  const ArticleCard({
    super.key,
    required this.image,
    required this.category,
    required this.title,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 260,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.network(
              image,
              height: 130,
              width: double.infinity,
              fit: BoxFit.cover,
            ),

            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFE0EF),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      category,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),

                  const SizedBox(height: 12),

                  Row(
                    children: const [
                      Icon(Icons.schedule, size: 16, color: Colors.grey),
                      SizedBox(width: 6),
                      Text(
                        '5 mnt baca',
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomePageState extends State<HomePage> {
  late Future<_HomeData> dashboardFuture;

  @override
  void initState() {
    super.initState();
    dashboardFuture = _loadHomeData();
  }

  Future<_HomeData> _loadHomeData() async {
    final dashboard = await ApiService.dashboard();
    final anak = dashboard['anak_utama'] as Map<String, dynamic>?;
    final childId = _childId(anak);

    if (childId == null) {
      return _HomeData(dashboard: dashboard);
    }

    try {
      var growthSummary = await ApiService.mobileGrowthSummary(childId);
      if (growthSummary.weightChart.points.isEmpty ||
          growthSummary.heightChart.points.isEmpty) {
        growthSummary = await _summaryFromCheckups(childId, growthSummary);
      }
      return _HomeData(dashboard: dashboard, growthSummary: growthSummary);
    } catch (error) {
      try {
        final growthSummary = await _summaryFromCheckups(childId);
        return _HomeData(dashboard: dashboard, growthSummary: growthSummary);
      } catch (_) {
        return _HomeData(
          dashboard: dashboard,
          growthError: error.toString().replaceFirst('Exception: ', ''),
        );
      }
    }
  }

  Future<GrowthSummary> _summaryFromCheckups(
    int childId, [
    GrowthSummary? current,
  ]) async {
    final checkups = await ApiService.pemeriksaan(anakId: childId);
    final rows =
        checkups
            .whereType<Map>()
            .map((item) => Map<String, dynamic>.from(item))
            .toList()
          ..sort((a, b) {
            final aDate = DateTime.tryParse(
              (a['tanggal_pemeriksaan'] ?? a['examination_date'] ?? '')
                  .toString(),
            );
            final bDate = DateTime.tryParse(
              (b['tanggal_pemeriksaan'] ?? b['examination_date'] ?? '')
                  .toString(),
            );

            if (aDate == null || bDate == null) {
              return 0;
            }

            return aDate.compareTo(bDate);
          });

    final fallback = GrowthSummary.fromJson({
      'child_id': childId,
      'weight_chart': {
        'title': 'Grafik Berat Badan',
        'unit': 'kg',
        'data': rows,
      },
      'height_chart': {
        'title': 'Grafik Tinggi Badan',
        'unit': 'cm',
        'data': rows,
      },
      'nutrition_status_card': {
        'title': 'Status Gizi dan Z-Score',
        'data': rows.isEmpty ? {} : rows.last,
      },
    });

    if (current == null) {
      return fallback;
    }

    return GrowthSummary(
      childId: current.childId ?? fallback.childId,
      weightChart: current.weightChart.points.isEmpty
          ? fallback.weightChart
          : current.weightChart,
      heightChart: current.heightChart.points.isEmpty
          ? fallback.heightChart
          : current.heightChart,
      nutritionStatus: current.nutritionStatus.hasData
          ? current.nutritionStatus
          : fallback.nutritionStatus,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),

      bottomNavigationBar: widget.showBottomNavbar
          ? const BottomNavbar(currentIndex: 0)
          : null,

      body: SafeArea(
        child: FutureBuilder<_HomeData>(
          future: dashboardFuture,
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

            final user = SessionManager.user;
            final homeData = snapshot.data;
            final anak =
                homeData?.dashboard['anak_utama'] as Map<String, dynamic>?;
            final imunisasi =
                homeData?.dashboard['imunisasi_mendatang']
                    as Map<String, dynamic>?;
            final childName =
                anak?['nama']?.toString() ?? 'Belum ada data anak';
            final statusGizi =
                anak?['status_gizi']?.toString() ?? 'Belum diperiksa';

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),

              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// HEADER
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const ProfileAvatar(radius: 24),

                          const SizedBox(width: 12),

                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Selamat pagi,',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 12,
                                ),
                              ),

                              Text(
                                'Halo, ${user?['nama'] ?? 'Bunda'}!',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 20,
                                  color: Color(0xFF006E2F),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const NotificationBell(),
                    ],
                  ),

                  const SizedBox(height: 24),

                  /// CHILD CARD
                  InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.childProfile);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(20),

                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey.shade200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 10,
                          ),
                        ],
                      ),

                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 52,
                                height: 52,
                                decoration: BoxDecoration(
                                  color: const Color(
                                    0xFF22C55E,
                                  ).withValues(alpha: 0.2),
                                  shape: BoxShape.circle,
                                ),

                                child: const Icon(
                                  Icons.child_care,
                                  color: Color(0xFF006E2F),
                                  size: 30,
                                ),
                              ),

                              const SizedBox(width: 12),

                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      childName,
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),

                                    Text(
                                      childAge(anak?['tanggal_lahir']),
                                      style: const TextStyle(
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),

                                decoration: BoxDecoration(
                                  color: const Color(0xFF22C55E),
                                  borderRadius: BorderRadius.circular(20),
                                ),

                                child: Text(
                                  statusGizi,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 20),

                          Row(
                            children: [
                              Expanded(
                                child: InfoBox(
                                  title: 'Berat Badan',
                                  value: anak?['berat_badan'] == null
                                      ? '-'
                                      : '${anak!['berat_badan']} kg',
                                ),
                              ),

                              const SizedBox(width: 12),

                              Expanded(
                                child: InfoBox(
                                  title: 'Tinggi Badan',
                                  value: anak?['tinggi_badan'] == null
                                      ? '-'
                                      : '${anak!['tinggi_badan']} cm',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  /// IMMUNIZATION CARD
                  InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () {
                      if (widget.onTabSelected != null) {
                        widget.onTabSelected!(1);
                        return;
                      }

                      Navigator.pushNamed(context, AppRoutes.imunisasi);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(18),

                      decoration: BoxDecoration(
                        color: const Color(0xFF7ED4FD).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),

                      child: Row(
                        children: [
                          Container(
                            width: 52,
                            height: 52,

                            decoration: BoxDecoration(
                              color: const Color(0xFF006686),
                              borderRadius: BorderRadius.circular(16),
                            ),

                            child: const Icon(
                              Icons.calendar_today,
                              color: Colors.white,
                            ),
                          ),

                          const SizedBox(width: 16),

                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'IMUNISASI MENDATANG',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF006686),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),

                                SizedBox(height: 4),

                                Text(
                                  imunisasi?['nama_vaksin']?.toString() ??
                                      'Belum ada jadwal',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),

                                Text(
                                  displayDate(imunisasi?['tanggal_jadwal']),
                                  style: const TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                          ),

                          const Icon(Icons.chevron_right),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  _growthChartsSection(
                    homeData?.growthSummary,
                    homeData?.growthError,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _growthChartsSection(GrowthSummary? summary, String? error) {
    if (error != null) {
      return _InfoMessageCard(
        icon: Icons.show_chart,
        message: 'Grafik pertumbuhan belum bisa dimuat. $error',
      );
    }

    if (summary == null) {
      return const _InfoMessageCard(
        icon: Icons.show_chart,
        message: 'Grafik pertumbuhan akan muncul setelah data anak tersedia.',
      );
    }

    return Column(
      children: [
        GrowthChartCard(
          chart: summary.weightChart,
          color: const Color(0xFF006E2F),
          icon: Icons.monitor_weight,
        ),
        const SizedBox(height: 14),
        GrowthChartCard(
          chart: summary.heightChart,
          color: const Color(0xFF006686),
          icon: Icons.height,
        ),
      ],
    );
  }

  int? _childId(Map<String, dynamic>? child) {
    final id = child?['id'] ?? child?['anak_id'] ?? child?['child_id'];
    if (id is int) {
      return id;
    }

    return int.tryParse(id?.toString() ?? '');
  }
}

class _HomeData {
  final Map<String, dynamic> dashboard;
  final GrowthSummary? growthSummary;
  final String? growthError;

  const _HomeData({
    required this.dashboard,
    this.growthSummary,
    this.growthError,
  });
}

class _InfoMessageCard extends StatelessWidget {
  final IconData icon;
  final String message;

  const _InfoMessageCard({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF006E2F)),
          const SizedBox(width: 12),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}
