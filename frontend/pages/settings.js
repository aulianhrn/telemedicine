// ===================== SETTINGS =====================

const settingsPageHTML = `
<style>
.stt-wrap { display:flex; flex-direction:column; gap:12px; padding-bottom:32px; }
.stt-header { margin-bottom:8px; }
.stt-header h2 { font-size:22px; font-weight:600; color:#111827; margin:0 0 4px; }
.stt-header p { font-size:13px; color:#6b7280; margin:0; }
.stt-card { background:#fff; border:0.5px solid #e5e7eb; border-radius:14px; overflow:hidden; }
.stt-profile-hero { display:flex; flex-direction:column; align-items:center; padding:28px 20px 20px; border-bottom:0.5px solid #f3f4f6; gap:10px; }
.stt-avatar-circle { width:72px; height:72px; border-radius:50%; background:#dcfce7; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; color:#166534; flex-shrink:0; overflow:hidden; background-size:cover; background-position:center; border:2.5px solid #bbf7d0; }
.stt-profile-name { font-size:16px; font-weight:700; color:#111827; }
.stt-badge { font-size:11px; font-weight:600; color:#166534; background:#dcfce7; border-radius:20px; padding:3px 12px; }
.stt-btn-upload { font-size:12px; color:#16a34a; border:0.5px solid #86efac; padding:6px 14px; border-radius:8px; background:#f0fdf4; cursor:pointer; display:inline-flex; align-items:center; gap:5px; font-family:inherit; transition:background .15s; margin-top:2px; }
.stt-btn-upload:hover { background:#dcfce7; }
.stt-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
.stt-info-cell { padding:14px 20px; border-top:0.5px solid #f3f4f6; }
.stt-info-cell:nth-child(odd) { border-right:0.5px solid #f3f4f6; }
.stt-info-label { font-size:11px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; }
.stt-info-value { font-size:14px; color:#111827; font-weight:500; }
.stt-info-value.muted { color:#6b7280; font-weight:400; }
.stt-section-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-top:0.5px solid #f3f4f6; }
.stt-section-header:first-child { border-top:none; }
.stt-section-title { font-size:13px; font-weight:600; color:#374151; }
.stt-btn-edit { font-size:12px; color:#16a34a; border:0.5px solid #86efac; padding:5px 12px; border-radius:8px; background:#f0fdf4; cursor:pointer; display:inline-flex; align-items:center; gap:5px; font-family:inherit; white-space:nowrap; transition:background .15s; }
.stt-btn-edit:hover { background:#dcfce7; }
.stt-edit-wrap { padding:16px 20px 20px; display:none; flex-direction:column; gap:12px; border-top:0.5px solid #f3f4f6; }
.stt-edit-wrap.active { display:flex; }
.stt-form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.stt-form-group { display:flex; flex-direction:column; gap:5px; }
.stt-form-group label { font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; }
.stt-form-group input { font-size:13px; color:#111827; border:0.5px solid #d1d5db; border-radius:8px; padding:8px 12px; font-family:inherit; background:#fff; outline:none; transition:border .15s; }
.stt-form-group input:focus { border-color:#4ade80; }
.stt-form-group input[readonly] { background:#f9fafb; color:#9ca3af; }
.stt-save-row { display:flex; justify-content:flex-end; gap:8px; padding-top:4px; }
.stt-btn-cancel { font-size:13px; color:#6b7280; border:0.5px solid #e5e7eb; padding:8px 18px; border-radius:8px; background:#fff; cursor:pointer; font-family:inherit; }
.stt-btn-save { font-size:13px; color:#fff; border:none; padding:8px 20px; border-radius:8px; background:#16a34a; cursor:pointer; font-family:inherit; font-weight:500; }
.stt-btn-save:hover { background:#15803d; }
.stt-pw-row { display:grid; grid-template-columns:1fr 1fr; gap:0; }
.stt-pw-cell { padding:14px 20px; border-top:0.5px solid #f3f4f6; }
.stt-pw-cell:first-child { border-right:0.5px solid #f3f4f6; }
.stt-danger-row { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; gap:12px; }
.stt-danger-title { font-size:13px; font-weight:600; color:#dc2626; }
.stt-danger-sub { font-size:12px; color:#9ca3af; margin-top:2px; }
.stt-btn-danger { font-size:12px; color:#dc2626; border:0.5px solid #fca5a5; padding:7px 16px; border-radius:8px; background:#fef2f2; cursor:pointer; font-family:inherit; font-weight:500; }
.stt-btn-danger:hover { background:#fee2e2; }
.stt-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(12px); background:#fff; border:0.5px solid #bbf7d0; border-radius:10px; padding:10px 18px; font-size:13px; color:#166534; display:flex; align-items:center; gap:8px; box-shadow:0 4px 16px rgba(0,0,0,.08); opacity:0; pointer-events:none; transition:opacity .2s,transform .2s; z-index:9999; }
.stt-toast.show { opacity:1; transform:translateX(-50%) translateY(0); pointer-events:auto; }
</style>

<div class="stt-wrap">
    <div class="stt-header">
        <h2>Pengaturan</h2>
        <p>Kelola akun dan keamanan</p>
    </div>

    <div id="settingsToast" class="stt-toast">
        <span class="material-symbols-outlined" style="font-size:16px">check_circle</span>
        <span id="settingsToastMsg">Perubahan berhasil disimpan!</span>
    </div>

    <!-- CARD PROFIL -->
    <div class="stt-card">

        <!-- HERO: avatar + nama + badge + ganti foto -->
        <div class="stt-profile-hero">
            <div class="avatar-circle-settings stt-avatar-circle" id="settingsAvatar">BA</div>
            <div class="stt-profile-name" id="sttAvatarName">—</div>
            <span class="stt-badge" id="sttAvatarRole">Bidan</span>
            <label class="stt-btn-upload">
                <span class="material-symbols-outlined" style="font-size:14px">upload</span> Ganti Foto
                <input type="file" accept="image/*" style="display:none" onchange="previewFotoProfil(this)">
            </label>
        </div>

        <!-- HEADER INFORMASI -->
        <div class="stt-section-header">
            <span class="stt-section-title">Informasi Pribadi</span>
            <button id="btnEditProfil" class="stt-btn-edit" onclick="toggleEditProfil(true)">
                <span class="material-symbols-outlined" style="font-size:13px">edit</span> Edit
            </button>
        </div>

        <!-- VIEW MODE: grid 2 kolom -->
        <div id="profilView">
            <div class="stt-info-grid">
                <div class="stt-info-cell">
                    <div class="stt-info-label">Nama Lengkap</div>
                    <div class="stt-info-value" id="vNama">—</div>
                </div>
                <div class="stt-info-cell">
                    <div class="stt-info-label">Role</div>
                    <div class="stt-info-value" id="vRole">Bidan</div>
                </div>
                <div class="stt-info-cell">
                    <div class="stt-info-label">Alamat Email</div>
                    <div class="stt-info-value" id="vEmail">—</div>
                </div>
                <div class="stt-info-cell">
                    <div class="stt-info-label">No. Telepon</div>
                    <div class="stt-info-value muted" id="vHp">—</div>
                </div>
            </div>
        </div>

        <div id="profilEdit" class="stt-edit-wrap">
            <div class="stt-form-row">
                <div class="stt-form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="settingsNama">
                </div>
                <div class="stt-form-group">
                    <label>Role</label>
                    <input type="text" id="settingsRole" readonly>
                </div>
            </div>
            <div class="stt-form-group">
                <label>Alamat Email</label>
                <input type="email" id="settingsEmail" readonly>
            </div>
            <div class="stt-form-group">
                <label>No. Telepon</label>
                <input type="text" id="settingsHp" placeholder="08xx-xxxx-xxxx">
            </div>
            <div class="stt-save-row">
                <button class="stt-btn-cancel" onclick="toggleEditProfil(false)">Batal</button>
                <button class="stt-btn-save" id="btnSimpanProfil" onclick="simpanProfil()">Simpan Perubahan</button>
            </div>
        </div>
    </div>

    <!-- CARD KATA SANDI -->
    <div class="stt-card">
        <div class="stt-section-header">
            <span class="stt-section-title">Kata Sandi</span>
            <button id="btnEditPw" class="stt-btn-edit" onclick="toggleEditPw(true)">
                <span class="material-symbols-outlined" style="font-size:13px">edit</span> Ubah
            </button>
        </div>

        <div id="pwView">
            <div class="stt-pw-row">
                <div class="stt-pw-cell">
                    <div class="stt-info-label">Kata Sandi</div>
                    <div class="stt-info-value">••••••••••</div>
                </div>
                <div class="stt-pw-cell">
                    <div class="stt-info-label">Terakhir Diubah</div>
                    <div class="stt-info-value muted" id="vPwDate">Belum pernah diubah</div>
                </div>
            </div>
        </div>

        <div id="pwEdit" class="stt-edit-wrap">
            <div class="stt-form-group">
                <label>Kata Sandi Saat Ini</label>
                <input type="password" id="pwLama" placeholder="Masukkan kata sandi lama">
            </div>
            <div class="stt-form-row">
                <div class="stt-form-group">
                    <label>Kata Sandi Baru</label>
                    <input type="password" id="pwBaru" placeholder="Min. 6 karakter">
                </div>
                <div class="stt-form-group">
                    <label>Konfirmasi</label>
                    <input type="password" id="pwKonfirm" placeholder="Ulangi kata sandi">
                </div>
            </div>
            <div class="stt-save-row">
                <button class="stt-btn-cancel" onclick="toggleEditPw(false)">Batal</button>
                <button class="stt-btn-save" id="btnUbahPw" onclick="doChangePassword()">Ubah Kata Sandi</button>
            </div>
        </div>
    </div>

    <!-- CARD BAHAYA -->
    <div class="stt-card">
        <div class="stt-danger-row">
            <div>
                <div class="stt-danger-title">Logout Semua Perangkat</div>
                <div class="stt-danger-sub">Keluar dari semua sesi yang sedang aktif</div>
            </div>
            <button class="stt-btn-danger" onclick="doLogout()">Logout</button>
        </div>
    </div>

</div>`;

