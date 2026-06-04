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
                        <th class="p-4 text-left text-sm">Tanggal Lahir</th>
                        <th class="p-4 text-left text-sm">Jenis Kelamin</th>
                        <th class="p-4 text-left text-sm">Berat Lahir</th>
                        <th class="p-4 text-left text-sm"></th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map(a => `
                    <tr class="border-b hover:bg-surface-container-low/50">
                        <td class="p-4">
                            <p class="font-semibold text-primary">${a.nama}</p>
                            <div class="text-xs text-on-surface-variant">${umur(a.tanggal_lahir)}</div>
                        </td>
                        <td class="p-4 text-sm text-on-surface-variant">${a.nama_ibu || '—'}</td>
                        <td class="p-4 text-sm">${formatDate(a.tanggal_lahir)}</td>
                        <td class="p-4">
                            ${a.jenis_kelamin === 'L'
                                ? '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Laki-laki</span>'
                                : '<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">Perempuan</span>'}
                        </td>
                        <td class="p-4 text-sm">${a.berat_lahir ? a.berat_lahir + ' kg' : '—'}</td>
                        <td class="p-4">
                            <div class="flex gap-2 items-center">
                                <button onclick="openRekamMedis('${a.id}')"
                                    title="Lihat Detail"
                                    class="flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">
                                    <span class="material-symbols-outlined text-[16px]">person_search</span> Lihat Detail
                                </button>
                                <button onclick="openAnakModal('${a.id}')"
                                    title="Edit"
                                    class="text-primary hover:text-green-800 transition-colors">
                                    <span class="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button onclick="deleteAnak('${a.id}','${a.nama}')"
                                    title="Hapus"
                                    class="text-error hover:text-red-800 transition-colors">
                                    <span class="material-symbols-outlined text-[20px]">delete</span>
                                </button>
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
        sel.innerHTML += `<option value="${i.id}">${i.nama || 'Ibu #' + i.id} (NIK: ${i.nik})</option>`;
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