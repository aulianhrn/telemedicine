import 'package:flutter/material.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';

class JadwalImunisasiPage extends StatelessWidget {
  final bool showBottomNavbar;

  const JadwalImunisasiPage({super.key, this.showBottomNavbar = true});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),

      // ================= APP BAR =================
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            const CircleAvatar(
              radius: 20,
              backgroundImage: NetworkImage("https://i.pravatar.cc/300?img=32"),
            ),

            const SizedBox(width: 12),

            const Text(
              "Posyandu Kita",
              style: TextStyle(
                color: Color(0xFF006E2F),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications, color: Color(0xFF006E2F)),
          ),
        ],
      ),

      // ================= BODY =================
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ================= HEADER =================
            const Text(
              "Jadwal Imunisasi",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 6),

            const Text(
              "Pantau jadwal tumbuh kembang si kecil secara berkala.",
              style: TextStyle(color: Colors.grey),
            ),

            const SizedBox(height: 20),

            // ================= CALENDAR =================
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Oktober 2023",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      Row(
                        children: [
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(Icons.chevron_left),
                          ),

                          IconButton(
                            onPressed: () {},
                            icon: const Icon(Icons.chevron_right),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Hari
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: const [
                      Text("M"),
                      Text("S"),
                      Text("S"),
                      Text("R"),
                      Text("K"),
                      Text("J"),
                      Text("S"),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Tanggal
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 7,
                    childAspectRatio: 1,
                    children: List.generate(10, (index) {
                      List<String> dates = [
                        "27",
                        "28",
                        "29",
                        "30",
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                      ];

                      bool isSelected = dates[index] == "1";

                      return Center(
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Colors.green.shade100
                                : Colors.transparent,
                            shape: BoxShape.circle,
                            border: isSelected
                                ? Border.all(color: Colors.green, width: 2)
                                : null,
                          ),
                          child: Center(
                            child: Text(
                              dates[index],
                              style: TextStyle(
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                                color: isSelected ? Colors.green : Colors.black,
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ================= REMINDER =================
            const Text(
              "PENGINGAT TERDEKAT",
              style: TextStyle(
                color: Colors.blue,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),

            const SizedBox(height: 10),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF006E2F),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.shade300,
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Text(
                      "Mendatang",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  const Text(
                    "Campak-Rubella",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 12),

                  Row(
                    children: const [
                      Icon(
                        Icons.calendar_today,
                        color: Colors.white70,
                        size: 18,
                      ),

                      SizedBox(width: 8),

                      Text(
                        "15 Oktober 2023",
                        style: TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  Row(
                    children: const [
                      Icon(Icons.location_on, color: Colors.white70, size: 18),

                      SizedBox(width: 8),

                      Text(
                        "Posyandu Melati 04",
                        style: TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF006E2F),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: () {},
                      child: const Text(
                        "Lihat Detail Lokasi",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ================= VAKSIN LIST =================
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  "RIWAYAT & DAFTAR VAKSIN",
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),

                Text(
                  "Lihat Semua",
                  style: TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            vaksinItem(
              title: "DPT-HB-Hib 3",
              subtitle: "Diberikan pada 12 Sep 2023",
              status: "Selesai",
              done: true,
            ),

            vaksinItem(
              title: "Polio 4",
              subtitle: "Diberikan pada 12 Sep 2023",
              status: "Selesai",
              done: true,
            ),

            vaksinItem(
              title: "PCV 2",
              subtitle: "Jadwal: 20 Nov 2023",
              status: "Mendatang",
              done: false,
            ),

            const SizedBox(height: 90),
          ],
        ),
      ),

      // ================= BOTTOM NAVIGATION =================
      bottomNavigationBar: showBottomNavbar
          ? const BottomNavbar(currentIndex: 1)
          : null,
    );
  }

  // ================= VAKSIN ITEM =================
  Widget vaksinItem({
    required String title,
    required String subtitle,
    required String status,
    required bool done,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: done ? Colors.green.shade100 : Colors.blue.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              done ? Icons.check_circle : Icons.schedule,
              color: done ? Colors.green : Colors.blue,
            ),
          ),

          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),

                const SizedBox(height: 4),

                Text(subtitle, style: const TextStyle(color: Colors.grey)),
              ],
            ),
          ),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: done ? Colors.green.shade100 : Colors.blue.shade100,
              borderRadius: BorderRadius.circular(30),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: done ? Colors.green : Colors.blue,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
