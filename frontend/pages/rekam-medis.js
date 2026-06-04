// ===================== REKAM MEDIS =====================
// Halaman terpisah untuk melihat riwayat pemeriksaan & imunisasi per anak
// Akses via: openRekamMedis(id) — dipanggil dari tabel Data Anak

let _rekamMedisAnakId = null;

// Entry point dari klik nama anak di tabel Data Anak
window.openRekamMedis = function (id) {
    _rekamMedisAnakId = id;
    navigateTo('rekam-medis');
};

// ===================== HTML TEMPLATE =====================

function getRekamMedisHTML() {
    return `
    <div id="rekamMedisPage">
        <div class="flex items-center gap-3 mb-6">
            <button onclick="navigateTo('data-anak')"
                class="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
                <span class="material-symbols-outlined text-xl">arrow_back</span>
                Kembali ke Data Anak
            </button>
        </div>
        <div id="rekamMedisContent">
            <div class="flex items-center justify-center py-20 text-on-surface-variant">
                <span class="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Memuat data rekam medis...
            </div>
        </div>
    </div>`;
}

// ===================== LOAD DATA =====================

async function loadRekamMedis() {
    const id = _rekamMedisAnakId;
    const content = document.getElementById('rekamMedisContent');
    if (!content) return;

    // Tidak ada anak dipilih → redirect ke Data Anak
    if (!id) {
        navigateTo('data-anak');
        showGlobalToast('Pilih anak terlebih dahulu dari Data Anak.');
        return;
    }

    const token = localStorage.getItem('pos_token');

    const [anakRes, imunRes] = await Promise.all([
        fetch(`${BASE_URL}/anak/${id}`, { headers: { Authorization: 'Bearer ' + token } })
            .then(r => r.json()).catch(() => null),
        fetch(`${BASE_URL}/imunisasi?anak_id=${id}&limit=50&_=${Date.now()}`, { headers: { Authorization: 'Bearer ' + token } })
            .then(r => r.json()).catch(() => null),
    ]);

    const anak = anakRes?.data;
    if (!anak) {
        content.innerHTML = `<div class="p-8 text-center text-error">Gagal memuat data anak.</div>`;
        return;
    }

    const pemList = anak.pemeriksaan || [];
    const imunList = imunRes?.data || [];

    renderRekamMedis(anak, pemList, imunList);
}

// ===================== RENDER =====================

