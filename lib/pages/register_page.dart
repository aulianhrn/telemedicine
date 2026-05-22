import 'package:flutter/material.dart';
import 'package:telemedicine/app_routes.dart';
import 'package:telemedicine/services/api_service.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final formKey = GlobalKey<FormState>();
  final namaController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final nikController = TextEditingController();
  final noHpController = TextEditingController();
  final alamatController = TextEditingController();
  final tanggalLahirController = TextEditingController();

  bool isObscure = true;
  bool isLoading = false;
  final Color primaryColor = const Color(0xFF006E2F);

  @override
  void dispose() {
    namaController.dispose();
    emailController.dispose();
    passwordController.dispose();
    nikController.dispose();
    noHpController.dispose();
    alamatController.dispose();
    tanggalLahirController.dispose();
    super.dispose();
  }

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final selectedDate = await showDatePicker(
      context: context,
      firstDate: DateTime(1950),
      lastDate: now,
      initialDate: DateTime(now.year - 25, now.month, now.day),
    );

    if (selectedDate == null) {
      return;
    }

    tanggalLahirController.text =
        '${selectedDate.year.toString().padLeft(4, '0')}-'
        '${selectedDate.month.toString().padLeft(2, '0')}-'
        '${selectedDate.day.toString().padLeft(2, '0')}';
  }

  Future<void> _register() async {
    if (!(formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() => isLoading = true);

    try {
      await ApiService.register(
        nama: namaController.text.trim(),
        email: emailController.text.trim(),
        password: passwordController.text,
        nik: nikController.text.trim(),
        noHp: noHpController.text.trim().isEmpty
            ? null
            : noHpController.text.trim(),
        alamat: alamatController.text.trim().isEmpty
            ? null
            : alamatController.text.trim(),
        tanggalLahir: tanggalLahirController.text.trim().isEmpty
            ? null
            : tanggalLahirController.text.trim(),
      );

      if (!mounted) {
        return;
      }

      Navigator.pushReplacementNamed(context, AppRoutes.home);
    } catch (error) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst('Exception: ', '')),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$label wajib diisi';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Form(
                  key: formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.health_and_safety,
                            color: primaryColor,
                            size: 32,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "Posyandu Kita",
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: primaryColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      Container(
                        height: 118,
                        decoration: BoxDecoration(
                          color: primaryColor.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Stack(
                          children: [
                            Positioned(
                              right: 24,
                              bottom: 12,
                              child: Icon(
                                Icons.family_restroom,
                                size: 82,
                                color: primaryColor.withValues(alpha: 0.18),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(18),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Text(
                                    "Buat Akun Baru",
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF0B1C30),
                                    ),
                                  ),
                                  SizedBox(height: 6),
                                  Text(
                                    "Daftar sebagai ibu untuk memantau data anak.",
                                    style: TextStyle(
                                      color: Color(0xFF6D7B6C),
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      inputField(
                        label: "Nama Lengkap",
                        hint: "Nama ibu",
                        icon: Icons.person,
                        controller: namaController,
                        validator: (value) => _required(value, "Nama"),
                      ),
                      const SizedBox(height: 16),
                      inputField(
                        label: "Email",
                        hint: "nama@email.com",
                        icon: Icons.mail,
                        controller: emailController,
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
                      const SizedBox(height: 16),
                      inputField(
                        label: "NIK",
                        hint: "16 digit NIK",
                        icon: Icons.badge,
                        controller: nikController,
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
                      const SizedBox(height: 16),
                      inputField(
                        label: "No. HP",
                        hint: "08xxxxxxxxxx",
                        icon: Icons.phone,
                        controller: noHpController,
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 16),
                      inputField(
                        label: "Tanggal Lahir",
                        hint: "Pilih tanggal",
                        icon: Icons.cake,
                        controller: tanggalLahirController,
                        readOnly: true,
                        onTap: _pickBirthDate,
                      ),
                      const SizedBox(height: 16),
                      inputField(
                        label: "Alamat",
                        hint: "Alamat tempat tinggal",
                        icon: Icons.home,
                        controller: alamatController,
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),
                      inputField(
                        label: "Kata Sandi",
                        hint: "Minimal 6 karakter",
                        icon: Icons.lock,
                        controller: passwordController,
                        obscureText: isObscure,
                        validator: (value) {
                          final message = _required(value, "Kata sandi");
                          if (message != null) {
                            return message;
                          }
                          if (value!.length < 6) {
                            return "Kata sandi minimal 6 karakter";
                          }
                          return null;
                        },
                        suffixIcon: IconButton(
                          icon: Icon(
                            isObscure ? Icons.visibility : Icons.visibility_off,
                          ),
                          onPressed: () {
                            setState(() => isObscure = !isObscure);
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        height: 56,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            foregroundColor: Colors.white,
                            elevation: 1,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                          onPressed: isLoading ? null : _register,
                          child: isLoading
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  "Daftar",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Wrap(
                        alignment: WrapAlignment.center,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          const Text(
                            "Sudah punya akun? ",
                            style: TextStyle(color: Color(0xFF6D7B6C)),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pushReplacementNamed(
                                context,
                                AppRoutes.login,
                              );
                            },
                            child: Text(
                              "Masuk",
                              style: TextStyle(
                                color: primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget inputField({
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
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: primaryColor, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Colors.redAccent),
            ),
          ),
        ),
      ],
    );
  }
}
