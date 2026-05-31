import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:telemedicine/models/growth_summary.dart';

class GrowthChartCard extends StatelessWidget {
  final GrowthChartData chart;
  final Color color;
  final IconData icon;

  const GrowthChartCard({
    super.key,
    required this.chart,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final points = _lastYearPoints(chart.points);

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
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chart.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '1 tahun terakhir • Satuan ${chart.unit}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            height: 190,
            child: points.isEmpty
                ? const _EmptyChart(
                    message: 'Belum ada data grafik 1 tahun terakhir',
                  )
                : CustomPaint(
                    painter: _GrowthLineChartPainter(
                      points: points,
                      color: color,
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
      if (measuredAt == null) {
        return false;
      }

      return !measuredAt.isBefore(cutoff);
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

class NutritionStatusCard extends StatelessWidget {
  final NutritionStatusData data;

  const NutritionStatusCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(data.status);
    final zScoreItems = _zScoreItems(data.zScore);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF7EF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.monitor_heart,
                  color: Color(0xFF006E2F),
                  size: 21,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  data.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF111827),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _StatusPill(status: data.status, color: color),
          const SizedBox(height: 12),
          _ZScorePanel(items: zScoreItems),
          if (data.dateLabel != '-') ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Icon(
                  Icons.event_available,
                  size: 16,
                  color: Colors.grey.shade500,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Pemeriksaan terakhir ${data.dateLabel}',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  List<_ZScoreItem> _zScoreItems(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty || trimmed == '-') {
      return const [];
    }

    final normalized = trimmed
        .replaceAll('{', '')
        .replaceAll('}', '')
        .replaceAll('"', '')
        .replaceAll("'", '');
    final parts = normalized
        .split(',')
        .map((part) => part.trim())
        .where((part) => part.isNotEmpty)
        .toList();

    if (parts.length <= 1 && !normalized.contains(':')) {
      return [_ZScoreItem(label: 'Z-Score', value: trimmed)];
    }

    return parts.map((part) {
      final separatorIndex = part.indexOf(':');
      if (separatorIndex == -1) {
        return _ZScoreItem(label: 'Z-Score', value: part);
      }

      return _ZScoreItem(
        label: part.substring(0, separatorIndex).trim().toUpperCase(),
        value: part.substring(separatorIndex + 1).trim(),
      );
    }).toList();
  }

  Color _statusColor(String status) {
    final lower = status.toLowerCase();
    if (lower.contains('baik') || lower.contains('normal')) {
      return const Color(0xFF16A34A);
    }
    if (lower == '-' || lower.contains('belum')) {
      return Colors.grey;
    }
    return const Color(0xFFF97316);
  }
}

class _StatusPill extends StatelessWidget {
  final String status;
  final Color color;

  const _StatusPill({required this.status, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.09),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Row(
        children: [
          Container(
            width: 9,
            height: 9,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          const Text(
            'Status Gizi',
            style: TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const Spacer(),
          Flexible(
            child: Text(
              status,
              textAlign: TextAlign.right,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ZScorePanel extends StatelessWidget {
  final List<_ZScoreItem> items;

  const _ZScorePanel({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF6F8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFC9E8EE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.analytics_outlined,
                size: 17,
                color: Color(0xFF006686),
              ),
              SizedBox(width: 6),
              Text(
                'Z-Score',
                style: TextStyle(
                  color: Color(0xFF006686),
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (items.isEmpty)
            const Text(
              '-',
              style: TextStyle(
                color: Color(0xFF006686),
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            )
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: items.map((item) => _ZScoreChip(item: item)).toList(),
            ),
        ],
      ),
    );
  }
}

class _ZScoreChip extends StatelessWidget {
  final _ZScoreItem item;

  const _ZScoreChip({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.86),
        borderRadius: BorderRadius.circular(12),
      ),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(fontSize: 12, color: Color(0xFF006686)),
          children: [
            TextSpan(
              text: '${item.label}: ',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            TextSpan(
              text: item.value,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ],
        ),
      ),
    );
  }
}

class _ZScoreItem {
  final String label;
  final String value;

  const _ZScoreItem({required this.label, required this.value});
}

class _EmptyChart extends StatelessWidget {
  final String message;

  const _EmptyChart({this.message = 'Belum ada data grafik'});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FF),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Center(
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.grey),
        ),
      ),
    );
  }
}

class _GrowthLineChartPainter extends CustomPainter {
  final List<GrowthChartPoint> points;
  final Color color;

  const _GrowthLineChartPainter({required this.points, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    const left = 38.0;
    const right = 12.0;
    const top = 12.0;
    const bottom = 34.0;
    final chartWidth = math.max(1.0, size.width - left - right);
    final chartHeight = math.max(1.0, size.height - top - bottom);
    final values = points.map((point) => point.value).toList();
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
      ..color = color
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final path = Path()..moveTo(offsets.first.dx, offsets.first.dy);
    for (final offset in offsets.skip(1)) {
      path.lineTo(offset.dx, offset.dy);
    }
    canvas.drawPath(path, linePaint);

    final dotPaint = Paint()..color = color;
    final dotFillPaint = Paint()..color = Colors.white;
    for (final offset in offsets) {
      canvas.drawCircle(offset, 5, dotPaint);
      canvas.drawCircle(offset, 2.5, dotFillPaint);
    }

    final labelStyle = TextStyle(color: Colors.grey.shade700, fontSize: 10);
    final labelIndexes = _labelIndexes(points.length);
    for (final index in labelIndexes) {
      final label = points[index].label;
      final offset = offsets[index];
      _drawText(
        canvas,
        label,
        Offset(offset.dx - 22, size.height - 22),
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
  bool shouldRepaint(covariant _GrowthLineChartPainter oldDelegate) {
    return oldDelegate.points != points || oldDelegate.color != color;
  }
}
