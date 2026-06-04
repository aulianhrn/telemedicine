// ===================== DASHBOARD =====================

function getDashboardHTML() {
    return `
    <div>
        <div class="flex flex-wrap justify-between items-center mb-6">
            <div>
                <h2 class="text-headline-lg font-bold">Dashboard Overview</h2>
                <p class="text-on-surface-variant">Selamat datang, Bidan. Ringkasan aktivitas Posyandu hari ini.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <div class="flex justify-between">
                    <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">child_care</span>
                    <span class="text-primary text-sm font-semibold">Terdaftar</span>
                </div>
                <p class="text-on-surface-variant mt-3 text-sm">Total Anak</p>
                <p class="text-3xl font-bold mt-1" id="statAnak">...</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <div class="flex justify-between">
                    <span class="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">pregnant_woman</span>
                    <span class="text-secondary text-sm font-semibold">Terdaftar</span>
                </div>
                <p class="text-on-surface-variant mt-3 text-sm">Ibu Terdaftar</p>
                <p class="text-3xl font-bold mt-1" id="statIbu">...</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <div class="flex justify-between">
                    <span class="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg">vaccines</span>
                    <span class="text-tertiary text-sm font-semibold">Hari ini</span>
                </div>
                <p class="text-on-surface-variant mt-3 text-sm">Imunisasi Pending</p>
                <p class="text-3xl font-bold mt-1" id="statImu">...</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <div class="flex justify-between">
                    <span class="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">warning</span>
                    <span class="text-error text-sm font-semibold">Perlu tindak</span>
                </div>
                <p class="text-on-surface-variant mt-3 text-sm">Gizi Kurang/Buruk</p>
                <p class="text-3xl font-bold mt-1" id="statGizi">...</p>
            </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2 bg-surface-container-lowest p-5 rounded-xl border">
                <h3 class="font-headline-sm mb-4">Distribusi Status Gizi (3 Bln Terakhir)</h3>
                <div class="grid grid-cols-3 gap-3 text-center mb-4">
                    <div class="p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <div class="text-2xl font-bold text-primary" id="giziNormal">...</div>
                        <div class="text-xs text-on-surface-variant mt-1">Normal</div>
                    </div>
                    <div class="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div class="text-2xl font-bold text-yellow-700" id="giziKurang">...</div>
                        <div class="text-xs text-on-surface-variant mt-1">Kurang</div>
                    </div>
                    <div class="p-3 rounded-xl bg-error-container border border-error/20">
                        <div class="text-2xl font-bold text-error" id="giziBuruk">...</div>
                        <div class="text-xs text-on-surface-variant mt-1">Buruk</div>
                    </div>
                </div>
                <h4 class="text-sm font-semibold text-on-surface-variant mb-2">Imunisasi Bulan Ini</h4>
                <div class="w-full bg-surface-container-highest rounded-full h-3">
                    <div class="bg-primary h-3 rounded-full transition-all" id="imuBar" style="width:0%"></div>
                </div>
                <div class="flex justify-between text-xs text-on-surface-variant mt-1">
                    <span id="imuSelesai">0 selesai</span>
                    <span id="imuPersen">0%</span>
                </div>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <h3 class="font-headline-sm mb-4">Jadwal Hari Ini</h3>
                <div id="imuHariIni" class="space-y-3">
                    <div class="text-sm text-on-surface-variant text-center py-4">Memuat...</div>
                </div>

            </div>
        </div>

        <div class="bg-surface-container-lowest rounded-xl border overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-headline-sm">Data Anak Terbaru</h3>
                <button onclick="navigateTo('data-anak')" class="text-primary text-sm font-semibold hover:underline">Lihat semua →</button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-surface-container-low">
                        <tr>
                            <th class="p-4 text-left text-sm">Nama Anak</th>
                            <th class="p-4 text-left text-sm">Nama Ibu</th>
                            <th class="p-4 text-left text-sm">Tanggal Lahir</th>
                            <th class="p-4 text-left text-sm">Jenis Kelamin</th>
                        </tr>
                    </thead>
                    <tbody id="dashAnakTable">
                        <tr><td colspan="5" class="p-4 text-center text-on-surface-variant text-sm">Memuat...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

async function loadDashboard() {
    const token = localStorage.getItem('pos_token');
    try {
        const [dashRes, anakRes] = await Promise.all([
            fetch(BASE_URL + '/dashboard', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(BASE_URL + '/anak?limit=5', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
        ]);
        const d = dashRes.data || {};
        const anak = anakRes.data || [];

        document.getElementById('statAnak').textContent = d.total_anak || 0;
        document.getElementById('statIbu').textContent = d.total_ibu || 0;
        document.getElementById('statImu').textContent = d.imunisasi_hari_ini || 0;
        document.getElementById('statGizi').textContent = (d.status_gizi?.kurang || 0) + (d.status_gizi?.buruk || 0);

        document.getElementById('giziNormal').textContent = d.status_gizi?.normal || 0;
        document.getElementById('giziKurang').textContent = d.status_gizi?.kurang || 0;
        document.getElementById('giziBuruk').textContent = d.status_gizi?.buruk || 0;

        const total = d.imunisasi_bulan_ini?.total || 0;
        const selesai = d.imunisasi_bulan_ini?.selesai || 0;
        const persen = total ? Math.round((selesai / total) * 100) : 0;
        document.getElementById('imuBar').style.width = persen + '%';
        document.getElementById('imuSelesai').textContent = `${selesai} selesai dari ${total}`;
        document.getElementById('imuPersen').textContent = persen + '%';

        const imuHariIni = d.imunisasi_hari_ini || 0;
        document.getElementById('imuHariIni').innerHTML = imuHariIni > 0
            ? `<div class="flex gap-3 items-center p-3 rounded-xl bg-primary/5 border-l-4 border-primary">
                <span class="material-symbols-outlined text-primary">vaccines</span>
                <div><p class="font-bold text-sm">${imuHariIni} jadwal hari ini</p><p class="text-xs text-on-surface-variant">Segera ditangani</p></div>
               </div>`
            : `<div class="text-sm text-on-surface-variant text-center py-4">Tidak ada jadwal imunisasi hari ini 🎉</div>`;

            
        // Tambahkan fungsi helper untuk render baris anak (bisa dipakai di dashboard dan data anak)
// Buat fungsi render yang lebih fleksibel
function renderAnakRow(a, showActions = true) {
    return `
        <tr class="border-b hover:bg-surface-container-low/50">
            <td class="p-4 font-medium">
                ${a.nama}
                <div class="text-xs text-on-surface-variant">${umur(a.tanggal_lahir)}</div>
            </td>
            <td class="p-4 text-sm text-on-surface-variant">${a.nama_ibu || '—'}</td>
            <td class="p-4 text-sm">${formatDate(a.tanggal_lahir)}</td>
            <td class="p-4">
                ${a.jenis_kelamin === 'L' 
                    ? '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Laki-laki</span>'
                    : '<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">Perempuan</span>'}
            </td>
            ${showActions ? `
            <td class="p-4">
                <div class="flex gap-2 flex-wrap">
                    <button onclick="openDetailAnak('${a.id}')" class="text-tertiary font-semibold text-sm hover:underline">Detail</button>
                    <button onclick="openCheckupForAnak('${a.id}')" class="text-primary font-semibold text-sm hover:underline">Checkup</button>
                </div>
            </td>
            ` : ''}
        </table>
    `;
}

// Di loadDashboard() - tanpa aksi
document.getElementById('dashAnakTable').innerHTML = anak.length === 0
    ? '<tr><td colspan="4" class="p-4 text-center text-on-surface-variant text-sm">Belum ada data anak</td></tr>'
    : anak.map(a => renderAnakRow(a, false)).join('');
//                                              ↑ false = tanpa aksi

// Di loadAnakTable() - dengan aksi
// Sesuaikan juga di sini jika ingin menggunakan fungsi yang sama
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
                </tr>
            </thead>
            <tbody>
                # ${list.map(a => renderAnakRow(a, true)).join('')}
                <!--                          ↑ true = dengan aksi -->
            </tbody>
        </table>
    </div>`;

// Dan di loadAnakTable(), bisa juga pakai fungsi yang sama
    } catch (e) {
        console.error('Dashboard error:', e);
    }
}