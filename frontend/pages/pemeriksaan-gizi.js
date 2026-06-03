// ===================== PEMERIKSAAN GIZI =====================

function getPemeriksaanHTML() {
    return `
    <div>
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-headline-lg font-bold">Pemeriksaan Gizi</h2>
                <p class="text-on-surface-variant">Riwayat dan input pemeriksaan seluruh anak</p>
            </div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl border overflow-hidden">
            <div id="perikWrap">
                <div class="p-8 text-center text-on-surface-variant">Memuat...</div>
            </div>
        </div>
    </div>

    <!-- Modal Edit Pemeriksaan -->
    <div id="editPerikModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:100;display:none;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:16px;padding:24px;width:100%;max-width:480px;margin:16px;">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-base">Edit Pemeriksaan</h3>
                <button onclick="closeEditPerik()" class="p-1 rounded-full hover:bg-gray-100">
                    <span class="material-symbols-outlined text-gray-400">close</span>
                </button>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tgl Periksa</label>
                    <input type="date" id="editPerikTgl" class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Berat Badan (kg)</label>
                    <input type="number" step="0.01" id="editPerikBB" class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tinggi Badan (cm)</label>
                    <input type="number" step="0.01" id="editPerikTB" class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Lingkar Kepala (cm)</label>
                    <input type="number" step="0.01" id="editPerikLK" class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                </div>
            </div>
            <div class="mb-4">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Catatan</label>
                <textarea id="editPerikCatatan" rows="2" class="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"></textarea>
            </div>
            <div class="flex justify-end gap-2">
                <button onclick="closeEditPerik()" class="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button>
                <button onclick="submitEditPerik()" id="btnSimpanPerik" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-green-800">Simpan</button>
            </div>
        </div>
    </div>`;
}

function badgeGizi(s) {
    if (!s) return '<span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">—</span>';
    const m = { normal: 'bg-primary/20 text-primary', kurang: 'bg-yellow-100 text-yellow-800', buruk: 'bg-error-container text-error', lebih: 'bg-blue-100 text-blue-800' };
    return `<span class="${m[s] || 'bg-gray-100 text-gray-600'} px-2 py-0.5 rounded-full text-xs font-semibold">${s.charAt(0).toUpperCase() + s.slice(1)}</span>`;
}

async function loadPemeriksaan() {
    const token = localStorage.getItem('pos_token');
    const wrap = document.getElementById('perikWrap');
    if (!wrap) return;

    const anakRes = await fetch(BASE_URL + '/anak?limit=100', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
    const anakList = anakRes?.data || [];

    const rows = [];
    for (const a of anakList.slice(0, 20)) {
        const det = await fetch(BASE_URL + '/anak/' + a.id, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
        (det?.data?.pemeriksaan || []).forEach(p => rows.push({ anak: a.nama, ...p }));
    }
    rows.sort((a, b) => new Date(b.tanggal_pemeriksaan) - new Date(a.tanggal_pemeriksaan));

    if (rows.length === 0) {
        wrap.innerHTML = '<div class="p-8 text-center text-on-surface-variant">Belum ada data pemeriksaan.</div>';
        return;
    }

    wrap.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full">
                <thead class="bg-surface-container-low">
                    <tr>
                        <th class="p-4 text-left text-sm">Nama Anak</th>
                        <th class="p-4 text-left text-sm">Tgl Periksa</th>
                        <th class="p-4 text-left text-sm">BB (kg)</th>
                        <th class="p-4 text-left text-sm">TB (cm)</th>
                        <th class="p-4 text-left text-sm">Lingkar Kepala</th>
                        <th class="p-4 text-left text-sm">Status Gizi</th>
                        <th class="p-4 text-left text-sm">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                    <tr class="border-b hover:bg-surface-container-low/50">
                        <td class="p-4 font-medium">${r.anak}</td>
                        <td class="p-4 text-sm">${formatDate(r.tanggal_pemeriksaan)}</td>
                        <td class="p-4 text-sm">${r.berat_badan || '—'}</td>
                        <td class="p-4 text-sm">${r.tinggi_badan || '—'}</td>
                        <td class="p-4 text-sm">${r.lingkar_kepala || '—'}</td>
                        <td class="p-4">${badgeGizi(r.status_gizi)}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <button onclick='openEditPerik(${JSON.stringify(r)})' class="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button onclick="deletePerik(${r.id})" class="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors" title="Hapus">
                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
}

// ── EDIT ──
let _editPerikId = null;

window.openEditPerik = function (r) {
    _editPerikId = r.id;
    const tgl = r.tanggal_pemeriksaan ? new Date(r.tanggal_pemeriksaan).toISOString().split('T')[0] : '';
    document.getElementById('editPerikTgl').value      = tgl;
    document.getElementById('editPerikBB').value       = r.berat_badan || '';
    document.getElementById('editPerikTB').value       = r.tinggi_badan || '';
    document.getElementById('editPerikLK').value       = r.lingkar_kepala || '';
    document.getElementById('editPerikCatatan').value  = r.catatan || '';
    const modal = document.getElementById('editPerikModal');
    modal.style.display = 'flex';
};

window.closeEditPerik = function () {
    document.getElementById('editPerikModal').style.display = 'none';
    _editPerikId = null;
};

window.submitEditPerik = async function () {
    if (!_editPerikId) return;
    const token = localStorage.getItem('pos_token');
    const btn = document.getElementById('btnSimpanPerik');
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;

    const body = {
        tanggal_pemeriksaan: document.getElementById('editPerikTgl').value,
        berat_badan:         parseFloat(document.getElementById('editPerikBB').value),
        tinggi_badan:        parseFloat(document.getElementById('editPerikTB').value),
        lingkar_kepala:      parseFloat(document.getElementById('editPerikLK').value) || null,
        catatan:             document.getElementById('editPerikCatatan').value || null,
    };

    const res = await fetch(BASE_URL + '/pemeriksaan/' + _editPerikId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body)
    }).then(r => r.json()).catch(() => null);

    btn.textContent = 'Simpan';
    btn.disabled = false;

    if (res?.success) {
        closeEditPerik();
        showGlobalToast('Pemeriksaan berhasil diupdate!');
        loadPemeriksaan();
    } else {
        showGlobalToast(res?.message || 'Gagal mengupdate pemeriksaan', true);
    }
};

// ── DELETE ──
window.deletePerik = async function (id) {
    if (!confirm('Yakin ingin menghapus data pemeriksaan ini?')) return;
    const token = localStorage.getItem('pos_token');
    const res = await fetch(BASE_URL + '/pemeriksaan/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).catch(() => null);

    if (res?.success) {
        showGlobalToast('Pemeriksaan berhasil dihapus!');
        loadPemeriksaan();
    } else {
        showGlobalToast(res?.message || 'Gagal menghapus pemeriksaan', true);
    }
};