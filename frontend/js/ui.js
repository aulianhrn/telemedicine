// ===================== CHECKUP MODAL =====================
const VAKSIN_LIST = ['HB0','BCG','Polio 1','Polio 2','DPT-HB-Hib 1','DPT-HB-Hib 2','DPT-HB-Hib 3','Campak/MR','PCV','Rotavirus','Vitamin A'];
let currentCheckupStep = 1;

window.openNewCheckupModal = async function () {
    currentCheckupStep = 1;
    const today = new Date().toISOString().split('T')[0];
    ['c_bb','c_tb','c_lk','c_lila','c_catatan'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    const tgl = document.getElementById('c_tgl_periksa'); if(tgl) tgl.value = today;
    const prev = document.getElementById('status-gizi-preview'); if(prev) prev.classList.add('hidden');

    const token = localStorage.getItem('pos_token');
    const res = await fetch(BASE_URL+'/anak?limit=100',{headers:{Authorization:'Bearer '+token}}).then(r=>r.json()).catch(()=>null);
    const sel = document.getElementById('c_anak_id');
    if(sel){ sel.innerHTML='<option value="">-- Pilih Anak --</option>'; (res?.data||[]).forEach(a=>{ sel.innerHTML+=`<option value="${a.id}">${a.nama}</option>`; }); }

    const grid = document.getElementById('vaksin-checklist');
    if(grid){ grid.innerHTML=VAKSIN_LIST.map(v=>`<label class="flex items-center gap-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"><input type="checkbox" class="w-4 h-4 rounded accent-green-700" value="${v}"><span class="text-sm font-medium">${v}</span></label>`).join(''); }

    document.getElementById('newCheckupModal').style.display='flex';
    document.body.style.overflow='hidden';
    updateCheckupStepUI();
};

window.openCheckupForAnak = function(id){ window.openNewCheckupModal().then(()=>{ const sel=document.getElementById('c_anak_id'); if(sel) sel.value=id; }); };
window.closeNewCheckupModal = function(){ document.getElementById('newCheckupModal').style.display='none'; document.body.style.overflow=''; currentCheckupStep=1; };
window.handleModalBackdropClick = function(e){ if(e.target===document.getElementById('newCheckupModal')) closeNewCheckupModal(); };

function updateCheckupStepUI(){
    for(let i=1;i<=3;i++){
        const panel=document.getElementById('checkup-step-'+i); if(panel) panel.style.display=i===currentCheckupStep?'block':'none';
        const circle=document.getElementById('step'+i+'-circle'); if(!circle) continue;
        if(i<currentCheckupStep){ circle.className='step-circle bg-primary text-white'; circle.innerHTML='<span class="material-symbols-outlined text-[16px]" style="font-variation-settings:\'FILL\' 1">check</span>'; }
        else if(i===currentCheckupStep){ circle.className='step-circle bg-primary text-white'; circle.textContent=i; }
        else{ circle.className='step-circle bg-gray-100 text-gray-400'; circle.textContent=i; }
    }
    for(let i=1;i<=2;i++){ const line=document.getElementById('step'+i+'-line'); if(line) line.style.background=i<currentCheckupStep?'#006e2f':'#e5e7eb'; }
    const bBtn=document.getElementById('modal-btn-back'); if(bBtn) bBtn.style.cssText=currentCheckupStep>1?'display:flex!important':'display:none!important';
    const nBtn=document.getElementById('modal-btn-next'); if(nBtn) nBtn.style.display=currentCheckupStep<3?'flex':'none';
    const sBtn=document.getElementById('modal-btn-submit'); if(sBtn) sBtn.style.display=currentCheckupStep===3?'flex':'none';
}

window.checkupNextStep = function(){
    if(currentCheckupStep===1){ if(!document.getElementById('c_anak_id')?.value||!document.getElementById('c_tgl_periksa')?.value){ showGlobalToast('Pilih anak dan tanggal!',true); return; } }
    if(currentCheckupStep===2){
        const bb=document.getElementById('c_bb')?.value, tb=document.getElementById('c_tb')?.value;
        if(!bb||!tb){ showGlobalToast('Isi berat dan tinggi badan!',true); return; }
        const anakOpt=document.getElementById('c_anak_id'); const nama=anakOpt?.options[anakOpt.selectedIndex]?.text||'—'; const status=document.getElementById('status-gizi-text')?.textContent||'—';
        const s=document.getElementById('sum_nama'); if(s) s.textContent=nama;
        const sBb=document.getElementById('sum_bb'); if(sBb) sBb.textContent=bb+' kg';
        const sTb=document.getElementById('sum_tb'); if(sTb) sTb.textContent=tb+' cm';
        const sS=document.getElementById('sum_status'); if(sS) sS.textContent=status;
    }
    if(currentCheckupStep<3){ currentCheckupStep++; updateCheckupStepUI(); }
};

window.checkupPrevStep = function(){ if(currentCheckupStep>1){ currentCheckupStep--; updateCheckupStepUI(); } };

window.hitungStatus = function(){
    const bb=parseFloat(document.getElementById('c_bb')?.value), tb=parseFloat(document.getElementById('c_tb')?.value);
    const preview=document.getElementById('status-gizi-preview'), statusText=document.getElementById('status-gizi-text');
    if(!bb||!tb||!preview||!statusText) return;
    const bmi=bb/Math.pow(tb/100,2);
    let status; if(bmi<14) status='Gizi Buruk'; else if(bmi<16) status='Gizi Kurang'; else if(bmi<19) status='Normal'; else if(bmi<22) status='Berisiko Gizi Lebih'; else status='Gizi Lebih';
    statusText.textContent=status; preview.classList.remove('hidden');
};

window.submitCheckup = async function(){
    const token=localStorage.getItem('pos_token');
    const anakId=document.getElementById('c_anak_id')?.value;
    if(!anakId){ showGlobalToast('Pilih anak terlebih dahulu!',true); return; }
    const tanggal=document.getElementById('c_tgl_periksa')?.value;
    const body={
        berat_badan: document.getElementById('c_bb')?.value,
        tinggi_badan: document.getElementById('c_tb')?.value,
        lingkar_kepala: document.getElementById('c_lk')?.value||null,
        tanggal_pemeriksaan: tanggal,
        catatan: document.getElementById('c_catatan')?.value||null,
    };
    const res=await fetch(`${BASE_URL}/anak/${anakId}/pemeriksaan`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)}).then(r=>r.json()).catch(()=>null);
    if(!res?.success){ showGlobalToast(res?.message||'Gagal menyimpan',true); return; }

    // Simpan vaksin yang dicentang dengan status: 'selesai'
    const checked=[...document.querySelectorAll('#vaksin-checklist input:checked')];
    for(const cb of checked){
        await fetch(BASE_URL+'/imunisasi',{
            method:'POST',
            headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
            body:JSON.stringify({
                anak_id: anakId,
                nama_vaksin: cb.value,
                tanggal_jadwal: tanggal,
                tanggal: tanggal,
                status: 'selesai',          // ← vaksin dari checkup langsung selesai
            })
        }).then(r=>r.json()).catch(()=>null);
    }
    closeNewCheckupModal();
    showGlobalToast('Checkup berhasil disimpan!');
    if(typeof loadDashboard==='function'&&currentPageId==='dashboard') loadDashboard();
    if(typeof loadPemeriksaan==='function'&&currentPageId==='pemeriksaan-gizi') loadPemeriksaan();
};

