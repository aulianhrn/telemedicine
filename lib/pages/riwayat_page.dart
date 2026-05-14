import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';

class RiwayatPage extends StatelessWidget {
  final bool showBottomNavbar;
  final VoidCallback? onBackToHome;

  const RiwayatPage({
    super.key,
    this.showBottomNavbar = true,
    this.onBackToHome,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),

      // ================= APP BAR =================
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF006E2F)),
          onPressed: () {
            if (onBackToHome != null) {
              onBackToHome!();
              return;
            }

            Navigator.pushReplacementNamed(context, AppRoutes.home);
          },
        ),
        title: const Text(
          "Riwayat Pemeriksaan",
          style: TextStyle(
            color: Color(0xFF006E2F),
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage("https://i.pravatar.cc/150?img=47"),
            ),
          ),
        ],
      ),

      // ================= BODY =================
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // ================= SUMMARY CARD =================
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.child_care,
                      color: Colors.green,
                      size: 32,
                    ),
                  ),

                  const SizedBox(width: 16),

                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          "Andi Pratama",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        SizedBox(height: 4),

                        Text(
                          "Laki-laki • 18 Bulan",
                          style: TextStyle(color: Colors.grey),
                        ),

                        SizedBox(height: 2),

                        Text(
                          "Terdaftar di Posyandu Melati",
                          style: TextStyle(color: Colors.grey, fontSize: 13),
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
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Text(
                      "Status: Baik",
                      style: TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ================= TIMELINE =================
            timelineItem(
              date: "12 September 2023",
              weight: "10.5 kg",
              height: "82 cm",
              head: "47 cm",
              noteTitle: "Catatan Bidan Sarah",
              note:
                  "Pertumbuhan normal, teruskan ASI eksklusif dan mulai perbanyak protein hewani pada MPASI.",
              isGood: true,
            ),

            timelineItem(
              date: "10 Agustus 2023",
              weight: "9.8 kg",
              height: "79 cm",
              head: "46 cm",
              noteTitle: "Catatan Kader Rina",
              note:
                  "Kenaikan berat badan kurang optimal. Disarankan konsultasi ke dokter spesialis anak.",
              isGood: false,
            ),

            timelineItem(
              date: "15 Juli 2023",
              weight: "9.5 kg",
              height: "78 cm",
              head: "46 cm",
              noteTitle: "Catatan Bidan Sarah",
              note:
                  "Imunisasi DPT-HB-Hib 3 berhasil dilakukan. Kondisi anak sehat.",
              isGood: true,
            ),

            const SizedBox(height: 20),

            // ================= END TEXT =================
            Column(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.history, color: Colors.grey),
                ),

                const SizedBox(height: 12),

                const Text(
                  "Menampilkan semua riwayat dari 12 bulan terakhir",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),

            const SizedBox(height: 90),
          ],
        ),
      ),

      // ================= BOTTOM NAVIGATION =================
      bottomNavigationBar: showBottomNavbar
          ? const BottomNavbar(currentIndex: 2)
          : null,
    );
  }

  // ================= TIMELINE ITEM =================
  Widget timelineItem({
    required String date,
    required String weight,
    required String height,
    required String head,
    required String noteTitle,
    required String note,
    required bool isGood,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline Dot
          Column(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF006E2F),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.calendar_today,
                  color: Colors.white,
                  size: 18,
                ),
              ),

              Container(width: 2, height: 260, color: Colors.grey.shade300),
            ],
          ),

          const SizedBox(width: 16),

          // Content
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border(
                  left: BorderSide(
                    color: isGood ? Colors.green : Colors.pink,
                    width: 5,
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        date,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      Icon(
                        isGood ? Icons.verified : Icons.warning,
                        color: isGood ? Colors.green : Colors.orange,
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(child: measurementCard("Berat Badan", weight)),

                      const SizedBox(width: 10),

                      Expanded(child: measurementCard("Tinggi Badan", height)),
                    ],
                  ),

                  const SizedBox(height: 10),

                  measurementCard("Lingkar Kepala", head),

                  const SizedBox(height: 16),

                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          isGood
                              ? Icons.medical_information
                              : Icons.chat_bubble,
                          color: isGood ? Colors.blue : Colors.pink,
                        ),

                        const SizedBox(width: 10),

                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                noteTitle,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isGood ? Colors.blue : Colors.pink,
                                ),
                              ),

                              const SizedBox(height: 6),

                              Text(note, style: const TextStyle(height: 1.5)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ================= MEASUREMENT CARD =================
  Widget measurementCard(String title, String value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),

          const SizedBox(height: 6),

          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF006E2F),
            ),
          ),
        ],
      ),
    );
  }
}
