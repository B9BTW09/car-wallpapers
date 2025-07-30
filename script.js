// Init Supabase client (fyll inn din URL og nøkkel)
const supabaseUrl = 'https://your-project.supabase.co';  // Bytt ut med din URL
const supabaseKey = 'your-public-anon-key';  // Bytt ut med din publiserbare nøkkel
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.getElementById('close');
const downloadLink = document.getElementById('download-link');
const categories = document.querySelectorAll('#categories button.category');
const deviceSwitchRadios = document.querySelectorAll('#device-switch input[name="device"]');
const modeToggle = document.getElementById('mode-toggle');

let images = [];
let currentCategory = 'all';
let currentDevice = 'Telefon';

// Funksjon for å liste filer i en gitt mappe (category)
async function listImages(category) {
  let path = 'car-wallpapers';  // bucket root path

  // Hvis ikke 'all', legg til kategori-mappen i path
  if (category !== 'all') {
    path += `/${category}`;
  }

  // Hent liste over filer fra Supabase Storage
  const { data, error } = await supabase.storage.from('car-wallpapers').list(path);

  if (error) {
    console.error('Error listing images:', error);
    return [];
  }

  // Konverter data til ønsket format
  return data.map(file => ({
    filename: file.name,
    category: category === 'all' ? 'all' : category,
    url: supabase.storage.from('car-wallpapers').getPublicUrl(`${path}/${file.name}`).publicURL
  }));
}

// Last inn bilder basert på valgt kategori
async function loadImages(category) {
  gallery.innerHTML = '';
  images = await listImages(category);

  images.forEach((imgObj, i) => {
    const img = document.createElement('img');
    img.src = imgObj.url;
    img.alt = `Car wallpaper ${imgObj.category} ${i + 1}`;
    img.style.opacity = '0';
    img.style.transition = `opacity 0.6s ease ${i * 0.15}s`;
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('click', () => {
      modalImg.src = imgObj.url;
      modalImg.alt = `Car wallpaper large ${imgObj.category} ${i + 1}`;
      downloadLink.href = imgObj.url;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
    gallery.appendChild(img);
  });
}

// Initial load alle bilder
loadImages(currentCategory);

// Kategori knapp event
categories.forEach(btn => {
  btn.addEventListener('click', () => {
    categories.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadImages(currentCategory);
  });
});

// Resten av modal, dark mode og download-kode kan være likt som før
// ...
