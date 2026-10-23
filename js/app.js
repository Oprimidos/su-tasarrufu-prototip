/* ========================================================
   Cepteki Su Tasarrufu - Ana Uygulama Mantığı (app.js)
   ======================================================== */

let currentTipCategory = 'all';

// Mobil Durum Çubuğu Saati
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const clockEl = document.getElementById('current-clock');
  if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Toast Bildirimi Göster
function showToast(message, isMinus = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  if (isMinus) {
    toastIcon.className = 'fa-solid fa-circle-minus text-rose-400';
  } else {
    toastIcon.className = 'fa-solid fa-circle-check text-emerald-400';
  }

  toast.classList.remove('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none');
  }, 1800);
}

// Çamaşır Makinesi Modu Değiştirme (Eko -> Normal -> Hızlı)
function toggleClothesMode() {
  const modes = ['eko', 'normal', 'hizli'];
  const currentIndex = modes.indexOf(currentClothesMode);
  currentClothesMode = modes[(currentIndex + 1) % modes.length];

  updateConsumptionUI();
  const m = clothesModes[currentClothesMode];
  showToast(`Çamaşır Modu: ${m.name} (${m.rate}L/çalıştırma)`);
}

// Bulaşık Makinesi Modu Değiştirme (Eko -> Normal -> Yoğun)
function toggleDishMode() {
  const modes = ['eko', 'normal', 'yogun'];
  const currentIndex = modes.indexOf(currentDishMode);
  currentDishMode = modes[(currentIndex + 1) % modes.length];

  updateConsumptionUI();
  const m = dishModes[currentDishMode];
  showToast(`Bulaşık Makinesi: ${m.name} (${m.rate}L/çalıştırma)`);
}

// Tüketim Değerini Artır / Azalt (+ / - Butonları)
function updateConsumption(key, delta) {
  const currentVal = currentConsumption[key] || 0;
  const newVal = Math.max(0, currentVal + delta);

  if (newVal === currentVal && delta < 0) {
    showToast('Tüketim 0 değerinin altına inemez!', true);
    return;
  }

  currentConsumption[key] = newVal;

  // İlgili gün kaydını da güncelle
  if (historicalDays[selectedDateKey]) {
    historicalDays[selectedDateKey].consumption[key] = newVal;
  }

  // Arayüzü yenile
  updateConsumptionUI();

  // Bildirim metinleri
  if (key === 'dishMachineCycles') {
    const rate = dishModes[currentDishMode].rate;
    showToast(`Bulaşık Makinesi: ${newVal} çalıştırma (${newVal * rate}L)`, delta < 0);
  } else if (key === 'dishHandMins') {
    const liters = getDishHandLiters(newVal);
    showToast(`Elde Bulaşık: ${newVal} dakika (${liters}L su)`, delta < 0);
  } else if (key === 'clothesCycles') {
    const rate = clothesModes[currentClothesMode].rate;
    showToast(`Çamaşır: ${newVal} çalıştırma (${newVal * rate}L)`, delta < 0);
  } else if (key === 'showerMins') {
    const liters = getShowerLiters(newVal);
    showToast(`Duş: ${newVal} dakika (${liters}L su)`, delta < 0);
  } else if (key === 'washingCarMins') {
    const liters = getCarLiters(newVal);
    showToast(`Araç Yıkama: ${newVal} dakika (${liters}L su)`, delta < 0);
  } else {
    showToast(`İçme Suyu: ${newVal}L`, delta < 0);
  }
}

