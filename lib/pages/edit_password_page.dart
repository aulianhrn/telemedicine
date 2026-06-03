import 'package:flutter/material.dart';
import 'package:telemedicine/services/api_service.dart';

class EditPasswordPage extends StatefulWidget {
  const EditPasswordPage({super.key});

  @override
  State<EditPasswordPage> createState() => _EditPasswordPageState();
}

class _EditPasswordPageState extends State<EditPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _oldPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isSaving = false;
  bool _hideOldPassword = true;
  bool _hideNewPassword = true;
  bool _hideConfirmPassword = true;

  static const _primaryColor = Color(0xFF006E2F);

  @override
  void dispose() {
    _oldPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _savePassword() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() => _isSaving = true);

    try {
      await ApiService.updatePassword(
        oldPassword: _oldPasswordController.text,
        newPassword: _newPasswordController.text,
      );

      if (!mounted) {
        return;
      }

      _oldPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      _showMessage("Kata sandi berhasil diperbarui");
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showMessage(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$label wajib diisi';
    }
    return null;
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
          "Edit Password",
          style: TextStyle(color: _primaryColor, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 32),
        child: _sectionCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _sectionTitle(icon: Icons.lock_outline, title: "Kata Sandi"),
                const SizedBox(height: 18),
                _inputField(
                  label: "Kata Sandi Lama",
                  hint: "Masukkan kata sandi lama",
                  icon: Icons.lock,
                  controller: _oldPasswordController,
                  obscureText: _hideOldPassword,
                  validator: (value) => _required(value, "Kata sandi lama"),
                  suffixIcon: _passwordToggle(
                    hidden: _hideOldPassword,
                    onPressed: () =>
                        setState(() => _hideOldPassword = !_hideOldPassword),
                  ),
                ),
                const SizedBox(height: 14),
                _inputField(
                  label: "Kata Sandi Baru",
                  hint: "Minimal 6 karakter",
                  icon: Icons.lock_reset,
                  controller: _newPasswordController,
                  obscureText: _hideNewPassword,
                  validator: (value) {
                    final message = _required(value, "Kata sandi baru");
                    if (message != null) {
                      return message;
                    }
                    if (value!.length < 6) {
                      return "Kata sandi minimal 6 karakter";
                    }
                    return null;
                  },
                  suffixIcon: _passwordToggle(
                    hidden: _hideNewPassword,
                    onPressed: () =>
                        setState(() => _hideNewPassword = !_hideNewPassword),
                  ),
                ),
                const SizedBox(height: 14),
                _inputField(
                  label: "Konfirmasi Kata Sandi",
                  hint: "Ulangi kata sandi baru",
                  icon: Icons.verified_user,
                  controller: _confirmPasswordController,
                  obscureText: _hideConfirmPassword,
                  validator: (value) {
                    final message = _required(value, "Konfirmasi kata sandi");
                    if (message != null) {
                      return message;
                    }
                    if (value != _newPasswordController.text) {
                      return "Konfirmasi kata sandi tidak sama";
                    }
                    return null;
                  },
                  suffixIcon: _passwordToggle(
                    hidden: _hideConfirmPassword,
                    onPressed: () => setState(
                      () => _hideConfirmPassword = !_hideConfirmPassword,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                _submitButton(),
              ],
            ),
          ),
        ),
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
    bool obscureText = false,
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
          obscureText: obscureText,
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

  Widget _passwordToggle({
    required bool hidden,
    required VoidCallback onPressed,
  }) {
    return IconButton(
      icon: Icon(hidden ? Icons.visibility : Icons.visibility_off),
      onPressed: onPressed,
    );
  }

  Widget _submitButton() {
    return SizedBox(
      height: 52,
      child: ElevatedButton(
        onPressed: _isSaving ? null : _savePassword,
        child: _isSaving
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : const Text("Simpan Password"),
      ),
    );
  }
}
