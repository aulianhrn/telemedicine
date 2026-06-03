// ===================== SETTINGS =====================

const settingsPageHTML = `
<div>
    <div class="flex flex-wrap justify-between items-center mb-5">
        <div>
            <h2 class="text-headline-lg font-bold">Pengaturan</h2>
            <p class="text-on-surface-variant">Kelola akun, notifikasi, keamanan, dan preferensi sistem</p>
        </div>
    </div>
    <div id="settingsToast" class="settings-toast">
        <span class="material-symbols-outlined text-[18px]" style="color:#166534">check_circle</span>
        <span id="settingsToastMsg">Perubahan berhasil disimpan!</span>
    </div>
    <div class="settings-tabs-mobile mb-4">
        <button class="settings-tab-btn active whitespace-nowrap" data-tab="profil" onclick="switchSettingsTab('profil',this)">
            <span class="material-symbols-outlined text-[16px]">person</span> Profil
        </button>
        <button class="settings-tab-btn whitespace-nowrap" data-tab="notifikasi" onclick="switchSettingsTab('notifikasi',this)">
            <span class="material-symbols-outlined text-[16px]">notifications</span> Notifikasi
        </button>
        <button class="settings-tab-btn whitespace-nowrap" data-tab="keamanan" onclick="switchSettingsTab('keamanan',this)">
            <span class="material-symbols-outlined text-[16px]">lock</span> Keamanan
        </button>
        <button class="settings-tab-btn whitespace-nowrap" data-tab="preferensi" onclick="switchSettingsTab('preferensi',this)">
            <span class="material-symbols-outlined text-[16px]">tune</span> Preferensi
        </button>
    </div>
    <div class="settings-layout">
        <nav class="settings-tabs-desktop">
            <button class="settings-tab-btn active" data-tab="profil" onclick="switchSettingsTab('profil',this)">
                <span class="material-symbols-outlined text-[18px]">person</span> Profil
            </button>
            <button class="settings-tab-btn" data-tab="notifikasi" onclick="switchSettingsTab('notifikasi',this)">
                <span class="material-symbols-outlined text-[18px]">notifications</span> Notifikasi
            </button>
            <button class="settings-tab-btn" data-tab="keamanan" onclick="switchSettingsTab('keamanan',this)">
                <span class="material-symbols-outlined text-[18px]">lock</span> Keamanan
            </button>
            <button class="settings-tab-btn" data-tab="preferensi" onclick="switchSettingsTab('preferensi',this)">
                <span class="material-symbols-outlined text-[18px]">tune</span> Preferensi
            </button>
        </nav>
        <div>

            <!-- PROFIL -->
            <div id="settings-panel-profil" class="settings-panel active">
                <div class="settings-card">
                    <h3>Foto Profil</h3>
                    <div style="display:flex;align-items:center;gap:16px;margin-bottom:4px">
                        <div class="avatar-circle-settings" id="settingsAvatar">BA</div>
                        <div style="display:flex;flex-direction:column;gap:8px">
                            <label style="font-size:13px;color:#006e2f;border:1px solid #86efac;padding:7px 16px;border-radius:8px;background:transparent;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px">
                                <span class="material-symbols-outlined text-[14px]">upload</span> Ganti Foto
                                <input type="file" accept="image/*" style="display:none" onchange="previewFotoProfil(this)">
                            </label>
                            <span style="font-size:11px;color:#9ca3af">JPG, PNG maks 2MB</span>
                        </div>
                    </div>
                </div>
                <div class="settings-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid #e5e7eb">
                        <h3 style="margin:0;padding:0;border:none">Informasi Pribadi</h3>
                        <button id="btnEditProfil" class="settings-btn-edit" onclick="toggleEditProfil(true)">
                            <span class="material-symbols-outlined text-[14px]">edit</span> Edit
                        </button>
                    </div>

                    <!-- VIEW MODE -->
                    <div id="profilView" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 24px">
                        <div>
                            <div style="font-size:11px;font-weight:500;color:#9ca3af;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em">Nama Lengkap</div>
                            <div style="font-size:13px;color:#111827" id="vNama">—</div>
                        </div>
                        <div>
                            <div style="font-size:11px;font-weight:500;color:#9ca3af;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em">Role</div>
                            <div style="font-size:13px;color:#111827" id="vRole">Bidan</div>
                        </div>
                        <div>
                            <div style="font-size:11px;font-weight:500;color:#9ca3af;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em">Alamat Email</div>
                            <div style="font-size:13px;color:#111827" id="vEmail">—</div>
                        </div>
                        <div>
                            <div style="font-size:11px;font-weight:500;color:#9ca3af;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em">No. Telepon</div>
                            <div style="font-size:13px;color:#6b7280" id="vHp">—</div>
                        </div>
                    </div>

                    <!-- EDIT MODE -->
                    <div id="profilEdit" style="display:none">
                        <div class="settings-form-row">
                            <div class="settings-form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" id="settingsNama">
                            </div>
                            <div class="settings-form-group">
                                <label>Role</label>
                                <input type="text" id="settingsRole" readonly style="background:#f9fafb">
                            </div>
                        </div>
                        <div class="settings-form-group">
                            <label>Alamat Email</label>
                            <input type="email" id="settingsEmail" readonly style="background:#f9fafb">
                        </div>
                        <div class="settings-form-group">
                            <label>No. Telepon</label>
                            <input type="text" id="settingsHp">
                        </div>
                        <div class="settings-save-row">
                            <button class="settings-btn-cancel" onclick="toggleEditProfil(false)">Batal</button>
                            <button class="settings-btn-save" id="btnSimpanProfil" onclick="simpanProfil()">Simpan Perubahan</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- NOTIFIKASI -->
            <div id="settings-panel-notifikasi" class="settings-panel">
                <div class="settings-card">
                    <h3>Notifikasi Aplikasi</h3>
                    <div class="toggle-row">
                        <div style="flex:1"><strong style="font-size:14px;font-weight:600;color:#111827;display:block">Jadwal Imunisasi</strong><span style="font-size:12px;color:#6b7280">Pengingat 1 hari sebelum jadwal</span></div>
                        <label class="settings-toggle"><input type="checkbox" checked><span class="settings-toggle-track"></span></label>
                    </div>
                    <div class="toggle-row">
                        <div style="flex:1"><strong style="font-size:14px;font-weight:600;color:#111827;display:block">Status Gizi Kritis</strong><span style="font-size:12px;color:#6b7280">Alert jika ada balita dengan gizi buruk</span></div>
                        <label class="settings-toggle"><input type="checkbox" checked><span class="settings-toggle-track"></span></label>
                    </div>
                    <div class="toggle-row">
                        <div style="flex:1"><strong style="font-size:14px;font-weight:600;color:#111827;display:block">Laporan Mingguan</strong><span style="font-size:12px;color:#6b7280">Ringkasan otomatis setiap Senin pagi</span></div>
                        <label class="settings-toggle"><input type="checkbox" checked><span class="settings-toggle-track"></span></label>
                    </div>
                </div>
                <div class="settings-save-row">
                    <button class="settings-btn-save" onclick="showSettingsToast('Preferensi notifikasi disimpan!')">Simpan Preferensi</button>
                </div>
            </div>

            <!-- KEAMANAN -->
            <div id="settings-panel-keamanan" class="settings-panel">
                <div class="settings-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid #e5e7eb">
                        <h3 style="margin:0;padding:0;border:none">Ubah Kata Sandi</h3>
                        <button id="btnEditPw" class="settings-btn-edit" onclick="toggleEditPw(true)">
                            <span class="material-symbols-outlined text-[14px]">edit</span> Edit
                        </button>
                    </div>

                    <!-- VIEW MODE -->
                    <div id="pwView" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 24px">
                        <div>
                            <div style="font-size:11px;font-weight:500;color:#9ca3af;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em">Kata Sandi</div>
                            <div style="font-size:13px;color:#111827">••••••••••</div>
                        </div>
                        <div>
                            <div style="font-size:11px;font-weight:500;color:#9ca3af;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em">Terakhir Diubah</div>
                            <div style="font-size:13px;color:#6b7280" id="vPwDate">Belum pernah diubah</div>
                        </div>
                    </div>

                    <!-- EDIT MODE -->
                    <div id="pwEdit" style="display:none">
                        <div class="settings-form-group">
                            <label>Kata Sandi Saat Ini</label>
                            <input type="password" id="pwLama" placeholder="••••••••">
                        </div>
                        <div class="settings-form-row">
                            <div class="settings-form-group">
                                <label>Kata Sandi Baru</label>
                                <input type="password" id="pwBaru" placeholder="Min. 6 karakter">
                            </div>
                            <div class="settings-form-group">
                                <label>Konfirmasi</label>
                                <input type="password" id="pwKonfirm" placeholder="Ulangi kata sandi">
                            </div>
                        </div>
                        <div class="settings-save-row">
                            <button class="settings-btn-cancel" onclick="toggleEditPw(false)">Batal</button>
                            <button class="settings-btn-save" id="btnUbahPw" onclick="doChangePassword()">Ubah Kata Sandi</button>
                        </div>
                    </div>
                </div>
                <div class="settings-card">
                    <h3>Keamanan Akun</h3>
                    <div class="security-action-row">
                        <div>
                            <div style="font-size:14px;font-weight:600;color:#dc2626">Logout Semua Perangkat</div>
                            <div style="font-size:12px;color:#6b7280;margin-top:2px">Keluar dari semua sesi aktif</div>
                        </div>
                        <button class="settings-btn-danger" onclick="doLogout()">Logout</button>
                    </div>
                </div>
            </div>

            <!-- PREFERENSI -->
            <div id="settings-panel-preferensi" class="settings-panel">
                <div class="settings-card">
                    <h3>Tampilan</h3>
                    <div class="pref-row">
                        <div><strong style="font-size:14px;font-weight:600;color:#111827;display:block">Format Tanggal</strong><span style="font-size:12px;color:#6b7280">Cara penulisan tanggal</span></div>
                        <select id="prefTanggal"><option value="dmy" selected>DD/MM/YYYY</option><option value="ymd">YYYY-MM-DD</option></select>
                    </div>
                    <div class="pref-row">
                        <div><strong style="font-size:14px;font-weight:600;color:#111827;display:block">Zona Waktu</strong></div>
                        <select id="prefZona"><option value="wib" selected>WIB (UTC+7)</option><option value="wita">WITA (UTC+8)</option><option value="wit">WIT (UTC+9)</option></select>
                    </div>
                </div>
                <div class="settings-card">
                    <h3>Sistem & Data</h3>
                    <div class="pref-row">
                        <div><strong style="font-size:14px;font-weight:600;color:#111827;display:block">Standar Grafik Tumbuh Kembang</strong><span style="font-size:12px;color:#6b7280">Referensi kurva pertumbuhan anak</span></div>
                        <select><option selected>WHO (2006)</option><option>CDC (2000)</option><option>Kemenkes RI</option></select>
                    </div>
                    <div class="pref-row">
                        <div><strong style="font-size:14px;font-weight:600;color:#111827;display:block">Auto-simpan Form</strong></div>
                        <label class="settings-toggle"><input type="checkbox" checked><span class="settings-toggle-track"></span></label>
                    </div>
                </div>
                <div class="settings-save-row">
                    <button class="settings-btn-cancel" onclick="resetPreferensi()">Reset ke Default</button>
                    <button class="settings-btn-save" onclick="simpanPreferensi()">Simpan Preferensi</button>
                </div>
            </div>

        </div>
    </div>
</div>`;

