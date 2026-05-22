import 'package:flutter_test/flutter_test.dart';

import 'package:telemedicine/main.dart';

void main() {
  testWidgets('menampilkan halaman login Posyandu Kita', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MyApp());

    expect(find.text('Selamat Datang'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Kata Sandi'), findsOneWidget);
    expect(find.text('Masuk'), findsOneWidget);
  });
}
