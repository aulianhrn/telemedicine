class GrowthSummary {
  final int? childId;
  final GrowthChartData weightChart;
  final GrowthChartData heightChart;
  final NutritionStatusData nutritionStatus;

  const GrowthSummary({
    required this.childId,
    required this.weightChart,
    required this.heightChart,
    required this.nutritionStatus,
  });

  factory GrowthSummary.fromJson(Map<String, dynamic> json) {
    return GrowthSummary(
      childId: _asInt(json['child_id'] ?? json['anak_id']),
      weightChart: GrowthChartData.fromJson(
        _asMap(json['weight_chart'] ?? json['grafik_berat_badan']),
        fallbackTitle: 'Grafik Berat Badan',
        fallbackUnit: 'kg',
        valueKeys: const [
          'value',
          'nilai',
          'berat_badan',
          'weight',
          'berat',
          'weight_kg',
        ],
      ),
      heightChart: GrowthChartData.fromJson(
        _asMap(json['height_chart'] ?? json['grafik_tinggi_badan']),
        fallbackTitle: 'Grafik Tinggi Badan',
        fallbackUnit: 'cm',
        valueKeys: const [
          'value',
          'nilai',
          'tinggi_badan',
          'height',
          'tinggi',
          'height_cm',
        ],
      ),
      nutritionStatus: NutritionStatusData.fromJson(
        _asMap(json['nutrition_status_card'] ?? json['status_gizi_card']),
      ),
    );
  }
}

class GrowthChartData {
  final String title;
  final String unit;
  final List<GrowthChartPoint> points;

  const GrowthChartData({
    required this.title,
    required this.unit,
    required this.points,
  });

  factory GrowthChartData.fromJson(
    Map<String, dynamic> json, {
    required String fallbackTitle,
    required String fallbackUnit,
    required List<String> valueKeys,
  }) {
    final rawData =
        json['data'] ??
        json['records'] ??
        json['chart_data'] ??
        json['growth_charts'];
    final points = rawData is List
        ? _flattenChartRows(rawData)
              .map(
                (item) =>
                    GrowthChartPoint.fromJson(item, fallbackUnit, valueKeys),
              )
              .whereType<GrowthChartPoint>()
              .toList()
        : <GrowthChartPoint>[];

    return GrowthChartData(
      title: json['title']?.toString() ?? fallbackTitle,
      unit: json['unit']?.toString() ?? fallbackUnit,
      points: points,
    );
  }
}

class GrowthChartPoint {
  final String label;
  final double value;
  final DateTime? measuredAt;

  const GrowthChartPoint({
    required this.label,
    required this.value,
    required this.measuredAt,
  });

  static GrowthChartPoint? fromJson(
    Map<dynamic, dynamic> json,
    String unit,
    List<String> valueKeys,
  ) {
    final value = _firstDouble(json, valueKeys);

    if (value == null) {
      return null;
    }

    final rawDate =
        json['label'] ??
        json['tanggal'] ??
        json['tanggal_pemeriksaan'] ??
        json['examination_date'] ??
        json['visit_date'] ??
        json['date'] ??
        json['created_at'] ??
        json['month'] ??
        json['bulan'] ??
        json['label_bulan'];

    return GrowthChartPoint(
      label: _shortLabel(rawDate) ?? '${value.toStringAsFixed(1)} $unit',
      measuredAt: _asDateTime(rawDate),
      value: value,
    );
  }
}

class NutritionStatusData {
  final String title;
  final String status;
  final String zScore;
  final String dateLabel;
  final Map<String, dynamic> rawData;

  const NutritionStatusData({
    required this.title,
    required this.status,
    required this.zScore,
    required this.dateLabel,
    required this.rawData,
  });

  factory NutritionStatusData.fromJson(Map<String, dynamic> json) {
    final data = _asMap(json['data']);

    return NutritionStatusData(
      title: json['title']?.toString() ?? 'Status Gizi dan Z-Score',
      status:
          data['nutrition_status']?.toString() ??
          data['status_gizi']?.toString() ??
          data['status']?.toString() ??
          '-',
      zScore:
          data['z_score']?.toString() ??
          data['zscore']?.toString() ??
          data['zScore']?.toString() ??
          '-',
      dateLabel:
          _shortLabel(
            data['tanggal_pemeriksaan'] ??
                data['tanggal'] ??
                data['created_at'],
          ) ??
          '-',
      rawData: data,
    );
  }

  bool get hasData => rawData.isNotEmpty;
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

int? _asInt(Object? value) {
  if (value is int) {
    return value;
  }

  return int.tryParse(value?.toString() ?? '');
}

double? _asDouble(Object? value) {
  if (value is num) {
    return value.toDouble();
  }

  return double.tryParse(value?.toString() ?? '');
}

double? _firstDouble(Map<dynamic, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final value = _asDouble(json[key]);
    if (value != null) {
      return value;
    }
  }

  return null;
}

List<Map<dynamic, dynamic>> _flattenChartRows(List<dynamic> rawData) {
  final rows = <Map<dynamic, dynamic>>[];

  for (final item in rawData) {
    if (item is! Map) {
      continue;
    }

    final nestedRecords = item['records'];
    if (nestedRecords is List) {
      for (final record in nestedRecords) {
        if (record is Map) {
          rows.add({
            ...item,
            ...record,
            if (!record.containsKey('tanggal') && item['tanggal'] != null)
              'tanggal': item['tanggal'],
            if (!record.containsKey('tanggal_pemeriksaan') &&
                item['tanggal_pemeriksaan'] != null)
              'tanggal_pemeriksaan': item['tanggal_pemeriksaan'],
          });
        }
      }
      continue;
    }

    rows.add(item);
  }

  return rows;
}

DateTime? _asDateTime(Object? value) {
  final text = value?.toString();
  if (text == null || text.isEmpty) {
    return null;
  }

  return DateTime.tryParse(text);
}

String? _shortLabel(Object? value) {
  final text = value?.toString();
  if (text == null || text.isEmpty) {
    return null;
  }

  final date = DateTime.tryParse(text);
  if (date == null) {
    return text;
  }

  return '${date.day}/${date.month}/${date.year}';
}