let _snapProfil = {};

// ── TAB ──
window.switchSettingsTab = function (tabId, btn) {
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('settings-panel-' + tabId)?.classList.add('active');
    document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(b => b.classList.add('active'));
};

// ── TOAST ──
window.showSettingsToast = function (msg = 'Perubahan berhasil disimpan!') {
    const t = document.getElementById('settingsToast');
    const m = document.getElementById('settingsToastMsg');
    if (!t) return;
    if (m) m.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2500);
};

// ── HELPER: apply foto ke elemen avatar ──
function applyAvatarPhoto(el, dataUrl) {
    if (!el) return;
    el.style.backgroundImage = `url(${dataUrl})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
}

// ── FOTO PROFIL ──
window.previewFotoProfil = function (input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
        showGlobalToast('Ukuran file maksimal 2MB!', true);
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;

        // Update avatar di settings page
        applyAvatarPhoto(document.getElementById('settingsAvatar'), dataUrl);

        // Update avatar di topbar
        applyAvatarPhoto(document.getElementById('topbarUserInitials'), dataUrl);

        // Simpan ke localStorage agar tidak hilang saat refresh
        try { localStorage.setItem('pos_avatar', dataUrl); } catch (err) {}

        showSettingsToast('Foto profil diperbarui!');
    };
    reader.readAsDataURL(file);
};

// ── TOGGLE EDIT PROFIL ──
window.toggleEditProfil = function (on) {
    const view    = document.getElementById('profilView');
    const edit    = document.getElementById('profilEdit');
    const btnEdit = document.getElementById('btnEditProfil');

    if (on) {
        _snapProfil = {
            nama: document.getElementById('settingsNama')?.value || '',
            hp:   document.getElementById('settingsHp')?.value   || ''
        };
        if (view)    view.style.display    = 'none';
        if (edit)    edit.style.display    = 'block';
        if (btnEdit) btnEdit.style.display = 'none';
        document.getElementById('settingsNama')?.focus();
    } else {
        if (document.getElementById('settingsNama')) document.getElementById('settingsNama').value = _snapProfil.nama;
        if (document.getElementById('settingsHp'))   document.getElementById('settingsHp').value   = _snapProfil.hp;
        if (edit)    edit.style.display    = 'none';
        if (view)    view.style.display    = 'grid';
        if (btnEdit) btnEdit.style.display = 'inline-flex';
    }
};

// ── SIMPAN PROFIL ──
window.simpanProfil = async function () {
    const btn  = document.getElementById('btnSimpanProfil');
    const nama = document.getElementById('settingsNama')?.value?.trim();
    const hp   = document.getElementById('settingsHp')?.value?.trim();

    if (!nama) { showGlobalToast('Nama tidak boleh kosong!', true); return; }

    btn.textContent = 'Menyimpan...';
    btn.disabled = true;

    const user = JSON.parse(localStorage.getItem('pos_user') || '{}');
    user.nama  = nama;
    user.no_hp = hp;
    localStorage.setItem('pos_user', JSON.stringify(user));

    // Update topbar nama & inisial
    const initials = nama.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const topbarName     = document.getElementById('topbarUserName');
    const topbarInitials = document.getElementById('topbarUserInitials');
    if (topbarName) topbarName.textContent = nama;
    // Hanya update teks inisial jika topbar belum pakai foto
    if (topbarInitials && !localStorage.getItem('pos_avatar')) {
        topbarInitials.textContent = initials;
    }

    // Update avatar settings jika belum pakai foto
    const av = document.getElementById('settingsAvatar');
    if (av && !localStorage.getItem('pos_avatar')) av.textContent = initials;

    // Update view mode
    const vNama = document.getElementById('vNama');
    const vHp   = document.getElementById('vHp');
    if (vNama) vNama.textContent = nama;
    if (vHp)   { vHp.textContent = hp || '—'; vHp.style.color = hp ? '#111827' : '#6b7280'; }

    btn.textContent = 'Simpan Perubahan';
    btn.disabled = false;

    document.getElementById('profilEdit').style.display = 'none';
    document.getElementById('profilView').style.display = 'grid';
    document.getElementById('btnEditProfil').style.display = 'inline-flex';

    showSettingsToast('Profil berhasil disimpan!');
};

// ── TOGGLE EDIT PASSWORD ──
window.toggleEditPw = function (on) {
    const view    = document.getElementById('pwView');
    const edit    = document.getElementById('pwEdit');
    const btnEdit = document.getElementById('btnEditPw');

    if (on) {
        if (view)    view.style.display    = 'none';
        if (edit)    edit.style.display    = 'block';
        if (btnEdit) btnEdit.style.display = 'none';
        document.getElementById('pwLama')?.focus();
    } else {
        ['pwLama', 'pwBaru', 'pwKonfirm'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        if (edit)    edit.style.display    = 'none';
        if (view)    view.style.display    = 'grid';
        if (btnEdit) btnEdit.style.display = 'inline-flex';
    }
};

// ── UBAH PASSWORD ──
window.doChangePassword = async function () {
    const token     = localStorage.getItem('pos_token');
    const pwLama    = document.getElementById('pwLama')?.value;
    const pwBaru    = document.getElementById('pwBaru')?.value;
    const pwKonfirm = document.getElementById('pwKonfirm')?.value;
    const btn       = document.getElementById('btnUbahPw');

    if (!pwLama || !pwBaru)   { showGlobalToast('Isi semua field password!', true); return; }
    if (pwBaru !== pwKonfirm) { showGlobalToast('Konfirmasi password tidak cocok!', true); return; }
    if (pwBaru.length < 6)    { showGlobalToast('Password baru minimal 6 karakter!', true); return; }

    btn.textContent = 'Menyimpan...';
    btn.disabled = true;

    const res = await fetch(BASE_URL + '/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ password_lama: pwLama, password_baru: pwBaru })
    }).then(r => r.json()).catch(() => null);

    btn.textContent = 'Ubah Kata Sandi';
    btn.disabled = false;

    if (res?.success) {
        const vPwDate = document.getElementById('vPwDate');
        if (vPwDate) {
            vPwDate.textContent = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            vPwDate.style.color = '#111827';
        }
        toggleEditPw(false);
        showSettingsToast('Password berhasil diubah!');
    } else {
        showGlobalToast(res?.message || 'Gagal mengubah password', true);
    }
};

// ── PREFERENSI ──
window.simpanPreferensi = function () {
    const tanggal = document.getElementById('prefTanggal')?.value;
    const zona    = document.getElementById('prefZona')?.value;
    localStorage.setItem('pref_tanggal', tanggal);
    localStorage.setItem('pref_zona',    zona);
    showSettingsToast('Preferensi berhasil disimpan!');
};

window.resetPreferensi = function () {
    const t = document.getElementById('prefTanggal');
    const z = document.getElementById('prefZona');
    if (t) t.value = 'dmy';
    if (z) z.value = 'wib';
    showSettingsToast('Preferensi direset ke default!');
};

// ── INIT: isi semua field dari localStorage ──
function fillSettingsProfile() {
    const user = JSON.parse(localStorage.getItem('pos_user') || '{}');

    // Form inputs (edit mode)
    const n = document.getElementById('settingsNama');
    const r = document.getElementById('settingsRole');
    const e = document.getElementById('settingsEmail');
    const h = document.getElementById('settingsHp');
    if (n) n.value = user.nama  || '';
    if (r) r.value = user.role === 'admin' ? 'Administrator' : 'Bidan';
    if (e) e.value = user.email || '';
    if (h) h.value = user.no_hp || '';

    // View mode fields
    const vNama  = document.getElementById('vNama');
    const vRole  = document.getElementById('vRole');
    const vEmail = document.getElementById('vEmail');
    const vHp    = document.getElementById('vHp');
    if (vNama)  vNama.textContent  = user.nama  || '—';
    if (vRole)  vRole.textContent  = user.role === 'admin' ? 'Administrator' : 'Bidan';
    if (vEmail) vEmail.textContent = user.email || '—';
    if (vHp)    { vHp.textContent = user.no_hp || '—'; vHp.style.color = user.no_hp ? '#111827' : '#6b7280'; }

    // Avatar — cek foto tersimpan dulu, fallback ke inisial
    const savedAvatar = localStorage.getItem('pos_avatar');
    const av = document.getElementById('settingsAvatar');
    if (savedAvatar) {
        applyAvatarPhoto(av, savedAvatar);
    } else if (av) {
        av.style.backgroundImage = '';
        av.textContent = (user.nama || 'BA').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }

    // Preferensi tersimpan
    const t = document.getElementById('prefTanggal');
    const z = document.getElementById('prefZona');
    if (t && localStorage.getItem('pref_tanggal')) t.value = localStorage.getItem('pref_tanggal');
    if (z && localStorage.getItem('pref_zona'))    z.value = localStorage.getItem('pref_zona');
}

// ── LOAD FOTO KE TOPBAR saat app pertama kali init ──
// Panggil fungsi ini di tempat kamu menginisialisasi app (setelah login / render topbar)
window.loadAvatarToTopbar = function () {
    const savedAvatar = localStorage.getItem('pos_avatar');
    if (savedAvatar) {
        applyAvatarPhoto(document.getElementById('topbarUserInitials'), savedAvatar);
    }
};