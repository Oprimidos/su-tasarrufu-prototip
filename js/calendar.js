/* ========================================================
   Cepteki Su Tasarrufu - Takvim Modülü (calendar.js)
   ======================================================== */

// Takvim Modalını Aç
function openCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (modal) {
    modal.classList.remove('hidden');
    renderCalendarGrid();
  }
}

// Takvim Modalını Kapat
function closeCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Kasım 2024 Takvim Izgarasını Oluştur
function renderCalendarGrid() {
  const container = document.getElementById('calendar-days-container');
  if (!container) return;

  // Kasım 2024: 1 Kasım Cuma gününe denk gelir
  const emptyDaysBefore = 4;
  const totalDaysInNovember = 30;

  let html = '';

  for (let i = 0; i < emptyDaysBefore; i++) {
    html += `<div class="h-10"></div>`;
  }

  for (let day = 1; day <= totalDaysInNovember; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `2024-11-${dayStr}`;
    const hasRecord = !!historicalDays[dateKey];
    const isSelected = selectedDateKey === dateKey;
    const isFuture = day > 11;

    let recordBadge = '';
    let cellClasses = 'cal-day-cell h-10 rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative transition ';

    if (isSelected) {
      cellClasses += 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300 ';
    } else if (hasRecord) {
      const rec = historicalDays[dateKey];
      const sum = getDayTotalLiters(rec.consumption);
      
      let dotColor = 'bg-emerald-500';
      if (sum > 160) dotColor = 'bg-rose-500';
      else if (sum > 130) dotColor = 'bg-amber-500';

      cellClasses += 'bg-slate-100 hover:bg-blue-50 text-slate-800 cursor-pointer ';
      recordBadge = `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColor} mt-0.5"></span>`;
    } else if (isFuture) {
      cellClasses += 'text-slate-300 cursor-not-allowed ';
    } else {
      cellClasses += 'text-slate-400 hover:bg-slate-50 cursor-pointer ';
    }

    const clickAttr = (hasRecord && !isFuture) ? `onclick="selectDate('${dateKey}')"` : '';

    html += `
      <div class="${cellClasses}" ${clickAttr} title="${hasRecord ? `${day} Kasım Tüketimi` : ''}">
        <span>${day}</span>
        ${recordBadge}
      </div>
    `;
  }

  container.innerHTML = html;
}

// Tarih Seçildiğinde Çalışan Fonksiyon
function selectDate(dateKey) {
  if (!historicalDays[dateKey]) return;

  selectedDateKey = dateKey;
  const dayData = historicalDays[dateKey];

  // Aktif tüketim verilerini seçilen güne kopyala
  currentConsumption = { ...dayData.consumption };

  // Tarih Başlığını Güncelle
  const dateLabelEl = document.getElementById('selected-date-label');
  if (dateLabelEl) {
    dateLabelEl.textContent = dayData.label;
  }

  // Tüketim Kalemleri UI'ını Güncelle
  updateConsumptionUI();

  // Modalı kapat ve bilgi ver
  closeCalendarModal();
  
  const total = getDayTotalLiters(currentConsumption);
  showToast(`${dayData.dayNum} Kasım verileri yüklendi (${total}L)`);
}
