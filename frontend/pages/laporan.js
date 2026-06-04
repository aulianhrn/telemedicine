// ===================== LAPORAN =====================

function getLaporanHTML() {
    const now = new Date();
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `
    <div>
        <div class="flex flex-wrap justify-between items-center mb-5">
            <div>
                <h2 class="text-headline-lg font-bold">Laporan Posyandu</h2>
                <p class="text-on-surface-variant">Rekap laporan bulanan</p>
            </div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl border p-5 mb-5">
            <h3 class="font-headline-sm mb-4">Filter Periode</h3>
            <div class="flex gap-4 flex-wrap items-end">
                <div>
                    <label class="text-label-md text-on-surface-variant block mb-1">Bulan</label>
                    <select id="lapBulan" class="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        ${months.map((m, i) => `<option value="${i + 1}" ${i + 1 === now.getMonth() + 1 ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="text-label-md text-on-surface-variant block mb-1">Tahun</label>
                    <input type="number" id="lapTahun" value="${now.getFullYear()}"
                        class="border rounded-lg px-4 py-2 outline-none w-24 text-sm">
                </div>
                <button onclick="loadRekap()" class="bg-primary text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-green-800 cursor-pointer">
                    <span class="material-symbols-outlined text-[18px]">bar_chart</span> Lihat Rekap
                </button>
            </div>
        </div>
        <div id="rekapResult"></div>
    </div>`;
}

window.loadRekap = async function () {
    const token = localStorage.getItem('pos_token');
    const b = document.getElementById('lapBulan')?.value;
    const t = document.getElementById('lapTahun')?.value;
    const el = document.getElementById('rekapResult');
    if (!el) return;
    el.innerHTML = '<div class="p-8 text-center text-on-surface-variant">Memuat rekap...</div>';

    const res = await fetch(`${BASE_URL}/laporan/rekap-bulanan?bulan=${b}&tahun=${t}`, {
        headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).catch(() => null);

    if (!res?.success) { 
        el.innerHTML = '<div class="p-8 text-center text-error">Gagal memuat rekap.</div>'; 
        return; 
    }
    
    const d = res.data;

    el.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg block w-fit">stethoscope</span>
                <p class="text-on-surface-variant mt-3 text-sm">Total Pemeriksaan</p>
                <p class="text-3xl font-bold mt-1">${d.total_pemeriksaan}</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg block w-fit">check_circle</span>
                <p class="text-on-surface-variant mt-3 text-sm">Gizi Normal</p>
                <p class="text-3xl font-bold mt-1">${d.status_gizi?.normal || 0}</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <span class="material-symbols-outlined text-yellow-600 bg-yellow-50 p-2 rounded-lg block w-fit">warning</span>
                <p class="text-on-surface-variant mt-3 text-sm">Gizi Kurang</p>
                <p class="text-3xl font-bold mt-1">${d.status_gizi?.kurang || 0}</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <span class="material-symbols-outlined text-red-600 bg-red-50 p-2 rounded-lg block w-fit">dangerous</span>
                <p class="text-on-surface-variant mt-3 text-sm">Gizi Buruk</p>
                <p class="text-3xl font-bold mt-1">${d.status_gizi?.buruk || 0}</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <span class="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg block w-fit">vaccines</span>
                <p class="text-on-surface-variant mt-3 text-sm">Imunisasi Selesai</p>
                <p class="text-3xl font-bold mt-1">${d.imunisasi?.selesai || 0}<span class="text-base text-on-surface-variant">/${d.imunisasi?.total || 0}</span></p>
            </div>
        </div>`;
};

// Fungsi simpanLaporan dihapus karena tidak digunakan