// ===================== MODAL HTML =====================

const anakModalHTML=`<div id="anakModal" style="display:none;" class="modal-backdrop" onclick="if(event.target===this)closeModal('anakModal')"><div class="modal-box"><div class="flex items-center justify-between px-6 py-4 border-b border-gray-100"><div><h2 id="anakModalTitle" class="text-lg font-bold text-gray-900">Tambah Data Anak</h2><p class="text-sm text-gray-500 mt-0.5">Isi data lengkap anak</p></div><button onclick="closeModal('anakModal')" class="p-2 rounded-full hover:bg-gray-100"><span class="material-symbols-outlined text-gray-400">close</span></button></div><div class="px-6 py-5"><div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4"><div class="form-group"><label class="form-label">Nama Anak <span class="text-red-500">*</span></label><input type="text" id="anakNama" class="form-input" placeholder="Nama lengkap"></div><div class="form-group"><label class="form-label">Jenis Kelamin <span class="text-red-500">*</span></label><select id="anakJK" class="form-input"><option value="">-- Pilih --</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div><div class="form-group"><label class="form-label">Tanggal Lahir <span class="text-red-500">*</span></label><input type="date" id="anakTglLahir" class="form-input"></div><div class="form-group"><label class="form-label">Ibu <span class="text-red-500">*</span></label><select id="anakIbuId" class="form-input"><option value="">-- Pilih Ibu --</option></select></div><div class="form-group"><label class="form-label">Berat Lahir (kg)</label><input type="number" step="0.1" id="anakBeratLahir" class="form-input" placeholder="3.2"></div><div class="form-group"><label class="form-label">Tinggi Lahir (cm)</label><input type="number" step="0.1" id="anakTinggiLahir" class="form-input" placeholder="50"></div></div></div><div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3"><button onclick="closeModal('anakModal')" class="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button><button onclick="saveAnak()" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-green-800 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">save</span> Simpan</button></div></div></div>`;

const imunisasiModalHTML=`<div id="imunisasiModal" style="display:none;" class="modal-backdrop" onclick="if(event.target===this)closeModal('imunisasiModal')"><div class="modal-box" style="max-width:480px"><div class="flex items-center justify-between px-6 py-4 border-b border-gray-100"><div><h2 class="text-lg font-bold text-gray-900">Tambah Jadwal Imunisasi</h2><p class="text-sm text-gray-500 mt-0.5">Buat jadwal imunisasi baru</p></div><button onclick="closeModal('imunisasiModal')" class="p-2 rounded-full hover:bg-gray-100"><span class="material-symbols-outlined text-gray-400">close</span></button></div><div class="px-6 py-5"><div class="form-group"><label class="form-label">Anak <span class="text-red-500">*</span></label><select id="imuAnakId" class="form-input"><option value="">-- Pilih Anak --</option></select></div><div class="form-group"><label class="form-label">Nama Vaksin <span class="text-red-500">*</span></label><input type="text" id="imuVaksin" class="form-input" placeholder="cth. Polio 1"></div><div class="form-group"><label class="form-label">Tanggal Jadwal <span class="text-red-500">*</span></label><input type="date" id="imuTgl" class="form-input"></div></div><div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3"><button onclick="closeModal('imunisasiModal')" class="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button><button onclick="saveImunisasi()" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-green-800 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">save</span> Simpan</button></div></div></div>`;

function injectModals(){
    document.body.insertAdjacentHTML('beforeend', anakModalHTML);
    document.body.insertAdjacentHTML('beforeend', imunisasiModalHTML);
    // detailAnakModal sudah ada langsung di index.html
}

function closeModal(id){ const el=document.getElementById(id); if(el) el.style.display='none'; document.body.style.overflow=''; }