// Tüketim Arayüzünü ve Dairesel Göstergeleri Yenile
function updateConsumptionUI() {
  // 1. İçme Suyu (Litre)
  const valDrink = document.getElementById('val-drink');
  if (valDrink) valDrink.textContent = `${currentConsumption.drink || 0}L`;

  // 2. Bulaşık (Makine & Elde)
  const dishMachineCycles = currentConsumption.dishMachineCycles || 0;
  const dishMachineRate = dishModes[currentDishMode].rate;
  const dishMachineLiters = dishMachineCycles * dishMachineRate;

  const dishHandMins = currentConsumption.dishHandMins || 0;
  const dishHandLiters = getDishHandLiters(dishHandMins);
  const totalDishLiters = dishMachineLiters + dishHandLiters;

  const valDishMachine = document.getElementById('val-dish-machine');
  if (valDishMachine) valDishMachine.textContent = `${dishMachineCycles} çlş`;

  const subDishMachine = document.getElementById('sub-dish-machine');
  if (subDishMachine) subDishMachine.textContent = `${dishMachineCycles} çalıştırma · ${dishMachineLiters}L (${dishMachineRate}L/çlş)`;

  const valDishHand = document.getElementById('val-dish-hand');
  if (valDishHand) valDishHand.textContent = `${dishHandMins} dk`;

  const subDishHand = document.getElementById('sub-dish-hand');
  if (subDishHand) subDishHand.textContent = `${dishHandMins} dakika · ${dishHandLiters}L (5L/dk)`;

  const valDishesTotal = document.getElementById('val-dishes-total');
  if (valDishesTotal) valDishesTotal.textContent = `${totalDishLiters}L`;

  const btnDishMode = document.getElementById('btn-dish-mode');
  if (btnDishMode) btnDishMode.textContent = dishModes[currentDishMode].label;

  // 3. Çamaşır Makinesi (Çalıştırma & Mod)
  const clothesCycles = currentConsumption.clothesCycles || 0;
  const clothesRate = clothesModes[currentClothesMode].rate;
  const clothesLiters = clothesCycles * clothesRate;

  const valClothes = document.getElementById('val-clothes');
  if (valClothes) valClothes.textContent = `${clothesCycles} çlş`;

  const subClothes = document.getElementById('sub-clothes');
  if (subClothes) subClothes.textContent = `${clothesCycles} çalıştırma · ${clothesLiters}L (${clothesModes[currentClothesMode].name})`;

  const btnClothesMode = document.getElementById('btn-clothes-mode');
  if (btnClothesMode) btnClothesMode.textContent = clothesModes[currentClothesMode].label;

  // 4. Duş (Dakika)
  const showerMins = currentConsumption.showerMins || 0;
  const showerLiters = getShowerLiters(showerMins);
  const valShower = document.getElementById('val-shower');
  if (valShower) valShower.textContent = `${showerMins} dk`;
  const subShower = document.getElementById('sub-shower');
  if (subShower) subShower.textContent = `${showerMins} dakika duş · ${showerLiters}L su (5L/dk)`;

  // 5. Araç Yıkama (Dakika)
  const carMins = currentConsumption.washingCarMins || 0;
  const carLiters = getCarLiters(carMins);
  const valCar = document.getElementById('val-washingCar');
  if (valCar) valCar.textContent = `${carMins} dk`;
  const subCar = document.getElementById('sub-washingCar');
  if (subCar) subCar.textContent = `${carMins} dakika hortum · ${carLiters}L su (10L/dk)`;

  // 6. Toplam Litre Hesabı
  const total = getDayTotalLiters(currentConsumption);
  const totalEl = document.getElementById('total-liters');
  if (totalEl) totalEl.textContent = total;

  // 7. Kapasite Yüzdesi (Hedef: 175L)
  const percent = Math.min(150, Math.round((total / DAILY_TARGET_LIMIT) * 100));
  const gaugePercentEl = document.getElementById('gauge-percent');
  if (gaugePercentEl) gaugePercentEl.textContent = `${percent}%`;

  // 8. Dairesel Halka İlerlemesi
  const circle = document.getElementById('gauge-circle');
  if (circle) {
    const circumference = 238.76;
    const normalizedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (normalizedPercent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  // 9. Durum Uyarısı Metni
  const warningEl = document.getElementById('limit-warning');
  if (warningEl) {
    if (percent >= 100) {
      warningEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-500"></i> <span class="text-rose-600 font-bold">Kapasite aşıldı!</span>';
    } else if (percent >= 80) {
      warningEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-500"></i> Günlük limite yakın!';
    } else {
      warningEl.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500"></i> İdeal tüketim aralığında';
    }
  }
}

// Alt Menüden Sekme Değiştirme
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) activeTab.classList.add('active');

  const navButtons = {
    daily: document.getElementById('nav-btn-daily'),
    reports: document.getElementById('nav-btn-reports'),
    search: document.getElementById('nav-btn-search')
  };

  Object.keys(navButtons).forEach(key => {
    const btn = navButtons[key];
    const iconContainer = btn.querySelector('div');
    const label = btn.querySelector('span');

    if (key === tabName) {
      btn.classList.add('text-blue-600');
      btn.classList.remove('text-slate-400');
      iconContainer.classList.add('bg-blue-50', 'text-blue-600');
      iconContainer.classList.remove('text-slate-500');
      label.classList.add('font-bold');
    } else {
      btn.classList.remove('text-blue-600');
      btn.classList.add('text-slate-400');
      iconContainer.classList.remove('bg-blue-50', 'text-blue-600');
      iconContainer.classList.add('text-slate-500');
      label.classList.remove('font-bold');
    }
  });

  const scrollView = document.getElementById('main-scroll-view');
  if (scrollView) scrollView.scrollTop = 0;

  if (tabName === 'reports') {
    setTimeout(() => renderReportChart(reportDatasets[currentReportPeriod]), 50);
  }
}

