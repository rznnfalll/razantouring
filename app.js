/**
 * Razan Touring - Galeri Foto Perjalanan
 * Login:
 *   Username: razan
 *   Password: 11111111
 * Setiap nama touring menampung 3 foto perjalanan.
 */

const AUTH_KEY = 'razan_touring_auth';
const DB_NAME = 'RazanTouringDB';
const DB_VERSION = 1;
const STORE_NAME = 'touring_trips';

// App State
let db = null;
let touringList = [];
let currentUploadPhotos = [null, null, null]; // [photo1, photo2, photo3] (Base64)

// ================= AUTHENTICATION =================
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const togglePasswordBtn = document.getElementById('toggle-password');
const btnLogout = document.getElementById('btn-logout');

function checkAuth() {
  const isAuth = localStorage.getItem(AUTH_KEY);
  if (isAuth === 'true') {
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    initApp();
  } else {
    loginContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = loginUsername.value.trim();
  const p = loginPassword.value.trim();

  if (u === 'razan' && p === '11111111') {
    localStorage.setItem(AUTH_KEY, 'true');
    loginError.classList.add('hidden');
    loginForm.reset();
    checkAuth();
  } else {
    loginError.classList.remove('hidden');
  }
});

togglePasswordBtn.addEventListener('click', () => {
  const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
  loginPassword.setAttribute('type', type);
});

btnLogout.addEventListener('click', () => {
  if (confirm('Keluar dari galeri touring?')) {
    localStorage.removeItem(AUTH_KEY);
    checkAuth();
  }
});

// ================= INDEXED DB (PENYIMPANAN FOTO KAPASITAS BESAR) =================
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => {
      console.error('IndexedDB Error:', e);
      reject(e);
    };
  });
}

function getAllTouringsFromDB() {
  return new Promise((resolve) => {
    if (!db) return resolve([]);
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

function saveTouringToDB(item) {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not open');
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e);
  });
}

function deleteTouringFromDB(id) {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not open');
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e);
  });
}

function clearAllTouringsFromDB() {
  return new Promise((resolve) => {
    if (!db) return resolve(true);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve(true);
  });
}

// ================= SAMPLE DATA (CONTOH DOKUMENTASI TOURING) =================
function getSampleTouringData() {
  return [
    {
      id: 'touring_sample_1',
      destination: 'Touring Puncak Pass & Kebun Teh Bogor',
      date: '2026-11-10',
      notes: 'Honda CB150X - Riding pagi subuh, kabut tebal & sejuk',
      photos: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&auto=format&fit=crop&q=80'
      ],
      createdAt: Date.now() - 500000
    },
    {
      id: 'touring_sample_2',
      destination: 'Touring Pantai Sawarna Jalur Cikidang',
      date: '2026-11-18',
      notes: 'Rombongan 5 motor - Jalur kelok-kelok ekstrem & sunset pantai',
      photos: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80'
      ],
      createdAt: Date.now()
    }
  ];
}

// ================= IMAGE COMPRESSION (CANVAS) =================
// Kompres foto otomatis agar ringan, tajam, dan cepat dimuat
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output JPEG 75% quality (~80KB per foto, sangat hemat dan jernih)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        resolve(compressedBase64);
      };
    };
  });
}

// ================= FILE UPLOAD & PREVIEW LOGIC =================
window.triggerUpload = function(slotNumber) {
  const fileInput = document.getElementById(`file-${slotNumber}`);
  if (fileInput) fileInput.click();
};

window.handleFileSelect = async function(event, slotNumber) {
  const file = event.target.files[0];
  if (!file) return;

  const previewContainer = document.getElementById(`preview-container-${slotNumber}`);
  previewContainer.innerHTML = `
    <div class="text-xs text-orange-400 flex items-center gap-1.5 font-medium">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>
      <span>Memproses...</span>
    </div>
  `;
  lucide.createIcons();

  const compressedData = await compressImage(file);
  currentUploadPhotos[slotNumber - 1] = compressedData;

  // Tampilkan thumbnail foto di slot
  previewContainer.innerHTML = `
    <img src="${compressedData}" alt="Foto ${slotNumber}" class="w-full h-full object-cover rounded-xl" />
    <span class="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold backdrop-blur">
      Foto ${slotNumber} ✓
    </span>
  `;

  document.getElementById('upload-status').classList.add('hidden');
};

