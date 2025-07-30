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
  let prefix = `car-wallpapers/${device}/${category === 'all' ? '' : category}`;
  prefix = prefix.replace(/\/+/g, '/').replace(/\/$/, '');

  console.log('Fetching images from prefix:', prefix);

  const { data, error } = await supabase.storage
    .from('car-wallpapers')
    .list(prefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    console.error('Feil ved henting av bilder:', error);
    return [];
  }

  console.log('Fetched images:', data);
  return data;
}

function getImageURL(path) {
  const url = `${SUPABASE_URL}/storage/v1/object/public/car-wallpapers/${path}`;
  console.log('Constructed image URL:', url);
  return url;
}

async function loadImages(category) {
  gallery.innerHTML = '';
  let imgs = [];

  if(category === 'all') {
    const categoriesList = ['BMW', 'Toyota', 'Porsche'];
    for (const cat of categoriesList) {
      const data = await fetchImages(cat, currentDevice);
      imgs = imgs.concat(data);
    }
  } else {
    imgs = await fetchImages(category, currentDevice);
  }

  if (imgs.length === 0) {
    gallery.innerHTML = '<p>No images found for selected category and device.</p>';
  }

  imgs.forEach((imgObj, i) => {
    const img = document.createElement('img');
    const imgPath = `${currentDevice}/${imgObj.name}`;
    img.src = getImageURL(imgPath);
    img.alt = `Car wallpaper ${category} ${i + 1}`;
    img.style.opacity = '0';
    img.style.transition = `opacity 0.6s ease ${i * 0.15}s`;
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.alt = `Car wallpaper large ${category} ${i + 1}`;
      downloadLink.href = img.src;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
    gallery.appendChild(img);
  });
}

// Resten av koden din med eventlisteners osv. forblir uendret
