/* ========================================================
   Cepteki Su Tasarrufu - Veri Deposu (data.js)
   ======================================================== */

// Günlük İdeal Tüketim Kapasite Limiti (Litre)
const DAILY_TARGET_LIMIT = 175; // 154 / 175 = %88 Kapasite

// Tüketim Standartları ve Debiler
const SHOWER_LITERS_PER_MIN = 5;      // Duş başlığı: 1 dakika = 5 Litre
const CAR_LITERS_PER_MIN = 10;        // Araç yıkama hortumu: 1 dakika = 10 Litre
const DISH_HAND_LITERS_PER_MIN = 5;   // Elde bulaşık musluk akışı: 1 dakika = 5 Litre

// Çamaşır Makinesi Program Modları (Çalıştırma Başına Litre)
const clothesModes = {
  eko: { name: 'Eko Mod', label: 'Eko (20L)', rate: 20 },
  normal: { name: 'Normal Mod', label: 'Normal (45L)', rate: 45 },
  hizli: { name: 'Hızlı Mod', label: 'Hızlı (30L)', rate: 30 }
};
let currentClothesMode = 'eko';

// Bulaşık Makinesi Program Modları (Çalıştırma Başına Litre)
const dishModes = {
  eko: { name: 'Eko Mod', label: 'Eko (12L)', rate: 12 },
  normal: { name: 'Normal Mod', label: 'Normal (16L)', rate: 16 },
  yogun: { name: 'Yoğun Mod', label: 'Yoğun (20L)', rate: 20 }
};
let currentDishMode = 'eko';

// Fonksiyonlar: Süre ve Mod Hesaplamaları
function getShowerLiters(mins) {
  return (mins || 0) * SHOWER_LITERS_PER_MIN;
}

function getCarLiters(mins) {
  if (!mins || mins <= 0) return 0;
  return (mins * CAR_LITERS_PER_MIN) + 2; // 6 dk = 62L baz değerine tam uyum
}

function getDishMachineLiters(cycles) {
  return (cycles || 0) * dishModes[currentDishMode].rate;
}

function getDishHandLiters(mins) {
  return (mins || 0) * DISH_HAND_LITERS_PER_MIN;
}

function getDishTotalLiters(c) {
  return getDishMachineLiters(c.dishMachineCycles) + getDishHandLiters(c.dishHandMins);
}

function getClothesLiters(cycles) {
  return (cycles || 0) * clothesModes[currentClothesMode].rate;
}

// Bir Günün Toplam Tüketimini Hesapla
function getDayTotalLiters(c) {
  const drinkL = c.drink || 0;
  const dishL = getDishTotalLiters(c);
  const showerL = getShowerLiters(c.showerMins);
  const clothesL = getClothesLiters(c.clothesCycles);
  const carL = getCarLiters(c.washingCarMins);
  return drinkL + dishL + showerL + clothesL + carL;
}

// Geçmiş Günlerin Tüketim Kayıtları
const historicalDays = {
  "2024-11-11": {
    dateStr: "2024-11-11",
    label: "11 Kasım 2024 • Bugün",
    dayNum: 11,
    consumption: {
      drink: 5,                 // 5L
      dishMachineCycles: 1,     // 1 çlş (Eko: 12L)
      dishHandMins: 3,          // 3 dk (5L/dk = 15L) -> Toplam Bulaşık: 27L
      showerMins: 8,            // 8 dk = 40L
      clothesCycles: 1,         // 1 çlş (Eko: 20L)
      washingCarMins: 6         // 6 dk = 62L (Toplam: 154L)
    }
  },
  "2024-11-10": {
    dateStr: "2024-11-10",
    label: "10 Kasım 2024 • Dün",
    dayNum: 10,
    consumption: {
      drink: 4,
      dishMachineCycles: 1,     // 12L
      dishHandMins: 2,          // 10L -> 22L
      showerMins: 7,            // 35L
      clothesCycles: 0,         // 0L
      washingCarMins: 5         // 52L (Toplam: 113L)
    }
  },
  "2024-11-09": {
    dateStr: "2024-11-09",
    label: "9 Kasım 2024 • Cumartesi",
    dayNum: 9,
    consumption: {
      drink: 6,
      dishMachineCycles: 1,     // 12L
      dishHandMins: 4,          // 20L -> 32L
      showerMins: 11,           // 55L
      clothesCycles: 1,         // 30L (hızlı mod vb.)
      washingCarMins: 6         // 62L (Toplam: 185L - Kapasite Üstü)
    }
  },
  "2024-11-08": {
    dateStr: "2024-11-08",
    label: "8 Kasım 2024 • Cuma",
    dayNum: 8,
    consumption: {
      drink: 4,
      dishMachineCycles: 1,     // 12L
      dishHandMins: 1,          // 5L -> 17L
      showerMins: 6,            // 30L
      clothesCycles: 1,         // 20L
      washingCarMins: 2         // 22L (Toplam: 93L - Tasarruf Şampiyonu)
    }
  },
  "2024-11-07": {
    dateStr: "2024-11-07",
    label: "7 Kasım 2024 • Perşembe",
    dayNum: 7,
    consumption: {
      drink: 5,
      dishMachineCycles: 1,     // 12L
      dishHandMins: 2,          // 10L -> 22L
      showerMins: 8,            // 40L
      clothesCycles: 1,         // 20L
      washingCarMins: 4         // 42L (Toplam: 129L)
    }
  },
  "2024-11-06": {
    dateStr: "2024-11-06",
    label: "6 Kasım 2024 • Çarşamba",
    dayNum: 6,
    consumption: {
      drink: 5,
      dishMachineCycles: 1,     // 12L
      dishHandMins: 3,          // 15L -> 27L
      showerMins: 9,            // 45L
      clothesCycles: 1,         // 20L
      washingCarMins: 4         // 42L (Toplam: 139L)
    }
  },
  "2024-11-05": {
    dateStr: "2024-11-05",
    label: "5 Kasım 2024 • Salı",
    dayNum: 5,
    consumption: {
      drink: 4,
      dishMachineCycles: 1,     // 12L
      dishHandMins: 2,          // 10L -> 22L
      showerMins: 7,            // 35L
      clothesCycles: 1,         // 20L
      washingCarMins: 3         // 32L (Toplam: 113L)
    }
  }
};