let _snapProfil = {};

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
        applyAvatarPhoto(document.getElementById('settingsAvatar'), dataUrl);
        applyAvatarPhoto(document.getElementById('topbarUserInitials'), dataUrl);
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
        if (edit)    { edit.style.display = 'flex'; edit.classList.add('active'); }
        if (btnEdit) btnEdit.style.display = 'none';
        document.getElementById('settingsNama')?.focus();
    } else {
        if (document.getElementById('settingsNama')) document.getElementById('settingsNama').value = _snapProfil.nama;
        if (document.getElementById('settingsHp'))   document.getElementById('settingsHp').value   = _snapProfil.hp;
        if (edit)    { edit.style.display = 'none'; edit.classList.remove('active'); }
        if (view)    view.style.display    = 'block';
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

    const initials = nama.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const topbarName     = document.getElementById('topbarUserName');
    const topbarInitials = document.getElementById('topbarUserInitials');
    if (topbarName) topbarName.textContent = nama;
    if (topbarInitials && !localStorage.getItem('pos_avatar')) {
        topbarInitials.textContent = initials;
    }

    const av = document.getElementById('settingsAvatar');
    if (av && !localStorage.getItem('pos_avatar')) av.textContent = initials;

    const vNama = document.getElementById('vNama');
    const vHp   = document.getElementById('vHp');
    if (vNama) vNama.textContent = nama;
    if (vHp)   { vHp.textContent = hp || '—'; vHp.style.color = hp ? '#111827' : '#6b7280'; }

    btn.textContent = 'Simpan Perubahan';
    btn.disabled = false;

    document.getElementById('profilEdit').style.display = 'none';
    document.getElementById('profilEdit').classList.remove('active');
    document.getElementById('profilView').style.display = 'block';
    document.getElementById('btnEditProfil').style.display = 'inline-flex';

    // Update avatar name & role badge in card
    const sttName = document.getElementById('sttAvatarName');
    if (sttName) sttName.textContent = nama;

    showSettingsToast('Profil berhasil disimpan!');
};

