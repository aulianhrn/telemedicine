import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/models/growth_summary.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/services/formatters.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';
import 'package:telemedicine/widgets/growth_summary_widgets.dart';
import 'package:telemedicine/widgets/profile_avatar.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final ImagePicker _imagePicker = ImagePicker();
  late Future<List<dynamic>> _childrenFuture;
  int? _initialChildId;
  bool _readRouteArgument = false;
  Uint8List? _pickedPhotoBytes;
  bool _isUploadingPhoto = false;
  int _photoVersion = 0;

  @override
  void initState() {
    super.initState();
    _childrenFuture = ApiService.anak();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_readRouteArgument) {
      return;
    }

    final argument = ModalRoute.of(context)?.settings.arguments;
    _initialChildId = argument is int
        ? argument
        : int.tryParse(argument?.toString() ?? '');
    _readRouteArgument = true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF006E2F)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Profil Anak",
          style: TextStyle(
            color: Color(0xFF006E2F),
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: ProfileAvatar(radius: 20),
          ),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _childrenFuture,
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

          final children = snapshot.data ?? [];
          if (children.isEmpty) {
            return const Center(child: Text("Belum ada data anak."));
          }

          final child = _selectedChild(children);

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
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: _isUploadingPhoto
                            ? null
                            : () => _openPhotoOptions(child),
                        child: Stack(
                          children: [
                            Container(
                              width: 120,
                              height: 120,
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 4,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.08),
                                    blurRadius: 10,
                                  ),
                                ],
                              ),
                              child: _childAvatar(child),
                            ),
                            Positioned.fill(
                              child: AnimatedOpacity(
                                duration: const Duration(milliseconds: 180),
                                opacity: _isUploadingPhoto ? 1 : 0,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.35),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Center(
                                    child: SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF006E2F),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2,
                                  ),
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
                      ),
                      const SizedBox(height: 16),
                      Text(
                        child['nama']?.toString() ?? "-",
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.cake, size: 18, color: Colors.grey),
                          const SizedBox(width: 6),
                          Text(
                            childAge(child['tanggal_lahir']),
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green.shade100,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: Text(
                          "Status Gizi: ${child['status_gizi'] ?? '-'}",
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: statCard(
                        icon: Icons.straighten,
                        title: "Tinggi Badan",
                        value: child['tinggi_badan'] == null
                            ? "-"
                            : "${child['tinggi_badan']} cm",
                        subtitle:
                            "Terakhir ${displayDate(child['tanggal_pemeriksaan'])}",
                        iconColor: Colors.blue,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: statCard(
                        icon: Icons.monitor_weight,
                        title: "Berat Badan",
                        value: child['berat_badan'] == null
                            ? "-"
                            : "${child['berat_badan']} kg",
                        subtitle: "Lahir ${child['berat_lahir'] ?? '-'} kg",
                        iconColor: Colors.pink,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _growthSummarySection(child),
                const SizedBox(height: 16),
                InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () => Navigator.pushReplacementNamed(
                    context,
                    AppRoutes.riwayat,
                  ),
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 45,
                          height: 45,
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.history_edu,
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Lihat Riwayat Lengkap",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              SizedBox(height: 4),
                              Text(
                                "Semua pengukuran dari backend",
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
                const SizedBox(height: 80),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: const BottomNavbar(currentIndex: 3),
    );
  }

  Future<void> _openPhotoOptions(Map<String, dynamic> child) async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  "Foto Anak",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),
                _photoOption(
                  icon: Icons.photo_library_outlined,
                  title: "Pilih dari Galeri",
                  subtitle: "Gunakan foto yang sudah ada",
                  onTap: () => _pickPhoto(child, ImageSource.gallery),
                ),
                const SizedBox(height: 10),
                _photoOption(
                  icon: Icons.photo_camera_outlined,
                  title: "Ambil Foto",
                  subtitle: "Buka kamera perangkat",
                  onTap: () => _pickPhoto(child, ImageSource.camera),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _pickPhoto(
    Map<String, dynamic> child,
    ImageSource source,
  ) async {
    Navigator.pop(context);

    final childId = _childId(child);
    if (childId == null) {
      _showMessage("ID anak tidak ditemukan");
      return;
    }

    setState(() => _isUploadingPhoto = true);

    try {
      final pickedImage = await _imagePicker.pickImage(
        source: source,
        imageQuality: 80,
        maxWidth: 900,
        maxHeight: 900,
      );

      if (pickedImage == null) {
        return;
      }

      final photoBytes = await pickedImage.readAsBytes();
      setState(() => _pickedPhotoBytes = photoBytes);

      await ApiService.uploadChildAvatar(
        childId: childId,
        photoBytes: photoBytes,
        fileName: pickedImage.name.isEmpty
            ? 'avatar-anak.jpg'
            : pickedImage.name,
        replaceExisting: _childPhotoUrl(child) != null,
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _pickedPhotoBytes = null;
        _photoVersion++;
        _childrenFuture = ApiService.anak();
      });
      _showMessage("Foto anak berhasil diperbarui");
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() => _pickedPhotoBytes = null);
      _showMessage(
        error.toString().replaceFirst('Exception: ', '').isEmpty
            ? "Gagal mengunggah foto anak"
            : error.toString().replaceFirst('Exception: ', ''),
      );
    } finally {
      if (mounted) {
        setState(() => _isUploadingPhoto = false);
      }
    }
  }

  Widget _childAvatar(Map<String, dynamic> child) {
    final photoBytes = _pickedPhotoBytes;
    final photoUrl = _childPhotoUrl(child);

    if (photoBytes != null) {
      return CircleAvatar(
        backgroundColor: const Color(0xFFE5EEFF),
        backgroundImage: MemoryImage(photoBytes),
      );
    }

    if (photoUrl != null) {
      return ClipOval(
        child: Container(
          color: const Color(0xFFE5EEFF),
          child: Image.network(
            _versionedUrl(photoUrl),
            fit: BoxFit.cover,
            width: double.infinity,
            height: double.infinity,
            errorBuilder: (context, error, stackTrace) {
              return const _ChildAvatarFallback();
            },
          ),
        ),
      );
    }

    return const _ChildAvatarFallback();
  }

  Widget _photoOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: const Color(0xFF006E2F).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: const Color(0xFF006E2F)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.black87,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }

  int? _childId(Map<String, dynamic> child) {
    final id =
        child['anak_id'] ??
        child['child_id'] ??
        child['id_anak'] ??
        child['id'];
    if (id is int) {
      return id;
    }

    return int.tryParse(id?.toString() ?? '');
  }

  Map<String, dynamic> _selectedChild(List<dynamic> children) {
    final selectedId = _initialChildId;
    if (selectedId != null) {
      for (final child in children) {
        if (child is Map) {
          final data = Map<String, dynamic>.from(child);
          if (_childId(data) == selectedId) {
            return data;
          }
        }
      }
    }

    return Map<String, dynamic>.from(children.first as Map);
  }

  String? _childPhotoUrl(Map<String, dynamic> child) {
    final rawUrl = child['ava_pict_url'] ?? child['ava_pict'];
    final value = rawUrl?.toString().trim();
    return value == null || value.isEmpty ? null : value;
  }

  String _versionedUrl(String url) {
    final uri = Uri.tryParse(url);
    if (uri == null) {
      return url;
    }

    return uri
        .replace(
          queryParameters: {...uri.queryParameters, 'v': '$_photoVersion'},
        )
        .toString();
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  Widget _growthSummarySection(Map<String, dynamic> child) {
    final childId = _childId(child);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Ringkasan Pertumbuhan",
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            "Grafik berat badan dan tinggi badan",
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 16),
          if (childId == null)
            const _GrowthSummaryMessage(
              message:
                  "Grafik pertumbuhan akan muncul setelah data anak tersedia.",
            )
          else
            FutureBuilder<GrowthSummary>(
              future: _loadGrowthSummary(childId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const _GrowthSummaryMessage(
                    isLoading: true,
                    message: "Memuat grafik pertumbuhan...",
                  );
                }

                if (snapshot.hasError || snapshot.data == null) {
                  return _GrowthSummaryMessage(
                    message:
                        "Grafik pertumbuhan belum bisa dimuat. ${snapshot.error.toString().replaceFirst('Exception: ', '')}",
                  );
                }

                final summary = snapshot.data!;
                return Column(
                  children: [
                    GrowthChartCard(
                      chart: summary.weightChart,
                      color: const Color(0xFF006E2F),
                      icon: Icons.monitor_weight,
                    ),
                    const SizedBox(height: 14),
                    GrowthChartCard(
                      chart: summary.heightChart,
                      color: const Color(0xFF006686),
                      icon: Icons.height,
                    ),
                  ],
                );
              },
            ),
        ],
      ),
    );
  }

  Future<GrowthSummary> _loadGrowthSummary(int childId) async {
    var growthSummary = await ApiService.mobileGrowthSummary(childId);
    if (growthSummary.weightChart.points.isEmpty ||
        growthSummary.heightChart.points.isEmpty) {
      growthSummary = await _summaryFromCheckups(childId, growthSummary);
    }

    return growthSummary;
  }

  Future<GrowthSummary> _summaryFromCheckups(
    int childId, [
    GrowthSummary? current,
  ]) async {
    final checkups = await ApiService.pemeriksaan(anakId: childId);
    final rows =
        checkups
            .whereType<Map>()
            .map((item) => Map<String, dynamic>.from(item))
            .toList()
          ..sort((a, b) {
            final aDate = DateTime.tryParse(
              (a['tanggal_pemeriksaan'] ?? a['examination_date'] ?? '')
                  .toString(),
            );
            final bDate = DateTime.tryParse(
              (b['tanggal_pemeriksaan'] ?? b['examination_date'] ?? '')
                  .toString(),
            );

            if (aDate == null || bDate == null) {
              return 0;
            }

            return aDate.compareTo(bDate);
          });

    final fallback = GrowthSummary.fromJson({
      'child_id': childId,
      'weight_chart': {
        'title': 'Grafik Berat Badan',
        'unit': 'kg',
        'data': rows,
      },
      'height_chart': {
        'title': 'Grafik Tinggi Badan',
        'unit': 'cm',
        'data': rows,
      },
      'nutrition_status_card': {
        'title': 'Status Gizi dan Z-Score',
        'data': rows.isEmpty ? {} : rows.last,
      },
    });

    if (current == null) {
      return fallback;
    }

    return GrowthSummary(
      childId: current.childId ?? fallback.childId,
      weightChart: current.weightChart.points.isEmpty
          ? fallback.weightChart
          : current.weightChart,
      heightChart: current.heightChart.points.isEmpty
          ? fallback.heightChart
          : current.heightChart,
      nutritionStatus: current.nutritionStatus.hasData
          ? current.nutritionStatus
          : fallback.nutritionStatus,
    );
  }

  Widget statCard({
    required IconData icon,
    required String title,
    required String value,
    required String subtitle,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 45,
            height: 45,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor),
          ),
          const SizedBox(height: 14),
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: const TextStyle(color: Colors.green, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _GrowthSummaryMessage extends StatelessWidget {
  final String message;
  final bool isLoading;

  const _GrowthSummaryMessage({required this.message, this.isLoading = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FF),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          if (isLoading)
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          else
            const Icon(Icons.show_chart, color: Color(0xFF006E2F)),
          const SizedBox(width: 12),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}

class _ChildAvatarFallback extends StatelessWidget {
  const _ChildAvatarFallback();

  @override
  Widget build(BuildContext context) {
    return const CircleAvatar(
      backgroundColor: Color(0xFFE5EEFF),
      child: Icon(Icons.child_care, color: Color(0xFF006E2F), size: 52),
    );
  }
}
