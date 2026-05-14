import 'package:flutter/material.dart';
import 'package:telemedicine/pages/home_page.dart';
import 'package:telemedicine/pages/imunisasi_page.dart';
import 'package:telemedicine/pages/profile_page.dart';
import 'package:telemedicine/pages/riwayat_page.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';

class MainNavigationPage extends StatefulWidget {
  final int initialIndex;

  const MainNavigationPage({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage> {
  late int currentIndex;

  @override
  void initState() {
    super.initState();
    currentIndex = widget.initialIndex;
  }

  void _setCurrentIndex(int index) {
    if (index == currentIndex) {
      return;
    }

    setState(() {
      currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: currentIndex,
        children: [
          HomePage(showBottomNavbar: false, onTabSelected: _setCurrentIndex),
          const JadwalImunisasiPage(showBottomNavbar: false),
          RiwayatPage(
            showBottomNavbar: false,
            onBackToHome: () => _setCurrentIndex(0),
          ),
          ProfileSayaPage(
            showBottomNavbar: false,
            onTabSelected: _setCurrentIndex,
          ),
        ],
      ),
      bottomNavigationBar: BottomNavbar(
        currentIndex: currentIndex,
        onTap: _setCurrentIndex,
      ),
    );
  }
}