// ── TOGGLE EDIT PASSWORD ──
window.toggleEditPw = function (on) {
    const view    = document.getElementById('pwView');
    const edit    = document.getElementById('pwEdit');
    const btnEdit = document.getElementById('btnEditPw');

    if (on) {
        if (view)    view.style.display    = 'none';
        if (edit)    { edit.style.display = 'flex'; edit.classList.add('active'); }
        if (btnEdit) btnEdit.style.display = 'none';
        document.getElementById('pwLama')?.focus();
    } else {
        ['pwLama', 'pwBaru', 'pwKonfirm'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        if (edit)    { edit.style.display = 'none'; edit.classList.remove('active'); }
        if (view)    view.style.display    = 'block';
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

// ── INIT: isi semua field dari localStorage ──
function fillSettingsProfile() {
    const user = JSON.parse(localStorage.getItem('pos_user') || '{}');

    const n = document.getElementById('settingsNama');
    const r = document.getElementById('settingsRole');
    const e = document.getElementById('settingsEmail');
    const h = document.getElementById('settingsHp');
    if (n) n.value = user.nama  || '';
    if (r) r.value = user.role === 'admin' ? 'Administrator' : 'Bidan';
    if (e) e.value = user.email || '';
    if (h) h.value = user.no_hp || '';

    const vNama  = document.getElementById('vNama');
    const vRole  = document.getElementById('vRole');
    const vEmail = document.getElementById('vEmail');
    const vHp    = document.getElementById('vHp');
    if (vNama)  vNama.textContent  = user.nama  || '—';
    if (vRole)  vRole.textContent  = user.role === 'admin' ? 'Administrator' : 'Bidan';
    if (vEmail) vEmail.textContent = user.email || '—';
    if (vHp)    { vHp.textContent = user.no_hp || '—'; vHp.style.color = user.no_hp ? '#111827' : '#6b7280'; }

    // Avatar card name + role
    const sttName = document.getElementById('sttAvatarName');
    const sttRole = document.getElementById('sttAvatarRole');
    if (sttName) sttName.textContent = user.nama || '—';
    if (sttRole) sttRole.textContent = user.role === 'admin' ? 'Administrator' : 'Bidan';

    const savedAvatar = localStorage.getItem('pos_avatar');
    const av = document.getElementById('settingsAvatar');
    if (savedAvatar) {
        applyAvatarPhoto(av, savedAvatar);
    } else if (av) {
        av.style.backgroundImage = '';
        av.textContent = (user.nama || 'BA').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }
}

// ── LOAD FOTO KE TOPBAR saat app pertama kali init ──
window.loadAvatarToTopbar = function () {
    const savedAvatar = localStorage.getItem('pos_avatar');
    if (savedAvatar) {
        applyAvatarPhoto(document.getElementById('topbarUserInitials'), savedAvatar);
    }
};