function renderRekamMedis(anak, pemList, imunList) {
    const content = document.getElementById('rekamMedisContent');

    const genderBadge = anak.jenis_kelamin === 'L'
        ? '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Laki-laki</span>'
        : '<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">Perempuan</span>';

    const headerHTML = `
        <div class="bg-surface-container-lowest rounded-xl border p-6 mb-6">
            <div class="flex flex-wrap items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings:'FILL' 1">child_care</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                        <h2 class="text-headline-lg font-bold">${anak.nama}</h2>
                        ${genderBadge}
                    </div>
                    <p class="text-on-surface-variant text-sm">${umur(anak.tanggal_lahir)} · Lahir ${formatDate(anak.tanggal_lahir)}</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                    ${[
                        ['Nama Ibu', anak.nama_ibu || '—'],
                        ['Berat Lahir', anak.berat_lahir ? anak.berat_lahir + ' kg' : '—'],
                        ['Tinggi Lahir', anak.tinggi_lahir ? anak.tinggi_lahir + ' cm' : '—'],
                        ['Total Pemeriksaan', pemList.length + 'x'],
                    ].map(([label, val]) => `
                        <div class="text-center sm:text-left">
                            <div class="text-xs text-on-surface-variant">${label}</div>
                            <div class="text-sm font-semibold mt-0.5">${val}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

    const tabNavHTML = `
        <div class="border-b mb-0">
            <div class="flex gap-1">
                <button id="rmTabPemBtn" onclick="rmSwitchTab('pem')"
                    class="px-5 py-3 text-sm font-semibold border-b-2 border-primary text-primary transition-colors">
                    <span class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">monitor_weight</span>
                        Riwayat Pemeriksaan
                        <span class="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">${pemList.length}</span>
                    </span>
                </button>
                <button id="rmTabImunBtn" onclick="rmSwitchTab('imun')"
                    class="px-5 py-3 text-sm font-semibold border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-colors">
                    <span class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">vaccines</span>
                        Riwayat Imunisasi
                        <span class="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-full">${imunList.length}</span>
                    </span>
                </button>
            </div>
        </div>`;

    const pemHTML = pemList.length === 0
        ? `<div class="py-16 text-center">
            <span class="material-symbols-outlined text-5xl text-on-surface-variant/40 block mb-3">assignment</span>
            <p class="text-on-surface-variant text-sm">Belum ada riwayat pemeriksaan.</p>
           </div>`
        : `<div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-surface-container-low">
                    <tr>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">Tanggal</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">BB (kg)</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">TB (cm)</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">LK (cm)</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">Status Gizi</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${pemList.map((p, i) => `
                    <tr class="border-b hover:bg-surface-container-low/50 ${i % 2 === 0 ? '' : 'bg-surface-container-lowest/30'}">
                        <td class="p-4 font-medium">${formatDate(p.tanggal || p.tanggal_pemeriksaan)}</td>
                        <td class="p-4">${p.berat_badan ?? '—'}</td>
                        <td class="p-4">${p.tinggi_badan ?? '—'}</td>
                        <td class="p-4">${p.lingkar_kepala ?? '—'}</td>
                        <td class="p-4">
                            ${p.status_gizi
                                ? `<span class="px-2 py-1 rounded-full text-xs font-semibold ${giziClass(p.status_gizi)}">${p.status_gizi}</span>`
                                : '—'}
                        </td>
                        <td class="p-4 text-on-surface-variant max-w-[200px] truncate" title="${p.catatan || ''}">${p.catatan || '—'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;

    const statusMap = {
        selesai:   'bg-green-100 text-green-800',
        terjadwal: 'bg-yellow-100 text-yellow-800',
        terlewat:  'bg-red-100 text-red-800',
    };

    const imunHTML = imunList.length === 0
        ? `<div class="py-16 text-center">
            <span class="material-symbols-outlined text-5xl text-on-surface-variant/40 block mb-3">vaccines</span>
            <p class="text-on-surface-variant text-sm">Belum ada riwayat imunisasi.</p>
           </div>`
        : `<div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-surface-container-low">
                    <tr>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">Vaksin</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">Tanggal</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">Status</th>
                        <th class="p-4 text-left font-semibold text-xs uppercase tracking-wide text-on-surface-variant">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${imunList.map((item, i) => {
                        const cls = statusMap[item.status] || 'bg-surface-container text-on-surface-variant';
                        return `<tr class="border-b hover:bg-surface-container-low/50 ${i % 2 === 0 ? '' : 'bg-surface-container-lowest/30'}">
                            <td class="p-4 font-medium">${item.vaksin?.nama || item.nama_vaksin || '—'}</td>
                            <td class="p-4">${(item.tanggal || item.tanggal_jadwal) ? formatDate(item.tanggal || item.tanggal_jadwal) : '—'}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${cls}">${item.status || '—'}</span>
                            </td>
                            <td class="p-4 text-on-surface-variant">${item.catatan || '—'}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;

    content.innerHTML = `
        ${headerHTML}
        <div class="bg-surface-container-lowest rounded-xl border overflow-hidden">
            ${tabNavHTML}
            <div id="rmTabPemContent">${pemHTML}</div>
            <div id="rmTabImunContent" class="hidden">${imunHTML}</div>
        </div>`;
}

// ===================== TAB SWITCH =====================

window.rmSwitchTab = function (tab) {
    const isPem = tab === 'pem';
    const active   = 'px-5 py-3 text-sm font-semibold border-b-2 border-primary text-primary transition-colors';
    const inactive = 'px-5 py-3 text-sm font-semibold border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-colors';

    document.getElementById('rmTabPemBtn').className  = isPem ? active : inactive;
    document.getElementById('rmTabImunBtn').className = isPem ? inactive : active;
    document.getElementById('rmTabPemContent').classList.toggle('hidden', !isPem);
    document.getElementById('rmTabImunContent').classList.toggle('hidden', isPem);
};

// ===================== HELPER =====================

function giziClass(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('buruk'))  return 'bg-red-100 text-red-800';
    if (s.includes('kurang')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('normal') || s.includes('baik')) return 'bg-green-100 text-green-800';
    return 'bg-primary/10 text-primary';
}