function resetUploadSlots() {
  currentUploadPhotos = [null, null, null];
  for (let i = 1; i <= 3; i++) {
    const previewContainer = document.getElementById(`preview-container-${i}`);
    previewContainer.innerHTML = `
      <i data-lucide="image-plus" class="w-6 h-6 text-slate-500 mb-1.5 group-hover:text-orange-400 transition"></i>
      <span class="text-xs font-semibold text-slate-300">Foto ${i}</span>
      <span class="text-[10px] text-slate-500 mt-0.5">Klik untuk unggah</span>
    `;
    const input = document.getElementById(`file-${i}`);
    if (input) input.value = '';
  }
  document.getElementById('upload-status').classList.add('hidden');
  lucide.createIcons();
}

// ================= MODAL FORM HANDLER =================
const modalForm = document.getElementById('modal-form');
const btnOpenForm = document.getElementById('btn-open-form');
const btnEmptyAdd = document.getElementById('btn-empty-add');
const modalCloseBtn = document.getElementById('modal-close-btn');
const touringForm = document.getElementById('touring-form');

function openFormModal() {
  modalForm.classList.remove('hidden');
  modalForm.classList.add('flex');
  // Default tanggal ke hari ini
  document.getElementById('input-date').value = new Date().toISOString().split('T')[0];
  resetUploadSlots();
}

function closeFormModal() {
  modalForm.classList.add('hidden');
  modalForm.classList.remove('flex');
}

btnOpenForm.addEventListener('click', openFormModal);
btnEmptyAdd.addEventListener('click', openFormModal);
modalCloseBtn.addEventListener('click', closeFormModal);

// Submit Touring
touringForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const destination = document.getElementById('input-destination').value.trim();
  const date = document.getElementById('input-date').value;
  const notes = document.getElementById('input-notes').value.trim();

  // Validasi: Wajib 3 foto
  if (!currentUploadPhotos[0] || !currentUploadPhotos[1] || !currentUploadPhotos[2]) {
    const uploadStatus = document.getElementById('upload-status');
    uploadStatus.classList.remove('hidden');
    uploadStatus.textContent = 'Harap lengkapi ke-3 foto untuk touring ini sebelum menyimpan!';
    return;
  }

  const newTouring = {
    id: 'tour_' + Date.now(),
    destination,
    date,
    notes,
    photos: [...currentUploadPhotos],
    createdAt: Date.now()
  };

  await saveTouringToDB(newTouring);
  touringList.unshift(newTouring);

  closeFormModal();
  touringForm.reset();
  resetUploadSlots();

  renderGallery();
  updateStats();
});

// ================= GALLERY RENDERING =================
const galleryGrid = document.getElementById('gallery-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  }
  return dateStr;
}

function renderGallery() {
  const query = searchInput.value.toLowerCase().trim();
  const sortMode = sortSelect.value;

  let filtered = touringList.filter(item => {
    return item.destination.toLowerCase().includes(query) || (item.notes && item.notes.toLowerCase().includes(query));
  });

  if (sortMode === 'newest') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortMode === 'oldest') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortMode === 'az') {
    filtered.sort((a, b) => a.destination.localeCompare(b.destination));
  }

  galleryGrid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'bg-dark-850 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col group';

    const p1 = item.photos[0] || '';
    const p2 = item.photos[1] || '';
    const p3 = item.photos[2] || '';

    card.innerHTML = `
      <!-- Header Card -->
      <div class="p-4 border-b border-slate-800/80 flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <i data-lucide="calendar" class="w-3 h-3"></i>
              ${formatDateIndo(item.date)}
            </span>
          </div>
          <h3 class="font-bold text-base text-white leading-snug group-hover:text-orange-400 transition">${item.destination}</h3>
          ${item.notes ? `<p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><i data-lucide="tag" class="w-3 h-3 text-slate-500"></i> ${item.notes}</p>` : ''}
        </div>

        <button onclick="deleteTouring('${item.id}')" class="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition shrink-0" title="Hapus Album">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- 3 FOTO GRID COLLAGE -->
      <div class="p-3 bg-dark-900 grid grid-cols-3 gap-2 flex-1">
        
        <!-- Foto 1 -->
        <div class="touring-photo-container relative rounded-2xl overflow-hidden aspect-[4/5] bg-dark-800 cursor-pointer" onclick="openLightbox('${encodeURIComponent(p1)}', '${encodeURIComponent(item.destination)}', 'Foto 1 dari 3')">
          <img src="${p1}" alt="${item.destination} Foto 1" class="touring-photo w-full h-full object-cover" loading="lazy" />
          <span class="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium backdrop-blur">
            #1
          </span>
        </div>

        <!-- Foto 2 -->
        <div class="touring-photo-container relative rounded-2xl overflow-hidden aspect-[4/5] bg-dark-800 cursor-pointer" onclick="openLightbox('${encodeURIComponent(p2)}', '${encodeURIComponent(item.destination)}', 'Foto 2 dari 3')">
          <img src="${p2}" alt="${item.destination} Foto 2" class="touring-photo w-full h-full object-cover" loading="lazy" />
          <span class="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium backdrop-blur">
            #2
          </span>
        </div>

        <!-- Foto 3 -->
        <div class="touring-photo-container relative rounded-2xl overflow-hidden aspect-[4/5] bg-dark-800 cursor-pointer" onclick="openLightbox('${encodeURIComponent(p3)}', '${encodeURIComponent(item.destination)}', 'Foto 3 dari 3')">
          <img src="${p3}" alt="${item.destination} Foto 3" class="touring-photo w-full h-full object-cover" loading="lazy" />
          <span class="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium backdrop-blur">
            #3
          </span>
        </div>

      </div>

      <!-- Card Footer -->
      <div class="px-4 py-2.5 bg-dark-850/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>3 Foto Tersimpan</span>
        <span class="text-orange-400 font-medium flex items-center gap-1">
          <i data-lucide="zoom-in" class="w-3 h-3"></i> Klik foto untuk perbesar
        </span>
      </div>
    `;

    galleryGrid.appendChild(card);
  });

  lucide.createIcons();
}

