String displayDate(dynamic value) {
  if (value == null || value.toString().isEmpty) {
    return '-';
  }

  final date = DateTime.tryParse(value.toString());
  if (date == null) {
    return value.toString();
  }

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

  return '${date.day} ${months[date.month - 1]} ${date.year}';
}

String childAge(dynamic birthDate) {
  final date = birthDate == null
      ? null
      : DateTime.tryParse(birthDate.toString());
  if (date == null) {
    return '-';
  }

  final now = DateTime.now();
  var months = (now.year - date.year) * 12 + now.month - date.month;
  if (now.day < date.day) {
    months--;
  }

  if (months < 12) {
    return '$months Bulan';
  }

  final years = months ~/ 12;
  final remainingMonths = months % 12;
  return remainingMonths == 0
      ? '$years Tahun'
      : '$years Tahun $remainingMonths Bulan';
}
