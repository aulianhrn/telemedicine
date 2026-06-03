import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/models/growth_summary.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/services/formatters.dart';
import 'package:telemedicine/services/session_manager.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';
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
  static const _seriesColors = [
    Color(0xFF006E2F),
    Color(0xFF006686),
    Color(0xFFDB2777),
    Color(0xFFF97316),
    Color(0xFF7C3AED),
    Color(0xFF0891B2),
  ];

  late Future<_HomeData> dashboardFuture;

  @override
  void initState() {
    super.initState();
    dashboardFuture = _loadHomeData();
  }

  Future<_HomeData> _loadHomeData() async {
    final results = await Future.wait([
      ApiService.dashboard(),
      ApiService.anak(),
      ApiService.imunisasi(),
    ]);
    final dashboard = results[0] as Map<String, dynamic>;
    final children = (results[1] as List<dynamic>)
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    final immunizations = (results[2] as List<dynamic>)
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
    final upcomingImmunizations = _sortUpcomingImmunizations(
      immunizations.where(_isPendingImmunization).toList(),
    );

    final series = <_ChildGrowthSeries>[];
    String? growthError;

    for (var i = 0; i < children.length; i++) {
      final child = children[i];
      final childId = _childId(child);
      if (childId == null) {
        continue;
      }

      try {
        var growthSummary = await ApiService.mobileGrowthSummary(childId);
        if (growthSummary.weightChart.points.isEmpty ||
            growthSummary.heightChart.points.isEmpty) {
          growthSummary = await _summaryFromCheckups(childId, growthSummary);
        }
        series.add(
          _ChildGrowthSeries(
            childId: childId,
            childName: _childName(child),
            color: _seriesColors[i % _seriesColors.length],
            weightPoints: growthSummary.weightChart.points,
            heightPoints: growthSummary.heightChart.points,
          ),
        );
      } catch (error) {
        growthError ??= error.toString().replaceFirst('Exception: ', '');
        try {
          final growthSummary = await _summaryFromCheckups(childId);
          series.add(
            _ChildGrowthSeries(
              childId: childId,
              childName: _childName(child),
              color: _seriesColors[i % _seriesColors.length],
              weightPoints: growthSummary.weightChart.points,
              heightPoints: growthSummary.heightChart.points,
            ),
          );
        } catch (_) {}
      }
    }

    return _HomeData(
      dashboard: dashboard,
      children: children,
      upcomingImmunizations: upcomingImmunizations,
      growthSeries: series,
      growthError: series.isEmpty ? growthError : null,
    );
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
            final homeData = snapshot.data!;

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

                  if (homeData.children.isEmpty)
                    const _InfoMessageCard(
                      icon: Icons.child_care,
                      message: 'Belum ada data anak.',
                    )
                  else
                    ...homeData.children.map(_childCard),

                  const SizedBox(height: 20),

                  if (homeData.upcomingImmunizations.isEmpty)
                    _immunizationCard(null)
                  else
                    ...homeData.upcomingImmunizations.map(_immunizationCard),

                  const SizedBox(height: 20),

                  _growthChartsSection(
                    homeData.growthSeries,
                    homeData.growthError,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _childCard(Map<String, dynamic> child) {
    final statusGizi = child['status_gizi']?.toString() ?? 'Belum diperiksa';

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoutes.childProfile,
            arguments: _childId(child),
          );
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
                      color: const Color(0xFF22C55E).withValues(alpha: 0.2),
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
                          _childName(child),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          childAge(child['tanggal_lahir']),
                          style: const TextStyle(color: Colors.grey),
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
                      value: child['berat_badan'] == null
                          ? '-'
                          : '${child['berat_badan']} kg',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: InfoBox(
                      title: 'Tinggi Badan',
                      value: child['tinggi_badan'] == null
                          ? '-'
                          : '${child['tinggi_badan']} cm',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _immunizationCard(Map<String, dynamic>? immunization) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: InkWell(
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
                child: const Icon(Icons.calendar_today, color: Colors.white),
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
                    const SizedBox(height: 4),
                    Text(
                      immunization?['nama_vaksin']?.toString() ??
                          'Belum ada jadwal',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      immunization == null
                          ? '-'
                          : '${displayDate(immunization['tanggal_jadwal'])} • ${_childName(immunization)}',
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
    );
  }

  Widget _growthChartsSection(List<_ChildGrowthSeries> series, String? error) {
    if (error != null) {
      return _InfoMessageCard(
        icon: Icons.show_chart,
        message: 'Grafik pertumbuhan belum bisa dimuat. $error',
      );
    }

    if (series.isEmpty) {
      return const _InfoMessageCard(
        icon: Icons.show_chart,
        message: 'Grafik pertumbuhan akan muncul setelah data anak tersedia.',
      );
    }

    return Column(
      children: [
        _MultiGrowthChartCard(
          title: 'Grafik Berat Badan',
          unit: 'kg',
          icon: Icons.monitor_weight,
          series: series
              .map(
                (item) => _ChartSeries(
                  label: item.childName,
                  color: item.color,
                  points: item.weightPoints,
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 14),
        _MultiGrowthChartCard(
          title: 'Grafik Tinggi Badan',
          unit: 'cm',
          icon: Icons.height,
          series: series
              .map(
                (item) => _ChartSeries(
                  label: item.childName,
                  color: item.color,
                  points: item.heightPoints,
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  bool _isPendingImmunization(Map<String, dynamic> item) {
    return item['status']?.toString().toLowerCase() == 'pending';
  }

  List<Map<String, dynamic>> _sortUpcomingImmunizations(
    List<Map<String, dynamic>> items,
  ) {
    final sorted = List<Map<String, dynamic>>.from(items);
    sorted.sort((a, b) {
      final aDate = DateTime.tryParse(a['tanggal_jadwal']?.toString() ?? '');
      final bDate = DateTime.tryParse(b['tanggal_jadwal']?.toString() ?? '');
      if (aDate == null && bDate == null) {
        return 0;
      }
      if (aDate == null) {
        return 1;
      }
      if (bDate == null) {
        return -1;
      }
      return aDate.compareTo(bDate);
    });
    return sorted;
  }

  String _childName(Map<String, dynamic> data) {
    return data['nama_anak']?.toString() ??
        data['nama']?.toString() ??
        data['child_name']?.toString() ??
        'Anak';
  }

  int? _childId(Map<String, dynamic>? child) {
    final id =
        child?['anak_id'] ??
        child?['child_id'] ??
        child?['id_anak'] ??
        child?['id'];
    if (id is int) {
      return id;
    }

    return int.tryParse(id?.toString() ?? '');
  }
}

class _HomeData {
  final Map<String, dynamic> dashboard;
  final List<Map<String, dynamic>> children;
  final List<Map<String, dynamic>> upcomingImmunizations;
  final List<_ChildGrowthSeries> growthSeries;
  final String? growthError;

  const _HomeData({
    required this.dashboard,
    this.children = const [],
    this.upcomingImmunizations = const [],
    this.growthSeries = const [],
    this.growthError,
  });
}

class _ChildGrowthSeries {
  final int childId;
  final String childName;
  final Color color;
  final List<GrowthChartPoint> weightPoints;
  final List<GrowthChartPoint> heightPoints;

  const _ChildGrowthSeries({
    required this.childId,
    required this.childName,
    required this.color,
    required this.weightPoints,
    required this.heightPoints,
  });
}

class _ChartSeries {
  final String label;
  final Color color;
  final List<GrowthChartPoint> points;

  const _ChartSeries({
    required this.label,
    required this.color,
    required this.points,
  });
}

class _MultiGrowthChartCard extends StatelessWidget {
  final String title;
  final String unit;
  final IconData icon;
  final List<_ChartSeries> series;

  const _MultiGrowthChartCard({
    required this.title,
    required this.unit,
    required this.icon,
    required this.series,
  });

  @override
  Widget build(BuildContext context) {
    final visibleSeries = series
        .map(
          (item) => _ChartSeries(
            label: item.label,
            color: item.color,
            points: _lastYearPoints(item.points),
          ),
        )
        .where((item) => item.points.isNotEmpty)
        .toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF006E2F).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: const Color(0xFF006E2F)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '1 tahun terakhir • Satuan $unit',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _ChartLegend(series: series),
          const SizedBox(height: 14),
          SizedBox(
            height: 210,
            child: visibleSeries.isEmpty
                ? const _EmptyMultiChart()
                : CustomPaint(
                    painter: _MultiGrowthLineChartPainter(
                      series: visibleSeries,
                    ),
                    child: const SizedBox.expand(),
                  ),
          ),
        ],
      ),
    );
  }

  List<GrowthChartPoint> _lastYearPoints(List<GrowthChartPoint> points) {
    if (points.length <= 1) {
      return points;
    }

    final hasDatedPoint = points.any((point) => point.measuredAt != null);
    if (!hasDatedPoint) {
      return points;
    }

    final cutoff = DateTime.now().subtract(const Duration(days: 365));
    final recentPoints = points.where((point) {
      final measuredAt = point.measuredAt;
      return measuredAt != null && !measuredAt.isBefore(cutoff);
    }).toList();

    if (recentPoints.isNotEmpty) {
      return recentPoints;
    }

    final datedPoints =
        points.where((point) => point.measuredAt != null).toList()
          ..sort((a, b) => a.measuredAt!.compareTo(b.measuredAt!));
    return datedPoints.isEmpty ? points : [datedPoints.last];
  }
}

class _ChartLegend extends StatelessWidget {
  final List<_ChartSeries> series;

  const _ChartLegend({required this.series});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 8,
      children: series.map((item) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 9,
              height: 9,
              decoration: BoxDecoration(
                color: item.color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              item.label,
              style: const TextStyle(fontSize: 12, color: Color(0xFF4B5563)),
            ),
          ],
        );
      }).toList(),
    );
  }
}

class _EmptyMultiChart extends StatelessWidget {
  const _EmptyMultiChart();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FF),
        borderRadius: BorderRadius.circular(14),
      ),
      child: const Center(
        child: Text(
          'Belum ada data grafik 1 tahun terakhir',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey),
        ),
      ),
    );
  }
}

