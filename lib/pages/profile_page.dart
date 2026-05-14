import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';

class ProfileSayaPage extends StatelessWidget {
  final bool showBottomNavbar;
  final ValueChanged<int>? onTabSelected;

  const ProfileSayaPage({
    super.key,
    this.showBottomNavbar = true,
    this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),

      // ================= APP BAR =================
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          "Profil Saya",
          style: TextStyle(
            color: Color(0xFF006E2F),
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none, color: Colors.black54),
          ),
        ],
      ),

      // ================= BODY =================
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // ================= PROFILE SECTION =================
            const SizedBox(height: 20),

            Stack(
              children: [
                Container(
                  width: 120,
                  height: 120,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 4),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: const CircleAvatar(
                    backgroundImage: NetworkImage(
                      "https://i.pravatar.cc/300?img=32",
                    ),
                  ),
                ),

                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF006E2F),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(
                      Icons.edit,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            const Text(
              "Bunda Sarah Wijaya",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 6),

            const Text(
              "sarah.wijaya@email.com",
              style: TextStyle(color: Colors.grey, fontSize: 15),
            ),

            const SizedBox(height: 30),

            // ================= MENU LIST =================
            menuItem(
              icon: Icons.child_care,
              title: "Data Anak",
              color: Colors.blue,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.childProfile);
              },
            ),

            const SizedBox(height: 12),

            menuItem(
              icon: Icons.history_edu,
              title: "Riwayat Pengukuran",
              color: Colors.green,
              onTap: () {
                if (onTabSelected != null) {
                  onTabSelected!(2);
                  return;
                }

                Navigator.pushReplacementNamed(context, AppRoutes.riwayat);
              },
            ),

            const SizedBox(height: 12),

            menuItem(
              icon: Icons.settings,
              title: "Pengaturan Akun",
              color: Colors.grey,
              onTap: () {},
            ),

            const SizedBox(height: 12),

            menuItem(
              icon: Icons.help_outline,
              title: "Bantuan & Dukungan",
              color: Colors.pink,
              onTap: () {},
            ),

            const SizedBox(height: 12),

            menuItem(
              icon: Icons.info_outline,
              title: "Tentang Aplikasi",
              color: Colors.orange,
              onTap: () {},
            ),

            const SizedBox(height: 30),

            // ================= LOGOUT =================
            InkWell(
              onTap: () {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  AppRoutes.login,
                  (route) => false,
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.logout, color: Colors.red),

                    SizedBox(width: 8),

                    Text(
                      "Keluar Akun",
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              "Versi 2.4.0 (Build 2024)",
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),

      // ================= BOTTOM NAVIGATION =================
      bottomNavigationBar: showBottomNavbar
          ? const BottomNavbar(currentIndex: 3)
          : null,
    );
  }

  // ================= MENU ITEM WIDGET =================
  Widget menuItem({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color),
            ),

            const SizedBox(width: 16),

            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),

            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