window.deleteTouring = async function(id) {
  if (confirm('Hapus dokumentasi touring ini beserta ke-3 fotonya?')) {
    await deleteTouringFromDB(id);
    touringList = touringList.filter(item => item.id !== id);
    renderGallery();
    updateStats();
  }
};

searchInput.addEventListener('input', renderGallery);
sortSelect.addEventListener('change', renderGallery);

// ================= STATS SUMMARY =================
function updateStats() {
  const totalTouring = touringList.length;
  const totalPhotos = touringList.reduce((acc, item) => acc + (item.photos ? item.photos.length : 0), 0);

  document.getElementById('stat-total-touring').textContent = `${totalTouring} Tempat`;
  document.getElementById('stat-total-photos').textContent = `${totalPhotos} Foto`;
}

// ================= LIGHTBOX (FULL-SCREEN PREVIEW) =================
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

window.openLightbox = function(encodedImgUrl, encodedTitle, caption) {
  lightboxImg.src = decodeURIComponent(encodedImgUrl);
  lightboxTitle.textContent = decodeURIComponent(encodedTitle);
  lightboxCaption.textContent = caption;

  lightboxModal.classList.remove('hidden');
  lightboxModal.classList.add('flex');
};

lightboxClose.addEventListener('click', () => {
  lightboxModal.classList.add('hidden');
  lightboxModal.classList.remove('flex');
});

lightboxModal.addEventListener('click', (e) => {
  if (e.target === lightboxModal) {
    lightboxModal.classList.add('hidden');
    lightboxModal.classList.remove('flex');
  }
});

// ================= SAMPLE DATA BUTTON =================
document.getElementById('btn-sample-data').addEventListener('click', async () => {
  if (touringList.length > 0) {
    if (!confirm('Tambahkan contoh album dokumentasi turing ke galeri Anda?')) return;
  }

  const samples = getSampleTouringData();
  for (const s of samples) {
    await saveTouringToDB(s);
  }
  touringList = [...samples, ...touringList];
  renderGallery();
  updateStats();
});

// Clear All Data
document.getElementById('btn-clear-all').addEventListener('click', async () => {
  if (touringList.length === 0) return;
  if (confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA foto touring yang ada?')) {
    await clearAllTouringsFromDB();
    touringList = [];
    renderGallery();
    updateStats();
  }
});

// ================= INITIALIZE APP =================
async function initApp() {
  await initDB();
  touringList = await getAllTouringsFromDB();

  // Jika pertama kali buka dan kosong, isi dengan contoh touring yang keren
  if (touringList.length === 0) {
    const samples = getSampleTouringData();
    for (const s of samples) {
      await saveTouringToDB(s);
    }
    touringList = samples;
  }

  renderGallery();
  updateStats();
  lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  lucide.createIcons();
});
