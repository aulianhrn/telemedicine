// ===================== JADWAL IMUNISASI =====================

let calDate = new Date();
let imuData = [];

function getImunisasiHTML() {
    return `
    <div>
        <div class="flex flex-wrap justify-between items-center mb-5">
            <div>
                <h2 class="text-headline-lg font-bold">Jadwal Imunisasi</h2>
                <p class="text-on-surface-variant">Kalender vaksinasi lengkap & jadwal posyandu terintegrasi</p>
            </div>
            <button onclick="openImunisasiModal()" class="bg-primary text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-md cursor-pointer hover:bg-green-800">
                <span class="material-symbols-outlined">add_circle</span> Jadwal Baru
            </button>
        </div>
        <div class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
                <div id="dynamicCalendar"><div class="p-8 text-center text-on-surface-variant">Memuat kalender...</div></div>
            </div>
            <div class="space-y-5">
                <div class="bg-surface-container-lowest rounded-2xl border p-5">
                    <h3 class="font-headline-sm flex items-center gap-2 mb-4">
                        <span class="material-symbols-outlined text-primary">today</span> Daftar Jadwal
                    </h3>
                    <div id="imuListSide" class="space-y-3 max-h-80 overflow-y-auto">
                        <div class="text-sm text-on-surface-variant text-center py-4">Memuat...</div>
                    </div>
                </div>
                <div class="bg-primary-container/10 rounded-2xl p-5 border border-primary/20">
                    <h4 class="font-bold flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined">insights</span> Cakupan Bulan Ini
                    </h4>
                    <div class="w-full bg-surface-container-highest rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full transition-all" id="imuCovBar" style="width:0%"></div>
                    </div>
                    <p class="text-sm mt-2" id="imuCovText">Memuat...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Tambah / Edit Imunisasi -->
    <div id="imunisasiModal" style="display:none" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold" id="imuModalTitle">Tambah Jadwal Imunisasi</h3>
                <button onclick="closeModal('imunisasiModal')" class="p-1 rounded-full hover:bg-surface-container-low">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <input type="hidden" id="imuEditId">
            <div class="space-y-3">
                <div>
                    <label class="text-sm text-on-surface-variant mb-1 block">Nama Anak</label>
                    <select id="imuAnakId" class="w-full border rounded-xl px-3 py-2 text-sm">
                        <option value="">-- Pilih Anak --</option>
                    </select>
                </div>
                <div>
                    <label class="text-sm text-on-surface-variant mb-1 block">Nama Vaksin</label>
                    <input id="imuVaksin" type="text" placeholder="cth. Polio 1" class="w-full border rounded-xl px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="text-sm text-on-surface-variant mb-1 block">Tanggal Jadwal</label>
                    <input id="imuTgl" type="date" class="w-full border rounded-xl px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="text-sm text-on-surface-variant mb-1 block">Status</label>
                    <select id="imuStatus" class="w-full border rounded-xl px-3 py-2 text-sm">
                        <option value="pending">Belum selesai</option>
                        <option value="selesai">Selesai</option>
                    </select>
                </div>
            </div>
            <div class="flex gap-3 mt-5">
                <button onclick="closeModal('imunisasiModal')" class="flex-1 border rounded-xl py-2 text-sm hover:bg-surface-container-low">Batal</button>
                <button onclick="saveImunisasi()" class="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-semibold hover:bg-green-800">Simpan</button>
            </div>
        </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div id="hapusImunisasiModal" style="display:none" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-lg font-bold mb-2">Hapus Jadwal</h3>
            <p class="text-sm text-on-surface-variant mb-5">
                Yakin ingin menghapus jadwal vaksin <span id="hapusImuLabel" class="font-semibold text-on-surface"></span>?
                Tindakan ini tidak bisa dibatalkan.
            </p>
            <div class="flex gap-3">
                <button onclick="closeModal('hapusImunisasiModal')" class="flex-1 border rounded-xl py-2 text-sm hover:bg-surface-container-low">Batal</button>
                <button onclick="confirmHapusImunisasi()" class="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-red-700">Hapus</button>
            </div>
        </div>
    </div>`;
}

async function loadImunisasiData() {
    const token = localStorage.getItem('pos_token');
    const b = calDate.getMonth() + 1;
    const t = calDate.getFullYear();
    const res = await fetch(`${BASE_URL}/imunisasi?bulan=${b}&tahun=${t}&limit=100`, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).catch(() => null);
    imuData = res?.data || [];
    renderImmunizationCalendar();
    renderImuSide();
}

