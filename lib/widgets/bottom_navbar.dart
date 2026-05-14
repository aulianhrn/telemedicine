import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';

class BottomNavbar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int>? onTap;

  const BottomNavbar({super.key, required this.currentIndex, this.onTap});

  static const List<String> _routes = [
    AppRoutes.home,
    AppRoutes.imunisasi,
    AppRoutes.riwayat,
    AppRoutes.profile,
  ];

  void _openTab(BuildContext context, int index) {
    if (index == currentIndex) {
      return;
    }

    if (onTap != null) {
      onTap!(index);
      return;
    }

    Navigator.pushReplacementNamed(context, _routes[index]);
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: const Color(0xFF006E2F),
      unselectedItemColor: Colors.grey,
      onTap: (index) => _openTab(context, index),
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: "Beranda"),
        BottomNavigationBarItem(icon: Icon(Icons.vaccines), label: "Imunisasi"),
        BottomNavigationBarItem(icon: Icon(Icons.history), label: "Riwayat"),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profil"),
      ],
    );
  }
}
