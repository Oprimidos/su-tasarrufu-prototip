/* ========================================================
   Cepteki Su Tasarrufu - Raporlar & Grafik Modülü (reports.js)
   ======================================================== */

let chartInstance = null;
let currentReportPeriod = 'monthly'; // 'monthly' | 'weekly'

// Rapor Dönemini Değiştir (Aylık / Haftalık)
function setReportPeriod(period) {
  currentReportPeriod = period;

  const btnMonthly = document.getElementById('btn-period-monthly');
  const btnWeekly = document.getElementById('btn-period-weekly');

  if (period === 'monthly') {
    btnMonthly.className = 'px-2.5 py-0.5 rounded-md bg-white text-blue-600 shadow-sm transition font-semibold';
    btnWeekly.className = 'px-2.5 py-0.5 rounded-md text-slate-500 hover:text-slate-800 transition font-semibold';
  } else {
    btnWeekly.className = 'px-2.5 py-0.5 rounded-md bg-white text-blue-600 shadow-sm transition font-semibold';
    btnMonthly.className = 'px-2.5 py-0.5 rounded-md text-slate-500 hover:text-slate-800 transition font-semibold';
  }

  const activeData = reportDatasets[period];

  // Ekrandaki Metinleri Güncelle
  const periodLabelEl = document.getElementById('chart-period-label');
  if (periodLabelEl) periodLabelEl.textContent = activeData.title;

  const totalLitersEl = document.getElementById('chart-total-liters');
  if (totalLitersEl) totalLitersEl.textContent = activeData.totalLiters;

  const savingPctEl = document.getElementById('chart-saving-pct');
  if (savingPctEl) savingPctEl.textContent = activeData.savingPct;

  const adviceTextEl = document.getElementById('advice-text');
  if (adviceTextEl) adviceTextEl.innerHTML = activeData.advice;

  const scoreBadgeEl = document.getElementById('score-badge');
  if (scoreBadgeEl) scoreBadgeEl.textContent = activeData.score;

  // Grafiği Yeniden Çiz
  renderReportChart(activeData);
  showToast(period === 'monthly' ? 'Aylık veriler yüklendi' : 'Haftalık veriler yüklendi');
}

// Chart.js Dairesel (Doughnut) Grafiğini Oluştur / Güncelle
function renderReportChart(periodData) {
  const ctx = document.getElementById('waterDoughnutChart');
  if (!ctx) return;

  const pData = periodData || reportDatasets[currentReportPeriod];

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Araç Yıkama', 'Duş', 'Bulaşık', 'Çamaşır', 'İçme Suyu'],
      datasets: [{
        data: pData.data,
        backgroundColor: [
          '#0ea5e9', // Gök Mavisi (Araç Yıkama)
          '#38bdf8', // Açık Mavi (Duş)
          '#fb923c', // Turuncu (Bulaşık)
          '#a855f7', // Mor (Çamaşır)
          '#facc15'  // Sarı (İçme Suyu)
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const total = pData.totalNum;
              const percentage = ((val / total) * 100).toFixed(1);
              return ` ${context.label}: ${val}L (%${percentage})`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 600
      }
    }
  });

  // Lejant Yüzdelerini Güncelle
  updateReportLegend(pData);
}

// Grafik Altındaki Lejant Yüzdelerini Hesapla
function updateReportLegend(pData) {
  const calcPct = (val) => ((val / pData.totalNum) * 100).toFixed(1);

  const legCar = document.getElementById('legend-car');
  if (legCar) legCar.textContent = `Araç Yıkama (%${calcPct(pData.data[0])})`;

  const legShower = document.getElementById('legend-shower');
  if (legShower) legShower.textContent = `Duş (%${calcPct(pData.data[1])})`;

  const legDishes = document.getElementById('legend-dishes');
  if (legDishes) legDishes.textContent = `Bulaşık (%${calcPct(pData.data[2])})`;

  const legClothes = document.getElementById('legend-clothes');
  if (legClothes) legClothes.textContent = `Çamaşır (%${calcPct(pData.data[3])})`;

  const legDrink = document.getElementById('legend-drink');
  if (legDrink) legDrink.textContent = `İçme Suyu (%${calcPct(pData.data[4])})`;
}

