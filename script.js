// Konfigurasjon Supabase
const SUPABASE_URL = 'https://bsgj3w47v0j3iag9lhjv-g.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bsgj3w47v0J3iAg9lhJV-g_efBs9ioa';

// INITIALISER Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.getElementById('close');
const downloadLink = document.getElementById('download-link');
const categories = document.querySelectorAll('#categories button.category');
const deviceSwitchRadios = document.querySelectorAll('#device-switch input[name="device"]');
const modeToggle = document.getElementById('mode-toggle');

let currentCategory = 'all';
let currentDevice = 'Telefon';

// Hent bilder fra Supabase bucket
async function fetchImages(category, device) {
  let prefix = `car-wallpapers/${device}/${category === 'all' ? '' : category}`;
  prefix = prefix.replace(/\/+/g, '/').replace(/\/$/, '');

  const { data, error } = await supabase.storage
    .from('car-wallpapers')
    .list(prefix, { limit: 100, offset: 0 });

  if (error) {
    console.error('Feil ved henting av bilder:', error);
    return [];
  }
  return data;
}

// Lag URL for bilde
function getImageURL(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/car-wallpapers/${path}`;
}

// Last inn bilder og vis i galleri
async function loadImages(category) {
  gallery.innerHTML = '';
  let imgs = [];

  if (category === 'all') {
    const allCategories = ['BMW', 'Toyota', 'Porsche'];
    for (const cat of allCategories) {
      const data = await fetchImages(cat, currentDevice);
      imgs = imgs.concat(data);
    }
  } else {
    imgs = await fetchImages(category, currentDevice);
  }

  imgs.forEach((imgObj, i) => {
    const img = document.createElement('img');
    img.src = getImageURL(`${currentDevice}/${imgObj.name}`);
    img.alt = `Car wallpaper ${category} ${i + 1}`;
    img.style.opacity = '0';
    img.style.transition = `opacity 0.6s ease ${i * 0.15}s`;
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('click', () => {
      modalImg.src = getImageURL(`${currentDevice}/${imgObj.name}`);
      modalImg.alt = `Car wallpaper large ${category} ${i + 1}`;
      downloadLink.href = getImageURL(`${currentDevice}/${imgObj.name}`);
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
    gallery.appendChild(img);
  });
}

// Events for å endre device (Telefon/PC)
deviceSwitchRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    currentDevice = radio.value;
    loadImages(currentCategory);
  });
});

// Events for kategori-knapper
categories.forEach(btn => {
  btn.addEventListener('click', () => {
    categories.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadImages(currentCategory);
  });
});

// Lukke modal
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
});

// Lukke modal ved klikk utenfor bilde
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

// Lukke modal med ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

// Dark mode toggle og lagring
function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
    modeToggle.textContent = 'Switch to Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    modeToggle.textContent = 'Switch to Dark Mode';
  }
  localStorage.setItem('darkMode', enabled);
}

const savedMode = localStorage.getItem('darkMode');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
let darkModeOn = savedMode !== null ? savedMode === 'true' : prefersDark;

setDarkMode(darkModeOn);

modeToggle.addEventListener('click', () => {
  darkModeOn = !darkModeOn;
  setDarkMode(darkModeOn);
});

// Last inn bilder første gang
loadImages(currentCategory);