function renderImmunizationCalendar() {
    const cal = document.getElementById('dynamicCalendar');
    if (!cal) return;

    const year = calDate.getFullYear(), month = calDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

    const byDay = {};
    imuData.forEach(i => {
        const d = new Date(i.tanggal_jadwal).getDate();
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(i);
    });

    let html = `
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div class="flex items-center gap-3">
                <button id="prevMonthBtn" class="p-2 rounded-full border border-outline-variant hover:bg-surface-container-low">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <h3 class="text-headline-sm font-bold">${monthNames[month]} ${year}</h3>
                <button id="nextMonthBtn" class="p-2 rounded-full border border-outline-variant hover:bg-surface-container-low">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            <div class="text-sm text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                Total: ${imuData.length} jadwal
            </div>
        </div>
        <div class="grid grid-cols-7 gap-2 text-center font-bold text-label-md text-on-surface-variant mb-3">
            <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
        </div>
        <div class="grid grid-cols-7 gap-2 auto-rows-fr">`;

    for (let i = 0; i < startOffset; i++) html += `<div class="p-2 h-24 rounded-xl bg-surface-container-low/20"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = isCurrentMonth && today.getDate() === d;
        const evts = byDay[d] || [];
        html += `<div class="p-2 h-24 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:shadow-sm transition-all flex flex-col overflow-y-auto calendar-day ${isToday ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}">
            <div class="flex justify-between items-center">
                <span class="font-bold ${isToday ? 'text-primary text-lg' : 'text-on-surface'}">${d}</span>
                ${isToday ? '<span class="text-[10px] bg-primary/20 px-1 rounded-full">Hari ini</span>' : ''}
            </div>`;
        evts.slice(0, 2).forEach(e => {
            const color = e.status === 'selesai' ? 'bg-primary/20 text-primary' : 'bg-yellow-100 text-yellow-800';
            html += `<div class="mt-1 text-[11px] font-semibold ${color} px-2 py-0.5 rounded-full truncate">${e.nama_vaksin}</div>`;
        });
        if (evts.length > 2) html += `<div class="mt-1 text-[10px] text-on-surface-variant">+${evts.length - 2} lagi</div>`;
        html += `</div>`;
    }

    const totalCells = startOffset + daysInMonth;
    const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let i = 0; i < remaining; i++) html += `<div class="p-2 h-24 rounded-xl bg-surface-container-low/20"></div>`;
    html += `</div>`;

    cal.innerHTML = html;
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() - 1); loadImunisasiData(); });
    document.getElementById('nextMonthBtn')?.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() + 1); loadImunisasiData(); });
}

function renderImuSide() {
    const side = document.getElementById('imuListSide');
    const covBar = document.getElementById('imuCovBar');
    const covText = document.getElementById('imuCovText');

    const selesai = imuData.filter(i => i.status === 'selesai').length;
    const total = imuData.length;
    const persen = total ? Math.round((selesai / total) * 100) : 0;
    if (covBar) covBar.style.width = persen + '%';
    if (covText) covText.textContent = `${persen}% tercapai (${selesai}/${total})`;

    if (!side) return;
    if (imuData.length === 0) {
        side.innerHTML = '<div class="text-sm text-on-surface-variant text-center py-4">Tidak ada jadwal bulan ini</div>';
        return;
    }

    side.innerHTML = imuData.map(i => `
        <div class="flex gap-3 items-center p-3 rounded-xl ${i.status === 'selesai' ? 'bg-primary/5 border-l-4 border-primary' : 'bg-yellow-50 border-l-4 border-yellow-400'}">
            <span class="material-symbols-outlined ${i.status === 'selesai' ? 'text-primary' : 'text-yellow-600'}">vaccines</span>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-sm truncate">${i.nama_anak || '—'}</p>
                <p class="text-xs text-on-surface-variant">${i.nama_vaksin} · ${formatDate(i.tanggal_jadwal)}</p>
            </div>
            <div class="flex gap-1 items-center flex-shrink-0">
                ${i.status === 'selesai'
                    ? `<span class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Selesai</span>
                       <button onclick="openEditImunisasiModal('${i.id}')" title="Edit" class="p-1 rounded-lg hover:bg-surface-container-low text-on-surface-variant cursor-pointer">
                           <span class="material-symbols-outlined text-base">edit</span>
                       </button>`
                    : `<button onclick="openEditImunisasiModal('${i.id}')" title="Edit" class="p-1 rounded-lg hover:bg-yellow-100 text-yellow-700 cursor-pointer">
                           <span class="material-symbols-outlined text-base">edit</span>
                       </button>
                       <button onclick="openHapusImunisasiModal('${i.id}', '${(i.nama_vaksin + ' – ' + i.nama_anak).replace(/'/g, "\\'")}')" title="Hapus" class="p-1 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer">
                           <span class="material-symbols-outlined text-base">delete</span>
                       </button>
                       <button onclick="tandaiSelesai('${i.id}')" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full cursor-pointer hover:bg-yellow-200">Tandai</button>`
                }
            </div>
        </div>`).join('');
}

// ── Buka modal tambah ──────────────────────────────────────────────────────────
window.openImunisasiModal = async function () {
    const token = localStorage.getItem('pos_token');
    const sel = document.getElementById('imuAnakId');
    sel.innerHTML = '<option value="">-- Pilih Anak --</option>';
    const res = await fetch(BASE_URL + '/anak?limit=100', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
    (res?.data || []).forEach(a => { sel.innerHTML += `<option value="${a.id}">${a.nama}</option>`; });

    document.getElementById('imuEditId').value = '';
    document.getElementById('imuVaksin').value = '';
    document.getElementById('imuTgl').value = '';
    document.getElementById('imuStatus').value = 'pending';
    document.getElementById('imuModalTitle').textContent = 'Tambah Jadwal Imunisasi';
    document.getElementById('imunisasiModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// ── Buka modal edit ────────────────────────────────────────────────────────────
window.openEditImunisasiModal = async function (id) {
    const item = imuData.find(i => i.id == id);
    if (!item) return;

    const token = localStorage.getItem('pos_token');
    const sel = document.getElementById('imuAnakId');
    sel.innerHTML = '<option value="">-- Pilih Anak --</option>';
    const res = await fetch(BASE_URL + '/anak?limit=100', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
    (res?.data || []).forEach(a => { sel.innerHTML += `<option value="${a.id}">${a.nama}</option>`; });

    // Pre-fill field dengan data yang ada
    document.getElementById('imuEditId').value = item.id;
    document.getElementById('imuAnakId').value = item.anak_id;
    document.getElementById('imuVaksin').value = item.nama_vaksin;
    document.getElementById('imuTgl').value = item.tanggal_jadwal?.split('T')[0] ?? item.tanggal_jadwal;
    document.getElementById('imuStatus').value = item.status === 'selesai' ? 'selesai' : 'pending';
    document.getElementById('imuModalTitle').textContent = 'Edit Jadwal Imunisasi';
    document.getElementById('imunisasiModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// ── Simpan (tambah atau edit) ──────────────────────────────────────────────────
window.saveImunisasi = async function () {
    const token = localStorage.getItem('pos_token');
    const editId = document.getElementById('imuEditId').value;

    console.log('editId value:', editId); 
    const body = {
        anak_id: document.getElementById('imuAnakId').value,
        nama_vaksin: document.getElementById('imuVaksin').value.trim(),
        tanggal_jadwal: document.getElementById('imuTgl').value,
        status: document.getElementById('imuStatus').value,
    };

    if (!body.anak_id || !body.nama_vaksin || !body.tanggal_jadwal) {
        showGlobalToast('Lengkapi semua field!', true); return;
    }

    const url = editId
        ? `${BASE_URL}/imunisasi/${editId}`.replace(/\/\//g, '/')
        : `${BASE_URL}/imunisasi`;

    const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body)
    }).then(r => r.json()).catch(() => null);

    if (res?.success) {
        showGlobalToast(editId ? 'Jadwal diperbarui!' : 'Jadwal ditambahkan!');
        closeModal('imunisasiModal');
        loadImunisasiData();
    } else {
        showGlobalToast(res?.message || 'Gagal', true);
    }
};

// ── Buka konfirmasi hapus ──────────────────────────────────────────────────────
window.openHapusImunisasiModal = function (id, label) {
    document.getElementById('hapusImuLabel').textContent = label;
    document.getElementById('hapusImunisasiModal').dataset.deleteId = id;
    document.getElementById('hapusImunisasiModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

// ── Eksekusi hapus ─────────────────────────────────────────────────────────────
window.confirmHapusImunisasi = async function () {
    const token = localStorage.getItem('pos_token');
    const id = document.getElementById('hapusImunisasiModal').dataset.deleteId;
    if (!id) return;

    const res = await fetch(`${BASE_URL}/imunisasi/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).catch(() => null);

    if (res?.success) {
        showGlobalToast('Jadwal dihapus!');
        closeModal('hapusImunisasiModal');
        loadImunisasiData();
    } else {
        showGlobalToast(res?.message || 'Gagal menghapus', true);
    }
};

// ── Tandai selesai – PATCH /imunisasi/:id/status ───────────────────────────────
window.tandaiSelesai = async function (id) {
    const token = localStorage.getItem('pos_token');
    const res = await fetch(`${BASE_URL}/imunisasi/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ status: 'selesai' })
    }).then(r => r.json()).catch(() => null);
    if (res?.success) { showGlobalToast('Imunisasi selesai!'); loadImunisasiData(); }
    else showGlobalToast(res?.message || 'Gagal', true);
};