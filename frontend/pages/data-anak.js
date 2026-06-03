// ===================== DATA ANAK =====================

let anakPage = 1, anakSearch = '';
let searchTimerAnak;

function getDataAnakHTML() {
    return `
    <div>
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-headline-lg font-bold">Data Anak</h2>
                <p class="text-on-surface-variant">Kelola seluruh data balita dan anak</p>
            </div>
            <button onclick="openAnakModal()" class="bg-primary text-white px-5 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-green-800">
                <span class="material-symbols-outlined">person_add</span> Tambah Data
            </button>
        </div>
        <div class="bg-surface-container-lowest rounded-xl border overflow-hidden">
            <div class="p-4 border-b flex justify-between flex-wrap gap-3">
                <input type="text" id="anakSearchInput" placeholder="Cari nama anak..."
                    oninput="searchAnak(this.value)"
                    class="border rounded-lg px-4 py-2 w-64 outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                <span id="anakCount" class="text-sm text-on-surface-variant self-center"></span>
            </div>
            <div id="anakTableWrap">
                <div class="p-8 text-center text-on-surface-variant">Memuat data...</div>
            </div>
        </div>
    </div>`;
}

async function loadAnakTable() {
    const token = localStorage.getItem('pos_token');
    const wrap = document.getElementById('anakTableWrap');
    if (!wrap) return;
    wrap.innerHTML = '<div class="p-8 text-center text-on-surface-variant">Memuat...</div>';

    const res = await fetch(`${BASE_URL}/anak?page=${anakPage}&limit=10&search=${encodeURIComponent(anakSearch)}`, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).catch(() => null);

    if (!res) { wrap.innerHTML = '<div class="p-8 text-center text-error">Gagal memuat data.</div>'; return; }

    const list = res.data || [];
    const p = res.pagination || {};
    const countEl = document.getElementById('anakCount');
    if (countEl) countEl.textContent = `${p.total || 0} anak terdaftar`;

    if (list.length === 0) {
        wrap.innerHTML = '<div class="p-8 text-center text-on-surface-variant">Belum ada data anak.</div>';
        return;
    }

    wrap.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full">
                <thead class="bg-surface-container-low">
                    <tr>
                        <th class="p-4 text-left text-sm">Nama Anak</th>
                        <th class="p-4 text-left text-sm">Nama Ibu</th>
                        <th class="p-4 text-left text-sm">Tgl Lahir</th>
                        <th class="p-4 text-left text-sm">JK</th>
                        <th class="p-4 text-left text-sm">Berat Lahir</th>
                        <th class="p-4 text-left text-sm">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map(a => `
                    <tr class="border-b hover:bg-surface-container-low/50">
                        <td class="p-4 font-medium">${a.nama}
                            <div class="text-xs text-on-surface-variant">${umur(a.tanggal_lahir)}</div>
                        </td>
                        <td class="p-4 text-sm text-on-surface-variant">${a.ibu?.pengguna?.nama || '—'}</td>
                        <td class="p-4 text-sm">${formatDate(a.tanggal_lahir)}</td>
                        <td class="p-4">
                            ${a.jenis_kelamin === 'L'
                                ? '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Laki-laki</span>'
                                : '<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">Perempuan</span>'}
                        </td>
                        <td class="p-4 text-sm">${a.berat_lahir ? a.berat_lahir + ' kg' : '—'}</td>
                        <td class="p-4">
                            <div class="flex gap-2 flex-wrap">
                                <button onclick="openDetailAnak('${a.id}')" class="text-tertiary font-semibold text-sm hover:underline">Detail</button>
                                <button onclick="openAnakModal('${a.id}')" class="text-secondary font-semibold text-sm hover:underline">Edit</button>
                                <button onclick="deleteAnak('${a.id}','${a.nama}')" class="text-error font-semibold text-sm hover:underline">Hapus</button>
                            </div>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <div class="flex justify-between items-center p-4 border-t flex-wrap gap-2">
            <span class="text-sm text-on-surface-variant">Hal ${p.page} dari ${p.totalPages || 1} · ${p.total || 0} data</span>
            <div class="flex gap-2">
                <button onclick="anakChangePage(${anakPage - 1})" ${anakPage <= 1 ? 'disabled' : ''}
                    class="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-surface-container-low">‹ Prev</button>
                <button onclick="anakChangePage(${anakPage + 1})" ${anakPage >= (p.totalPages || 1) ? 'disabled' : ''}
                    class="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-surface-container-low">Next ›</button>
            </div>
        </div>`;
}

window.searchAnak = function (v) {
    anakSearch = v; anakPage = 1;
    clearTimeout(searchTimerAnak);
    searchTimerAnak = setTimeout(loadAnakTable, 400);
};
window.anakChangePage = function (p) { anakPage = p; loadAnakTable(); };

window.openAnakModal = async function (id = null) {
    window._editAnakId = id;
    document.getElementById('anakModalTitle').textContent = id ? 'Edit Data Anak' : 'Tambah Data Anak';
    ['anakNama','anakJK','anakTglLahir','anakBeratLahir','anakTinggiLahir'].forEach(i => {
        const el = document.getElementById(i);
        if (el) el.value = '';
    });

    const token = localStorage.getItem('pos_token');
    const ibuRes = await fetch(BASE_URL + '/ibu?limit=100', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
    const sel = document.getElementById('anakIbuId');
    sel.innerHTML = '<option value="">-- Pilih Ibu --</option>';
    (ibuRes?.data || []).forEach(i => {
        sel.innerHTML += `<option value="${i.id}">${i.pengguna?.nama || 'Ibu #' + i.id} (NIK: ${i.nik})</option>`;
    });

    if (id) {
        const res = await fetch(BASE_URL + '/anak/' + id, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
        if (res?.data) {
            document.getElementById('anakNama').value = res.data.nama || '';
            document.getElementById('anakJK').value = res.data.jenis_kelamin || '';
            document.getElementById('anakTglLahir').value = res.data.tanggal_lahir || '';
            document.getElementById('anakIbuId').value = res.data.ibu_id || '';
            document.getElementById('anakBeratLahir').value = res.data.berat_lahir || '';
            document.getElementById('anakTinggiLahir').value = res.data.tinggi_lahir || '';
        }
    }
    document.getElementById('anakModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.saveAnak = async function () {
    const token = localStorage.getItem('pos_token');
    const body = {
        nama: document.getElementById('anakNama').value.trim(),
        jenis_kelamin: document.getElementById('anakJK').value,
        tanggal_lahir: document.getElementById('anakTglLahir').value,
        ibu_id: document.getElementById('anakIbuId').value,
        berat_lahir: document.getElementById('anakBeratLahir').value || null,
        tinggi_lahir: document.getElementById('anakTinggiLahir').value || null,
    };
    if (!body.nama || !body.jenis_kelamin || !body.tanggal_lahir || !body.ibu_id) {
        showGlobalToast('Lengkapi semua field wajib!', true); return;
    }
    const id = window._editAnakId;
    const res = await fetch(BASE_URL + '/anak' + (id ? '/' + id : ''), {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body)
    }).then(r => r.json()).catch(() => null);

    if (res?.success) {
        showGlobalToast(id ? 'Data anak diperbarui!' : 'Data anak ditambahkan!');
        closeModal('anakModal');
        loadAnakTable();
    } else showGlobalToast(res?.message || 'Gagal menyimpan', true);
};

window.deleteAnak = async function (id, nama) {
    if (!confirm(`Hapus data anak "${nama}"? Semua riwayat juga akan terhapus.`)) return;
    const token = localStorage.getItem('pos_token');
    const res = await fetch(BASE_URL + '/anak/' + id, {
        method: 'DELETE', headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).catch(() => null);
    if (res?.success) { showGlobalToast('Data anak dihapus.'); loadAnakTable(); }
    else showGlobalToast(res?.message || 'Gagal menghapus', true);
};

// ===================== DETAIL ANAK MODAL =====================

window.openDetailAnak = async function (id) {
    const token = localStorage.getItem('pos_token');
    const modal = document.getElementById('detailAnakModal');
    const modalBody = document.getElementById('detailAnakBody');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modalBody.innerHTML = '<div class="p-8 text-center text-on-surface-variant">Memuat data...</div>';

    const [anakRes, imunRes] = await Promise.all([
        fetch(`${BASE_URL}/anak/${id}`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null),
        fetch(`${BASE_URL}/imunisasi?anak_id=${id}&limit=50`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null),
    ]);

    const anak = anakRes?.data;
    if (!anak) {
        modalBody.innerHTML = '<div class="p-8 text-center text-error">Gagal memuat data anak.</div>';
        return;
    }

    // Backend sudah sertakan pemeriksaan langsung di GET /anak/:id
    const pemList = anak.pemeriksaan || [];
    const imunList = imunRes?.data || [];

    const genderBadge = anak.jenis_kelamin === 'L'
        ? '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Laki-laki</span>'
        : '<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">Perempuan</span>';

    const infoRows = [
        ['Nama Ibu', anak.nama_ibu || '—'],
        ['Tanggal Lahir', formatDate(anak.tanggal_lahir) + ' · ' + umur(anak.tanggal_lahir)],
        ['Berat Lahir', anak.berat_lahir ? anak.berat_lahir + ' kg' : '—'],
        ['Tinggi Lahir', anak.tinggi_lahir ? anak.tinggi_lahir + ' cm' : '—'],
    ];

    const pemHTML = pemList.length === 0
        ? '<div class="p-8 text-center text-on-surface-variant text-sm">Belum ada riwayat pemeriksaan.</div>'
        : `<div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-surface-container-low">
                    <tr>
                        <th class="p-3 text-left font-semibold">Tanggal</th>
                        <th class="p-3 text-left font-semibold">BB (kg)</th>
                        <th class="p-3 text-left font-semibold">TB (cm)</th>
                        <th class="p-3 text-left font-semibold">LK (cm)</th>
                        <th class="p-3 text-left font-semibold">Status Gizi</th>
                        <th class="p-3 text-left font-semibold">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${pemList.map(p => `
                    <tr class="border-b hover:bg-surface-container-low/50">
                        <td class="p-3">${formatDate(p.tanggal || p.tanggal_pemeriksaan)}</td>
                        <td class="p-3">${p.berat_badan ?? '—'}</td>
                        <td class="p-3">${p.tinggi_badan ?? '—'}</td>
                        <td class="p-3">${p.lingkar_kepala ?? '—'}</td>
                        <td class="p-3">${p.status_gizi
                            ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">${p.status_gizi}</span>`
                            : '—'}</td>
                        <td class="p-3 text-on-surface-variant max-w-[160px] truncate">${p.catatan || '—'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;

    const statusMap = {
        selesai: 'bg-green-100 text-green-800',
        terjadwal: 'bg-yellow-100 text-yellow-800',
        terlewat: 'bg-red-100 text-red-800',
    };

    const imunHTML = imunList.length === 0
        ? '<div class="p-8 text-center text-on-surface-variant text-sm">Belum ada riwayat imunisasi.</div>'
        : `<div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-surface-container-low">
                    <tr>
                        <th class="p-3 text-left font-semibold">Vaksin</th>
                        <th class="p-3 text-left font-semibold">Tanggal</th>
                        <th class="p-3 text-left font-semibold">Status</th>
                        <th class="p-3 text-left font-semibold">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${imunList.map(i => {
                        const cls = statusMap[i.status] || 'bg-surface-container text-on-surface-variant';
                        return `<tr class="border-b hover:bg-surface-container-low/50">
                            <td class="p-3 font-medium">${i.vaksin?.nama || i.nama_vaksin || '—'}</td>
                            <td class="p-3">${(i.tanggal || i.tanggal_jadwal) ? formatDate(i.tanggal || i.tanggal_jadwal) : '—'}</td>
                            <td class="p-3"><span class="px-2 py-0.5 rounded-full text-xs font-semibold ${cls}">${i.status || '—'}</span></td>
                            <td class="p-3 text-on-surface-variant">${i.catatan || '—'}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;

    modalBody.innerHTML = `
        <!-- Info header anak -->
        <div class="flex flex-wrap items-start gap-4 mb-6">
            <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings:'FILL' 1">child_care</span>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-title-lg font-bold">${anak.nama}</h3>
                    ${genderBadge}
                </div>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                    ${infoRows.map(([l, v]) => `
                    <div>
                        <div class="text-xs text-on-surface-variant">${l}</div>
                        <div class="text-sm font-semibold">${v}</div>
                    </div>`).join('')}
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="border-b">
            <div class="flex">
                <button id="tabPemBtn" onclick="switchDetailTab('pem')"
                    class="px-5 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary transition-colors">
                    Riwayat Pemeriksaan
                    <span class="ml-1.5 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">${pemList.length}</span>
                </button>
                <button id="tabImunBtn" onclick="switchDetailTab('imun')"
                    class="px-5 py-2.5 text-sm font-semibold border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-colors">
                    Riwayat Imunisasi
                    <span class="ml-1.5 bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-full">${imunList.length}</span>
                </button>
            </div>
        </div>

        <!-- Tab content -->
        <div id="tabPemContent" class="rounded-b-xl border border-t-0 overflow-hidden">${pemHTML}</div>
        <div id="tabImunContent" class="rounded-b-xl border border-t-0 overflow-hidden hidden">${imunHTML}</div>
    `;
};

window.switchDetailTab = function (tab) {
    const isPem = tab === 'pem';
    const activeClass = 'px-5 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary transition-colors';
    const inactiveClass = 'px-5 py-2.5 text-sm font-semibold border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-colors';
    document.getElementById('tabPemBtn').className = isPem ? activeClass : inactiveClass;
    document.getElementById('tabImunBtn').className = isPem ? inactiveClass : activeClass;
    document.getElementById('tabPemContent').classList.toggle('hidden', !isPem);
    document.getElementById('tabImunContent').classList.toggle('hidden', isPem);
};