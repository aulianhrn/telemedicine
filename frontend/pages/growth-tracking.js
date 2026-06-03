// ===================== GROWTH TRACKING =====================

function getGrowthTrackingHTML() {
    return `
    <div>
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-headline-lg font-bold">Growth Tracking</h2>
                <p class="text-on-surface-variant">Grafik pertumbuhan berat dan tinggi badan anak</p>
            </div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl border p-5 mb-5">
            <label class="text-label-md text-on-surface-variant block mb-1">Pilih Anak</label>
            <select id="growthAnakSel" onchange="loadGrowthChart(this.value)"
                class="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm w-full md:w-72">
                <option value="">-- Pilih anak untuk melihat grafik --</option>
            </select>
        </div>
        <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <h3 class="font-headline-sm mb-4">Grafik Berat Badan (kg)</h3>
                <div id="bbChartWrap" class="h-48 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant text-sm">
                    Pilih anak untuk melihat grafik
                </div>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border">
                <h3 class="font-headline-sm mb-4">Grafik Tinggi Badan (cm)</h3>
                <div id="tbChartWrap" class="h-48 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant text-sm">
                    Pilih anak untuk melihat grafik
                </div>
            </div>
        </div>
        <div id="growthTable" class="bg-surface-container-lowest rounded-xl border overflow-hidden" style="display:none">
            <div class="p-4 border-b"><h3 class="font-headline-sm">Riwayat Pengukuran</h3></div>
            <div class="overflow-x-auto" id="growthTableInner"></div>
        </div>
    </div>`;
}

async function loadGrowthAnakList() {
    const token = localStorage.getItem('pos_token');
    const res = await fetch(BASE_URL + '/anak?limit=100', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
    const sel = document.getElementById('growthAnakSel');
    if (!sel) return;

    // Reset dulu sebelum diisi agar tidak looping
    sel.innerHTML = '<option value="">-- Pilih anak untuk melihat grafik --</option>';
    (res?.data || []).forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.nama;
        sel.appendChild(opt);
    });
}

window.loadGrowthChart = async function (id) {
    if (!id) return;
    const token = localStorage.getItem('pos_token');
    const res = await fetch(BASE_URL + '/anak/' + id + '/grafik', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()).catch(() => null);
    const grafik = res?.data?.grafik || [];

    const bbWrap = document.getElementById('bbChartWrap');
    const tbWrap = document.getElementById('tbChartWrap');
    if (!bbWrap || !tbWrap) return;

    if (grafik.length === 0) {
        bbWrap.textContent = 'Belum ada data pemeriksaan';
        tbWrap.textContent = 'Belum ada data pemeriksaan';
        return;
    }

    const labels = grafik.map(g => `${g.umur_bulan} bln`);
    bbWrap.innerHTML = '<canvas id="bbChart"></canvas>';
    tbWrap.innerHTML = '<canvas id="tbChart"></canvas>';

    new Chart(document.getElementById('bbChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'BB (kg)', data: grafik.map(g => g.berat_badan),
                borderColor: '#006e2f', backgroundColor: 'rgba(0,110,47,0.08)',
                tension: 0.3, fill: true, pointRadius: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
    });

    new Chart(document.getElementById('tbChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'TB (cm)', data: grafik.map(g => g.tinggi_badan),
                borderColor: '#006686', backgroundColor: 'rgba(0,102,134,0.08)',
                tension: 0.3, fill: true, pointRadius: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
    });

    const tbl = document.getElementById('growthTable');
    const inner = document.getElementById('growthTableInner');
    if (tbl) tbl.style.display = 'block';
    if (inner) inner.innerHTML = `
        <table class="min-w-full">
            <thead class="bg-surface-container-low">
                <tr>
                    <th class="p-4 text-left text-sm">Tanggal</th>
                    <th class="p-4 text-left text-sm">Usia</th>
                    <th class="p-4 text-left text-sm">BB (kg)</th>
                    <th class="p-4 text-left text-sm">TB (cm)</th>
                    <th class="p-4 text-left text-sm">Status Gizi</th>
                </tr>
            </thead>
            <tbody>
                ${grafik.map(g => `
                <tr class="border-b hover:bg-surface-container-low/50">
                    <td class="p-4 text-sm">${formatDate(g.tanggal)}</td>
                    <td class="p-4 text-sm">${g.umur_bulan} bulan</td>
                    <td class="p-4 text-sm">${g.berat_badan || '—'}</td>
                    <td class="p-4 text-sm">${g.tinggi_badan || '—'}</td>
                    <td class="p-4 text-sm">${g.status_gizi || '—'}</td>
                </tr>`).join('')}
            </tbody>
        </table>`;
};