// Su Tasarrufu Tavsiyelerini Listele
function renderTips(tips) {
  const container = document.getElementById('tips-container');
  if (!container) return;

  if (tips.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400">
        <i class="fa-solid fa-magnifying-glass text-2xl mb-2"></i>
        <p class="text-xs">Aramanızla eşleşen tasarruf önerisi bulunamadı.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tips.map(tip => `
    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100/90 hover:border-blue-200 transition shadow-sm flex items-start gap-3">
      <div class="w-10 h-10 rounded-xl ${tip.color} flex items-center justify-center shrink-0 text-base shadow-sm mt-0.5">
        <i class="fa-solid ${tip.icon}"></i>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between gap-1">
          <h3 class="text-xs font-bold text-slate-800">${tip.title}</h3>
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
            ${tip.saving}
          </span>
        </div>
        <p class="text-[11px] text-slate-500 mt-1 leading-snug">${tip.description}</p>
      </div>
    </div>
  `).join('');
}

// İpuçlarında Arama ve Filtreleme
function filterTips() {
  const query = document.getElementById('tip-search-input').value.toLowerCase().trim();
  const clearBtn = document.getElementById('clear-search-btn');

  if (query.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  const filtered = tipsData.filter(tip => {
    const matchesCategory = (currentTipCategory === 'all' || tip.category === currentTipCategory);
    const matchesQuery = tip.title.toLowerCase().includes(query) ||
                         tip.description.toLowerCase().includes(query) ||
                         tip.saving.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  renderTips(filtered);
}

function clearSearch() {
  const input = document.getElementById('tip-search-input');
  if (input) {
    input.value = '';
    filterTips();
    input.focus();
  }
}

function setTipCategory(category) {
  currentTipCategory = category;

  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    pill.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
    pill.classList.add('bg-slate-100', 'text-slate-600');
  });

  const activeBtn = event.currentTarget;
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-100', 'text-slate-600');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
  }

  filterTips();
}

// Bilgi Modalı Kontrolleri
function openInfoModal() {
  document.getElementById('info-modal').classList.remove('hidden');
}
function closeInfoModal() {
  document.getElementById('info-modal').classList.add('hidden');
}

// Sayfa Başlatma
window.addEventListener('DOMContentLoaded', () => {
  renderTips(tipsData);
  updateConsumptionUI();
});
