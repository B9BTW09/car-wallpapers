const SUPABASE_URL = 'https://bsgj3w47v0j3iag9lhjv-g.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bsgj3w47v0J3iAg9lhJV-g_efBs9ioa';

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

async function fetchImages(category, device) {
  // Hvis kategori er "all", hent alle bilmerker
  if(category === 'all') {
    const brands = ['BMW', 'Toyota', 'Porsche'];
    let allImages = [];
    for(const brand of brands) {
      const images = await fetchImages(brand, device);
      allImages = allImages.concat(images);
    }
    return allImages;
  }
  
  const prefix = `${device}/${category}`;
  const { data, error } = await supabase.storage.from('car-wallpapers').list(prefix);

  if(error) {
    console.error('Error fetching images:', error);
    return [];
  }
  return data;
}

function getImageURL(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/car-wallpapers/${path}`;
}

async function loadImages(category) {
  gallery.innerHTML = '';
  const images = await fetchImages(category, currentDevice);

  images.forEach((imgObj, i) => {
    const img = document.createElement('img');
    img.src = getImageURL(`${currentDevice}/${category === 'all' ? imgObj.name : category + '/' + imgObj.name}`);
    img.alt = `Car wallpaper ${category} ${i + 1}`;
    img.style.opacity = '0';
    img.style.transition = `opacity 0.6s ease ${i * 0.15}s`;
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      downloadLink.href = img.src;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
    gallery.appendChild(img);
  });
}

deviceSwitchRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    currentDevice = radio.value;
    loadImages(currentCategory);
  });
});

categories.forEach(btn => {
  btn.addEventListener('click', () => {
    categories.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadImages(currentCategory);
  });
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
});

modal.addEventListener('click', (e) => {
  if(e.target === modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

function setDarkMode(enabled) {
  if(enabled) {
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

downloadLink.addEventListener('click', (e) => {
  e.preventDefault();
  if(!modalImg.src) return;
  const link = document.createElement('a');
  link.href = modalImg.src;
  link.download = modalImg.src.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Last inn bilder ved oppstart
loadImages(currentCategory);
