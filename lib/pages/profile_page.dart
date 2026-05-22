import 'package:flutter/material.dart';iimport 'package:image_picker/image_picker.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/services/session_manager.dart';
import 'package:telemedicine/widgets/bottom_navbar.dart';

class ProfileSayaPage extends StatefulWidget {
  final bool showBottomNavbar;
  final ValueChanged<int>? onTabSelected;

  const ProfileSayaPage({
    super.key,
    this.showBottomNavbar = true,
    this.onTabSelected,
  });

  @override
  State<ProfileSayaPage> createState() => _ProfileSayaPageState();
}

class _ProfileSayaPageState extends State<ProfileSayaPage> {
  final ImagePicker _imagePicker = ImagePicker();
  bool _isPickingPhoto = false;

  Future<void> _openPhotoOptions() async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final hasPhoto = SessionManager.profilePhotoBytes != null;

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
                  "Foto Profil",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),
                _photoOption(
                  icon: Icons.photo_library_outlined,
                  title: "Pilih dari Galeri",
                  subtitle: "Gunakan foto yang sudah ada",
                  onTap: () => _pickPhoto(ImageSource.gallery),
                ),
                const SizedBox(height: 10),
                _photoOption(
                  icon: Icons.photo_camera_outlined,
                  title: "Ambil Foto",
                  subtitle: "Buka kamera perangkat",
                  onTap: () => _pickPhoto(ImageSource.camera),
                ),
                if (hasPhoto) ...[
                  const SizedBox(height: 10),
                  _photoOption(
                    icon: Icons.delete_outline,
                    title: "Hapus Foto",
                    subtitle: "Kembali ke foto bawaan",
                    color: Colors.red,
                    onTap: _removePhoto,
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _pickPhoto(ImageSource source) async {
    Navigator.pop(context);

    setState(() => _isPickingPhoto = true);

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
      SessionManager.saveProfilePhoto(photoBytes);

      if (!mounted) {
        return;
      }

      setState(() {});
      _showMessage("Foto profil berhasil diperbarui");
    } catch (error) {
      if (!mounted) {
        return;
      }

      _showMessage("Gagal memilih foto profil");
    } finally {
      if (mounted) {
        setState(() => _isPickingPhoto = false);
      }
    }
  }

  void _removePhoto() {
    Navigator.pop(context);
    SessionManager.clearProfilePhoto();
    setState(() {});
    _showMessage("Foto profil dihapus");
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = SessionManager.user;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _isPickingPhoto ? null : _openPhotoOptions,
              child: Stack(
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
                    child: _profileAvatar(),
                  ),
                  Positioned.fill(
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 180),
                      opacity: _isPickingPhoto ? 1 : 0,
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
            ),
            const SizedBox(height: 16),
            Text(
              user?['nama']?.toString() ?? "Pengguna",
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              user?['email']?.toString() ?? "-",
              style: const TextStyle(color: Colors.grey, fontSize: 15),
            ),
            const SizedBox(height: 30),
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
                if (widget.onTabSelected != null) {
                  widget.onTabSelected!(2);
                  return;
                }

                Navigator.pushReplacementNamed(context, AppRoutes.riwayat);
              },
            ),
            const SizedBox(height: 12),
            menuItem(
              icon: Icons.info_outline,
              title: "Tentang Aplikasi",
              color: Colors.orange,
              onTap: () {},
            ),
            const SizedBox(height: 30),
            InkWell(
              onTap: () {
                SessionManager.clear();
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
          ],
        ),
      ),
      bottomNavigationBar: widget.showBottomNavbar
          ? const BottomNavbar(currentIndex: 3)
          : null,
    );
  }

  Widget _profileAvatar() {
    final photoBytes = SessionManager.profilePhotoBytes;

    if (photoBytes != null) {
      return CircleAvatar(backgroundImage: MemoryImage(photoBytes));
    }

    return const CircleAvatar(
      backgroundColor: Color(0xFFE5EEFF),
      backgroundImage: NetworkImage("https://i.pravatar.cc/300?img=32"),
    );
  }

  Widget _photoOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color color = const Color(0xFF006E2F),
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
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: color == Colors.red ? Colors.red : Colors.black87,
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

            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),


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
