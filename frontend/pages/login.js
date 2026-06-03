// ===================== LOGIN PAGE =====================

const loginPageHTML = `
    <div class="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-lg min-h-[700px]">
        <div class="flex flex-col p-8 md:p-12 justify-center">
            <div class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-primary text-[32px]" style="font-variation-settings:'FILL'1">health_and_safety</span>
                    <h1 class="text-headline-sm font-bold text-primary">Telemedicine Posyandu</h1>
                </div>
                <h2 class="text-headline-lg font-bold text-on-surface mb-1">Selamat datang kembali</h2>
                <p class="text-body-md text-on-surface-variant">Masuk dengan akun Anda untuk mengakses portal.</p>
            </div>
            <div id="loginError" class="hidden mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium"></div>
            <form id="loginForm" autocomplete="off">
                <div class="mb-4">
                    <label class="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">Email</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                        <input type="email" id="loginEmail" autocomplete="off" class="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary outline-none" placeholder="Masukkan email Anda">
                    </div>
                </div>
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-label-md text-on-surface-variant uppercase tracking-wider">Kata Sandi</label>
                    </div>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                        <input type="password" id="loginPasswordInput" autocomplete="new-password" class="w-full pl-12 pr-12 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary outline-none" placeholder="Masukkan kata sandi">
                        <button type="button" onclick="togglePasswordVisibility()" class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                            <span id="passwordEyeIcon" class="material-symbols-outlined">visibility</span>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-2 mb-6">
                    <input type="checkbox" id="remember" class="w-5 h-5 rounded border-outline-variant accent-green-700">
                    <label for="remember" class="text-body-sm text-on-surface-variant">Ingat pengguna</label>
                </div>
                <button type="submit" id="loginBtn" class="w-full py-4 bg-primary text-on-primary rounded-lg font-headline-sm hover:bg-green-800 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
                    Masuk
                </button>
            </form>
            <footer class="mt-8 pt-6 border-t border-outline-variant">
                <div class="flex justify-center gap-4 text-xs text-on-surface-variant">
                    <a href="#" class="hover:text-primary">Kebijakan Privasi</a>
                    <span>•</span>
                    <a href="#" class="hover:text-primary">Syarat &amp; Ketentuan</a>
                    <span>•</span>
                    <a href="#" class="hover:text-primary">Bantuan</a>
                </div>
            </footer>
        </div>
        <div class="hidden md:block relative bg-surface-container overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5 z-10"></div>
            <div class="relative z-20 h-full flex flex-col p-8 justify-between">
                <div class="mt-auto max-w-[440px]">
                    <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/20 border border-primary-container/30 rounded-full mb-4">
                        <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings:'FILL'1">verified</span>
                        <span class="text-label-md text-on-primary-container uppercase tracking-tight">Kesehatan Komunitas Pertama</span>
                    </div>
                    <h3 class="text-4xl font-bold text-on-surface mb-3">Memberdayakan layanan kesehatan lokal.</h3>
                    <p class="text-body-lg text-on-surface-variant leading-relaxed">
                        Akses alat pemantauan kesehatan ibu dan anak yang komprehensif, dirancang untuk tenaga kesehatan masyarakat generasi berikutnya.
                    </p>
                </div>
                <div class="mt-6 flex items-center gap-4">
                    <div class="flex -space-x-3">
                        <div class="w-10 h-10 rounded-full bg-primary/30 border-2 border-white flex items-center justify-center text-xs font-bold text-primary">SA</div>
                        <div class="w-10 h-10 rounded-full bg-secondary/30 border-2 border-white flex items-center justify-center text-xs font-bold text-secondary">RM</div>
                        <div class="w-10 h-10 rounded-full bg-tertiary/30 border-2 border-white flex items-center justify-center text-xs font-bold text-tertiary">DK</div>
                    </div>
                    <p class="text-label-md text-on-surface-variant">Digunakan oleh <span class="text-primary font-bold">2.400+</span> bidan se-wilayah</p>
                </div>
            </div>
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply" alt="Healthcare">
        </div>
    </div>
`;

window.togglePasswordVisibility = function () {
    const input = document.getElementById('loginPasswordInput');
    const icon = document.getElementById('passwordEyeIcon');
    if (!input) return;
    if (input.type === 'password') { input.type = 'text'; icon.textContent = 'visibility_off'; }
    else { input.type = 'password'; icon.textContent = 'visibility'; }
};

async function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPasswordInput').value;
    const remember = document.getElementById('remember').checked;
    const errEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    errEl.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Memuat...';

    try {
        const res = await fetch(BASE_URL + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            // Simpan atau hapus email berdasarkan checkbox
            if (remember) {
                localStorage.setItem('pos_saved_email', email);
            } else {
                localStorage.removeItem('pos_saved_email');
            }

            localStorage.setItem('pos_token', data.data.token);
            localStorage.setItem('pos_user', JSON.stringify(data.data.user));
            showLoggedInUI();
        } else {
            errEl.textContent = data.message || 'Email atau password salah.';
            errEl.classList.remove('hidden');
        }
    } catch {
        errEl.textContent = 'Tidak bisa terhubung ke server backend.';
        errEl.classList.remove('hidden');
    }

    btn.disabled = false;
    btn.textContent = 'Masuk';
}

function renderLoginPage() {
    const container = document.getElementById('viewContainer');
    if (container) container.innerHTML = loginPageHTML;

    // Force clear autofill dulu, baru isi kalau ada email tersimpan
    setTimeout(() => {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPasswordInput');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';

        const savedEmail = localStorage.getItem('pos_saved_email');
        if (savedEmail) {
            if (emailInput) emailInput.value = savedEmail;
            const rememberCheck = document.getElementById('remember');
            if (rememberCheck) rememberCheck.checked = true;
        }
    }, 100);

    const form = document.getElementById('loginForm');
    if (form) form.addEventListener('submit', doLogin);
}