class _MultiGrowthLineChartPainter extends CustomPainter {
  final List<_ChartSeries> series;

  const _MultiGrowthLineChartPainter({required this.series});

  @override
  void paint(Canvas canvas, Size size) {
    const left = 38.0;
    const right = 12.0;
    const top = 12.0;
    const bottom = 34.0;
    final chartWidth = math.max(1.0, size.width - left - right);
    final chartHeight = math.max(1.0, size.height - top - bottom);
    final allPoints = series.expand((item) => item.points).toList();
    final values = allPoints.map((point) => point.value).toList();
    final minValue = values.reduce(math.min);
    final maxValue = values.reduce(math.max);
    final range = maxValue == minValue ? 1.0 : maxValue - minValue;

    final gridPaint = Paint()
      ..color = Colors.grey.shade200
      ..strokeWidth = 1;
    final axisTextStyle = TextStyle(color: Colors.grey.shade600, fontSize: 10);

    for (var i = 0; i <= 3; i++) {
      final y = top + (chartHeight / 3) * i;
      canvas.drawLine(
        Offset(left, y),
        Offset(size.width - right, y),
        gridPaint,
      );

      final value = maxValue - (range / 3) * i;
      _drawText(
        canvas,
        value.toStringAsFixed(value >= 10 ? 0 : 1),
        Offset(0, y - 7),
        axisTextStyle,
      );
    }

    for (final item in series) {
      final points = item.points;
      if (points.isEmpty) {
        continue;
      }

      final offsets = <Offset>[];
      for (var i = 0; i < points.length; i++) {
        final x = points.length == 1
            ? left + chartWidth / 2
            : left + (chartWidth / (points.length - 1)) * i;
        final y =
            top +
            chartHeight -
            ((points[i].value - minValue) / range) * chartHeight;
        offsets.add(Offset(x, y));
      }

      final linePaint = Paint()
        ..color = item.color
        ..strokeWidth = 3
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;
      final path = Path()..moveTo(offsets.first.dx, offsets.first.dy);
      for (final offset in offsets.skip(1)) {
        path.lineTo(offset.dx, offset.dy);
      }
      canvas.drawPath(path, linePaint);

      final dotPaint = Paint()..color = item.color;
      final dotFillPaint = Paint()..color = Colors.white;
      for (final offset in offsets) {
        canvas.drawCircle(offset, 4.5, dotPaint);
        canvas.drawCircle(offset, 2.2, dotFillPaint);
      }
    }

    final longestSeries = series.reduce(
      (a, b) => a.points.length >= b.points.length ? a : b,
    );
    final labelStyle = TextStyle(color: Colors.grey.shade700, fontSize: 10);
    final labelIndexes = _labelIndexes(longestSeries.points.length);
    for (final index in labelIndexes) {
      final points = longestSeries.points;
      final x = points.length == 1
          ? left + chartWidth / 2
          : left + (chartWidth / (points.length - 1)) * index;
      _drawText(
        canvas,
        points[index].label,
        Offset(x - 22, size.height - 22),
        labelStyle,
        maxWidth: 44,
      );
    }
  }

  Set<int> _labelIndexes(int length) {
    if (length <= 3) {
      return List.generate(length, (index) => index).toSet();
    }

    return {0, length ~/ 2, length - 1};
  }

  void _drawText(
    Canvas canvas,
    String text,
    Offset offset,
    TextStyle style, {
    double maxWidth = 34,
  }) {
    final painter = TextPainter(
      text: TextSpan(text: text, style: style),
      textDirection: TextDirection.ltr,
      maxLines: 1,
      ellipsis: '...',
    )..layout(maxWidth: maxWidth);
    painter.paint(canvas, offset);
  }

  @override
  bool shouldRepaint(covariant _MultiGrowthLineChartPainter oldDelegate) {
    return oldDelegate.series != series;
  }
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
