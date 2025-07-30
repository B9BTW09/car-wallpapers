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

// Hent JSON-fil med bilder
fetch('images/images.json')
  .then(response => response.json())
  .then(data => {
    images = data;
    loadImages(currentCategory);
  })
  .catch(err => console.error('Failed to load images.json:', err));

function getImagePath(imgObj) {
  return `images/${imgObj.device}/${imgObj.category}/${imgObj.filename}`;
}

function loadImages(category) {
  gallery.innerHTML = '';

  const filtered = images.filter(img => 
    (category === 'all' || img.category === category) &&
    img.device === currentDevice
  );

  filtered.forEach((imgObj, i) => {
    const img = document.createElement('img');
    img.src = getImagePath(imgObj);
    img.alt = `Car wallpaper ${imgObj.category} ${i + 1}`;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease ' + (i * 0.15) + 's';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('click', () => {
      modalImg.src = getImagePath(imgObj);
      modalImg.alt = `Car wallpaper large ${imgObj.category} ${i + 1}`;
      downloadLink.href = getImagePath(imgObj);
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

// Close modal button
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
});

// Close modal clicking outside image
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
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

// Download button forced download function
downloadLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (!modalImg.src) return;
  const link = document.createElement('a');
  link.href = modalImg.src;
  link.download = modalImg.src.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
