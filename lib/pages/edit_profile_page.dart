import 'package:flutter/material.dart';
import 'package:telemedicine/services/api_service.dart';
import 'package:telemedicine/services/session_manager.dart';
import 'package:telemedicine/widgets/profile_avatar.dart';

class EditProfilIbuPage extends StatefulWidget {
  const EditProfilIbuPage({super.key});

  @override
  State<EditProfilIbuPage> createState() => _EditProfilIbuPageState();
}

class _EditProfilIbuPageState extends State<EditProfilIbuPage> {
  final _profileFormKey = GlobalKey<FormState>();

  final _namaController = TextEditingController();
  final _emailController = TextEditingController();
  final _nikController = TextEditingController();
  final _noHpController = TextEditingController();
  final _tanggalLahirController = TextEditingController();
  final _alamatController = TextEditingController();

  bool _isLoadingProfile = true;
  bool _isSavingProfile = false;

  static const _primaryColor = Color(0xFF006E2F);

  @override
  void initState() {
    super.initState();
    _fillFromSession();
    _refreshProfile();
  }

  @override
  void dispose() {
    _namaController.dispose();
    _emailController.dispose();
    _nikController.dispose();
    _noHpController.dispose();
    _tanggalLahirController.dispose();
    _alamatController.dispose();
    super.dispose();
  }

  void _fillFromSession() {
    final user = SessionManager.user ?? {};
    _namaController.text = user['nama']?.toString() ?? '';
    _emailController.text = user['email']?.toString() ?? '';
    _nikController.text = user['nik']?.toString() ?? '';
    _noHpController.text = user['no_hp']?.toString() ?? '';
    _tanggalLahirController.text = _dateOnly(user['tanggal_lahir']);
    _alamatController.text = user['alamat']?.toString() ?? '';
  }

  Future<void> _refreshProfile() async {
    setState(() => _isLoadingProfile = true);

    try {
      await ApiService.me();
      if (!mounted) {
        return;
      }
      _fillFromSession();
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showMessage(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() => _isLoadingProfile = false);
      }
    }
  }

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final currentDate = DateTime.tryParse(_tanggalLahirController.text);
    final selectedDate = await showDatePicker(
      context: context,
      firstDate: DateTime(1950),
      lastDate: now,
      initialDate: currentDate ?? DateTime(now.year - 25, now.month, now.day),
    );

    if (selectedDate == null) {
      return;
    }

    _tanggalLahirController.text = _formatDate(selectedDate);
  }

  Future<void> _saveProfile() async {
    if (!(_profileFormKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() => _isSavingProfile = true);

    try {
      await ApiService.updateIbuProfile(
        nama: _namaController.text.trim(),
        email: _emailController.text.trim(),
        nik: _nikController.text.trim(),
        noHp: _emptyToNull(_noHpController.text),
        tanggalLahir: _emptyToNull(_tanggalLahirController.text),
        alamat: _emptyToNull(_alamatController.text),
      );

      if (!mounted) {
        return;
      }

      _fillFromSession();
      _showMessage("Profil ibu berhasil diperbarui");
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showMessage(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() => _isSavingProfile = false);
      }
    }
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$label wajib diisi';
    }
    return null;
  }

  String? _emptyToNull(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  String _dateOnly(dynamic value) {
    final text = value?.toString() ?? '';
    if (text.length >= 10) {
      return text.substring(0, 10);
    }
    return text;
  }

  String _formatDate(DateTime date) {
    return '${date.year.toString().padLeft(4, '0')}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')}';
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message.isEmpty ? 'Request gagal' : message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: _primaryColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Edit Profil Ibu",
          style: TextStyle(color: _primaryColor, fontWeight: FontWeight.bold),
        ),
      ),
      body: _isLoadingProfile
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _profileHeader(),
                  const SizedBox(height: 18),
                  _sectionCard(
                    child: Form(
                      key: _profileFormKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _sectionTitle(
                            icon: Icons.account_circle_outlined,
                            title: "Data Ibu",
                          ),
                          const SizedBox(height: 18),
                          _inputField(
                            label: "Nama Lengkap",
                            hint: "Nama ibu",
                            icon: Icons.person,
                            controller: _namaController,
                            validator: (value) => _required(value, "Nama"),
                          ),
                          const SizedBox(height: 14),
                          _inputField(
                            label: "Email",
                            hint: "nama@email.com",
                            icon: Icons.mail,
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            validator: (value) {
                              final message = _required(value, "Email");
                              if (message != null) {
                                return message;
                              }
                              if (!value!.contains('@')) {
                                return "Format email tidak valid";
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 14),
                          _inputField(
                            label: "NIK",
                            hint: "16 digit NIK",
                            icon: Icons.badge,
                            controller: _nikController,
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              final message = _required(value, "NIK");
                              if (message != null) {
                                return message;
                              }
                              if (value!.trim().length < 16) {
                                return "NIK minimal 16 digit";
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 14),
                          _inputField(
                            label: "No. HP",
                            hint: "08xxxxxxxxxx",
                            icon: Icons.phone,
                            controller: _noHpController,
                            keyboardType: TextInputType.phone,
                          ),
                          const SizedBox(height: 14),
                          _inputField(
                            label: "Tanggal Lahir",
                            hint: "Pilih tanggal",
                            icon: Icons.cake,
                            controller: _tanggalLahirController,
                            readOnly: true,
                            onTap: _pickBirthDate,
                          ),
                          const SizedBox(height: 14),
                          _inputField(
                            label: "Alamat",
                            hint: "Alamat tempat tinggal",
                            icon: Icons.home,
                            controller: _alamatController,
                            maxLines: 3,
                          ),
                          const SizedBox(height: 20),
                          _submitButton(
                            label: "Simpan Profil",
                            loading: _isSavingProfile,
                            onPressed: _saveProfile,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _profileHeader() {
    return Container(
      padding: const EdgeInsets.all(18),
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
          const ProfileAvatar(radius: 30),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _namaController.text.trim().isEmpty
                      ? "Pengguna"
                      : _namaController.text.trim(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0B1C30),
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  _emailController.text.trim().isEmpty
                      ? "-"
                      : _emailController.text.trim(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionCard({required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(18),
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
      child: child,
    );
  }

  Widget _sectionTitle({required IconData icon, required String title}) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: _primaryColor.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: _primaryColor, size: 22),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _inputField({
    required String label,
    required String hint,
    required IconData icon,
    required TextEditingController controller,
    TextInputType? keyboardType,
    bool obscureText = false,
    bool readOnly = false,
    int maxLines = 1,
    VoidCallback? onTap,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 6),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF3D4A3D),
            ),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          readOnly: readOnly,
          maxLines: obscureText ? 1 : maxLines,
          onTap: onTap,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon),
            suffixIcon: suffixIcon,
          ),
        ),
      ],
    );
  }

  Widget _submitButton({
    required String label,
    required bool loading,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      height: 52,
      child: ElevatedButton(
        onPressed: loading ? null : onPressed,
        child: loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Text(label),
      ),
    );
  }
}
