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

// Hent bilder fra Supabase Storage
async function fetchImages(category, device) {
  let prefix = `car-wallpapers/${device}/${category === 'all' ? '' : category}`;

  // Fjern doble skråstreker og trailing slash
  prefix = prefix.replace(/\/+/g, '/').replace(/\/$/, '');

  const { data, error } = await supabase.storage
    .from('car-wallpapers')
    .list(prefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    console.error('Feil ved henting av bilder:', error);
    return [];
  }
  return data;
}

function getImageURL(path) {
  return `https://bsgj3w47v0j3iag9lhjv-g.supabase.co/storage/v1/object/public/car-wallpapers/${path}`;
}

async function loadImages(category) {
  gallery.innerHTML = '';
  let imgs = [];

  if (category === 'all') {
    // Hent fra alle kategorier for valgt device
    const cats = ['BMW', 'Toyota', 'Porsche'];
    for (const cat of cats) {
      const data = await fetchImages(cat, currentDevice);
      imgs = imgs.concat(data);
    }
  } else {
    imgs = await fetchImages(category, currentDevice);
  }

  imgs.forEach((imgObj, i) => {
    const img = document.createElement('img');
    img.src = getImageURL(imgObj.name);
    img.alt = `Car wallpaper ${category} ${i + 1}`;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease ' + (i * 0.15) + 's';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('click', () => {
      modalImg.src = getImageURL(imgObj.name);
      modalImg.alt = `Car wallpaper large ${category} ${i + 1}`;
      downloadLink.href = getImageURL(imgObj.name);
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
    gallery.appendChild(img);
  });
}

// Device switch change event
deviceSwitchRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    currentDevice = radio.value;
    loadImages(currentCategory);
  });
});

// Category button events
categories.forEach(btn => {
  btn.addEventListener('click', () => {
    categories.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadImages(currentCategory);
  });
});

// Modal close events
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
});
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

// Dark mode toggle and persist
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
modeToggle.addEventListener('mouseenter', () => {
  modeToggle.textContent = darkModeOn ? 'Switch to Light Mode' : 'Switch to Dark Mode';
});
modeToggle.addEventListener('mouseleave', () => {
  modeToggle.textContent = darkModeOn ? 'Light Mode' : 'Dark Mode';
});
modeToggle.textContent = darkModeOn ? 'Light Mode' : 'Dark Mode';

// Download funksjon
downloadLink.addEventListener('click', e => {
  e.preventDefault();
  if (!modalImg.src) return;
  const link = document.createElement('a');
  link.href = modalImg.src;
  link.download = modalImg.src.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Last inn bilder første gang siden åpnes
loadImages(currentCategory);
