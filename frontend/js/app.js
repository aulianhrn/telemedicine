// ===================== CONFIG =====================
const BASE_URL = 'https://backend-web-255520032221.us-central1.run.app/api';
// Base URL server tanpa /api — untuk build URL foto avatar
const SERVER_URL = 'https://backend-web-255520032221.us-central1.run.app';

// ===================== UTILS =====================
function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function umur(tgl) {
    if (!tgl) return '';
    const now = new Date(), birth = new Date(tgl);
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 24) return `${months} bulan`;
    return `${Math.floor(months / 12)} thn ${months % 12} bln`;
}

function showGlobalToast(msg, isError = false) {
    const toast = document.getElementById('globalToast');
    const msgEl = document.getElementById('globalToastMsg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.style.background = isError ? '#fee2e2' : '#dcfce7';
    toast.style.borderColor = isError ? '#fca5a5' : '#86efac';
    toast.style.color = isError ? '#991b1b' : '#166534';
    toast.style.display = 'flex';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
    document.body.style.overflow = '';
}

// ── AVATAR HELPER ──
// Terapkan foto ke elemen avatar (topbar atau settings)
function applyAvatarPhoto(el, src) {
    if (!el || !src) return;
    el.style.backgroundImage = `url(${src})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
}

// Load avatar dari data user (dari server), dipanggil saat login & init
window.loadAvatarToTopbar = function () {
    const user = JSON.parse(localStorage.getItem('pos_user') || '{}');
    if (user.avatar) {
        // Avatar tersimpan di server — build full URL
        const src = user.avatar.startsWith('http') ? user.avatar : SERVER_URL + user.avatar;
        applyAvatarPhoto(document.getElementById('topbarUserInitials'), src);
    }
    // Tidak ada fallback ke base64 lagi — pakai inisial saja jika belum ada foto
};

// ===================== NAVIGATION =====================
window.navigateTo = function (page) {
    if (!isLoggedIn) { showLoggedOutUI(); return; }
    currentPageId = page;

    document.querySelectorAll('#navContainer a').forEach(link => {
        link.classList.remove('bg-primary-container', 'text-on-primary-container', 'border-l-4', 'border-primary');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('bg-primary-container', 'text-on-primary-container', 'border-l-4', 'border-primary');
        }
    });

    const container = document.getElementById('viewContainer');
    if (!container) return;

    switch (page) {
        case 'dashboard':
            container.innerHTML = getDashboardHTML();
            loadDashboard();
            break;
        case 'data-anak':
            anakPage = 1; anakSearch = '';
            container.innerHTML = getDataAnakHTML();
            loadAnakTable();
            break;
        case 'data-ibu':
            ibuPage = 1; ibuSearch = '';
            container.innerHTML = getDataIbuHTML();
            loadIbuTable();
            break;
        case 'pemeriksaan-gizi':
            container.innerHTML = getPemeriksaanHTML();
            loadPemeriksaan();
            break;
        case 'jadwal-imunisasi':
            calDate = new Date();
            container.innerHTML = getImunisasiHTML();
            loadImunisasiData();
            break;
        case 'growth-tracking':
            container.innerHTML = getGrowthTrackingHTML();
            loadGrowthAnakList();
            break;
        case 'laporan':
            container.innerHTML = getLaporanHTML();
            break;
        case 'settings':
            container.innerHTML = settingsPageHTML;
            fillSettingsProfile();
            break;
        default:
            container.innerHTML = getDashboardHTML();
            loadDashboard();
    }

    window.location.hash = page;
    if (window.innerWidth < 1024) closeMobileSidebar();
};

// ===================== AUTH =====================
let isLoggedIn = false;
let currentPageId = 'dashboard';

function showLoggedOutUI() {
    isLoggedIn = false;
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('topNavbar').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('lg:ml-[280px]');
    document.getElementById('fabBtn').classList.add('hidden');
    renderLoginPage();
    window.location.hash = 'login';
}

function showLoggedInUI() {
    isLoggedIn = true;
    const user = JSON.parse(localStorage.getItem('pos_user') || '{}');
    const initials = (user.nama || 'BA').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const topbarInitials = document.getElementById('topbarUserInitials');
    if (topbarInitials) topbarInitials.textContent = initials;
    document.getElementById('topbarUserName').textContent = user.nama || '—';
    document.getElementById('topbarUserRole').textContent = user.role === 'admin' ? 'Administrator' : 'Bidan';

    // Load avatar dari server (jika ada)
    loadAvatarToTopbar();

    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('topNavbar').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('lg:ml-[280px]');
    document.getElementById('fabBtn').classList.remove('hidden');

    const hash = window.location.hash.slice(1);
    const valid = ['dashboard','data-anak','data-ibu','pemeriksaan-gizi','jadwal-imunisasi','growth-tracking','laporan','settings'];
    navigateTo(valid.includes(hash) ? hash : 'dashboard');
}

window.doLogout = function () {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    showLoggedOutUI();
};

// ===================== SIDEBAR MOBILE =====================
function openMobileSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.remove('hidden');
}
function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.add('hidden');
}

// ===================== HASH ROUTING =====================
window.addEventListener('hashchange', () => {
    if (!isLoggedIn) return;
    const hash = window.location.hash.slice(1);
    const valid = ['dashboard','data-anak','data-ibu','pemeriksaan-gizi','jadwal-imunisasi','growth-tracking','laporan','settings'];
    if (valid.includes(hash)) navigateTo(hash);
});

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
    injectModals();

    document.getElementById('menuToggleBtn')?.addEventListener('click', openMobileSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', closeMobileSidebar);
    document.getElementById('closeSidebarBtn')?.addEventListener('click', closeMobileSidebar);
    document.getElementById('logoutBtnNav')?.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNewCheckupModal();
            closeModal('anakModal');
            closeModal('imunisasiModal');
            closeModal('detailAnakModal');
        }
    });

    const token = localStorage.getItem('pos_token');
    if (token) showLoggedInUI();
    else showLoggedOutUI();
});
