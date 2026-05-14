import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';

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
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),

      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF006E2F),
        onPressed: () {
          Navigator.pushNamed(context, AppRoutes.childProfile);
        },
        child: const Icon(Icons.add, color: Colors.white),
      ),

      bottomNavigationBar: widget.showBottomNavbar
          ? const BottomNavbar(currentIndex: 0)
          : null,

      body: SafeArea(
        child: SingleChildScrollView(
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
                      const CircleAvatar(
                        radius: 24,
                        backgroundImage: NetworkImage(
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuDx0T2r31_IRbKTZXEe_zOL1tB4mJjiGDil6y75PEdh5rxOb-H5gmGh6EcNa3KAFhGCfBxMpKrQ0_F6u7WDLQ1woJBZC_gjy4Bqca8nfUIhKvNfOJK6its0Rk9dkJ4MzydQHzdKhck7Df0-uczaIKw64xISqcipdxhg-Zr338KMwt8QXw9nd3xOsT4suL5uHL-QHP20az_jig3K4fJPFp9ySUWC7WiXy2grj0FbGMkbCkodBDhuwmlV6cxNLUffCJ-kg1S_n1zdAjc',
                        ),
                      ),

                      const SizedBox(width: 12),

                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Selamat pagi,',
                            style: TextStyle(color: Colors.grey, fontSize: 12),
                          ),

                          Text(
                            'Halo, Bunda Sarah!',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 20,
                              color: Color(0xFF006E2F),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  IconButton(
                    onPressed: () {},
                    icon: const Icon(
                      Icons.notifications_outlined,
                      color: Color(0xFF006E2F),
                    ),
                  ),
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
                              children: const [
                                Text(
                                  'Arka',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),

                                Text(
                                  '2 Tahun 4 Bulan',
                                  style: TextStyle(color: Colors.grey),
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

                            child: const Text(
                              'Gizi Baik',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      Row(
                        children: const [
                          Expanded(
                            child: InfoBox(
                              title: 'Berat Badan',
                              value: '12.5 kg',
                            ),
                          ),

                          SizedBox(width: 12),

                          Expanded(
                            child: InfoBox(
                              title: 'Tinggi Badan',
                              value: '88.0 cm',
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
                          children: const [
                            Text(
                              'IMUNISASI MENDATANG',
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF006686),
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            SizedBox(height: 4),

                            Text(
                              'Vaksin PCV 3',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            Text(
                              '15 Oktober 2023',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),

                      const Icon(Icons.chevron_right),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
