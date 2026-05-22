import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/services/formatters.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';
import 'package:telemedicine/widgets/profile_avatar.dart';

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
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: ProfileAvatar(radius: 18),
          ),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: ApiService.pemeriksaan(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  snapshot.error.toString().replaceFirst('Exception: ', ''),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final items = snapshot.data ?? [];
          final first = items.isEmpty
              ? null
              : Map<String, dynamic>.from(items.first as Map);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
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
                          children: [
                            Text(
                              first?['nama_anak']?.toString() ??
                                  "Belum ada data",
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade100,
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Text(
                                  "Status: ${first?['status_gizi'] ?? '-'}",
                                  style: const TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              first == null
                                  ? "-"
                                  : "Pemeriksaan terakhir ${displayDate(first['tanggal_pemeriksaan'])}",
                              style: const TextStyle(color: Colors.grey),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              "Terdaftar di Posyandu Melati",
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                if (items.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text("Belum ada riwayat pemeriksaan."),
                  )
                else
                  ...items.map((item) {
                    final data = Map<String, dynamic>.from(item as Map);
                    final status =
                        data['status_gizi']?.toString().toLowerCase() ?? '';
                    final isGood =
                        status.contains('baik') || status.contains('normal');

                    return timelineItem(
                      date: displayDate(data['tanggal_pemeriksaan']),
                      weight: "${data['berat_badan'] ?? '-'} kg",
                      height: "${data['tinggi_badan'] ?? '-'} cm",
                      head: "${data['lingkar_kepala'] ?? '-'} cm",
                      noteTitle: "Catatan ${data['nama_bidan'] ?? 'Bidan'}",
                      note: data['catatan']?.toString() ?? '-',
                      isGood: isGood,
                    );
                  }),
                const SizedBox(height: 20),
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
                      "Menampilkan semua riwayat pemeriksaan",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(height: 90),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: showBottomNavbar
          ? const BottomNavbar(currentIndex: 2)
          : null,
    );
  }

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
          Column(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: Color(0xFF006E2F),
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
                      Expanded(
                        child: Text(
                          date,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
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
