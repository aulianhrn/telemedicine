import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/pages/child_profile_page.dart';
import 'package:telemedicine/pages/login_page.dart';
import 'package:telemedicine/pages/main_navigation_page.dart';
import 'package:telemedicine/pages/register_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Posyandu Kita',
      theme: ThemeData(
        primarySwatch: Colors.green,
        fontFamily: 'PlusJakartaSans',
      ),
      initialRoute: AppRoutes.login,
      routes: {
        AppRoutes.login: (_) => const LoginPage(),
        AppRoutes.register: (_) => const RegisterPage(),
        AppRoutes.home: (_) => const MainNavigationPage(),
        AppRoutes.imunisasi: (_) => const MainNavigationPage(initialIndex: 1),
        AppRoutes.riwayat: (_) => const MainNavigationPage(initialIndex: 2),
        AppRoutes.profile: (_) => const MainNavigationPage(initialIndex: 3),
        AppRoutes.childProfile: (_) => const ProfilePage(),
      },
    );
  }
}