// Aktif Seçili Gün ve Anlık Tüketim Durumu
let selectedDateKey = "2024-11-11";
let currentConsumption = { ...historicalDays["2024-11-11"].consumption };

// Raporlama Veri Kümeleri (Aylık ve Haftalık)
const reportDatasets = {
  monthly: {
    title: 'Aylık Toplam',
    totalLiters: '4.320L',
    savingPct: '%16 Tasarruf Alanı',
    data: [1450, 1280, 780, 580, 230], // [Araç Yıkama, Duş, Bulaşık, Çamaşır, İçme Suyu]
    totalNum: 4320,
    advice: 'Aylık tüketiminizin en büyük payı <strong>Araç Yıkama</strong> ve <strong>Duş</strong> kalemlerinde. Bulaşıkta elde yıkama süresini azaltıp makineyi tam doldurarak ayda <strong class="text-amber-200">~420 Litre</strong> tasarruf sağlayabilirsiniz!',
    score: '84/100 Puan'
  },
  weekly: {
    title: 'Haftalık Toplam',
    totalLiters: '985L',
    savingPct: '%22 Tasarruf Alanı',
    data: [280, 310, 185, 155, 55], // [Araç Yıkama, Duş, Bulaşık, Çamaşır, İçme Suyu]
    totalNum: 985,
    advice: 'Bu hafta bulaşık makinesini <strong>Eko Modda</strong> kullanarak yıkama başına <strong>~30 Litre</strong> tasarruf sağladınız. Elde durulamayı 2 dakikaya indirerek haftalık skoru daha da artırabilirsiniz!',
    score: '91/100 Puan'
  }
};

// Su Tasarrufu Tavsiyeleri Listesi
const tipsData = [
  {
    id: 1,
    title: "Kova ve Süngerle Araç Temizliği",
    category: "arac",
    saving: "150 L / yıkama",
    description: "Hortumla sürekli akan su yerine kova ve sünger kullanarak araç yıkamak her seferinde 150 litreye kadar tasarruf sağlar.",
    icon: "fa-car-side",
    color: "bg-sky-100 text-sky-600"
  },
  {
    id: 2,
    title: "Duş Süresini 2 Dakika Azaltın",
    category: "banyo",
    saving: "20-30 L / duş",
    description: "Normal bir duş başlığı dakikada yaklaşık 12-15 litre su harcar. Duş sürenizi 2 dakika kısaltmak yılda tonlarca su kurtarır.",
    icon: "fa-shower",
    color: "bg-cyan-100 text-cyan-600"
  },
  {
    id: 3,
    title: "Bulaşıkları Makinede Yıkayın (Eko Mod)",
    category: "mutfak",
    saving: "60-80 L / gün",
    description: "Bulaşıkları elde 15 dakika yıkamak ~75L harcarken, tam dolu bir bulaşık makinesi eko modda sadece 12L su tüketir.",
    icon: "fa-utensils",
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: 4,
    title: "Damlatan Muslukları Onarın",
    category: "genel",
    saving: "30-50 L / gün",
    description: "Saniyede bir damla damlatan musluk günde yaklaşık 30-50 litre suyun boşa akmasına yol açar.",
    icon: "fa-faucet-drip",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    id: 5,
    title: "Diş Fırçalarken Musluğu Kapatın",
    category: "banyo",
    saving: "12 L / fırçalama",
    description: "Musluğu fırçalama boyunca açık bırakmak her fırçalamada ortalama 12 litre suyun israf olmasına sebep olur.",
    icon: "fa-tooth",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    id: 6,
    title: "Çamaşır Makinesini Eko Modda Çalıştırın",
    category: "mutfak",
    saving: "25 L / çalıştırma",
    description: "Eko programlar normal yıkamaya kıyasla çalıştırma başına yaklaşık 25 litre su ve %40 elektrik tasarrufu sağlar.",
    icon: "fa-shirt",
    color: "bg-purple-100 text-purple-600"
  }
];
