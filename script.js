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

// Dummy data for testing
const images = [
  {device: 'Telefon', category: 'BMW', src: 'https://via.placeholder.com/400x225?text=BMW+Telefon+1'},
  {device: 'Telefon', category: 'BMW', src: 'https://via.placeholder.com/400x225?text=BMW+Telefon+2'},
  {device: 'PC', category: 'BMW', src: 'https://via.placeholder.com/400x225?text=BMW+PC+1'},
  {device: 'PC', category: 'Toyota', src: 'https://via.placeholder.com/400x225?text=Toyota+PC+1'},
  {device: 'Telefon', category: 'Porsche', src: 'https://via.placeholder.com/400x225?text=Porsche+Telefon+1'},
  {device: 'PC', category: 'Porsche', src: 'https://via.placeholder.com/400x225?text=Porsche+PC+1'},
];

function loadImages(category) {
  gallery.innerHTML = '';

  const filtered = images.filter(img =>
    (category === 'all' || img.category === category) &&
    img.device === currentDevice
  );

  filtered.forEach((imgObj, i) => {
    const img = document.createElement('img');
    img.src = imgObj.src;
    img.alt = `${imgObj.category} wallpaper ${i + 1}`;
    img.style.opacity = '0';
    img.style.transition = `opacity 0.6s ease ${i * 0.15}s`;
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    img.addEventListener('click', () => {
      modalImg.src = imgObj.src;
      modalImg.alt = `Large ${imgObj.category} wallpaper`;
      downloadLink.href = imgObj.src;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
    gallery.appendChild(img);
  });
}

// Event listeners for device switch
deviceSwitchRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    currentDevice = radio.value;
    loadImages(currentCategory);
  });
});

// Event listeners for category buttons
categories.forEach(btn => {
  btn.addEventListener('click', () => {
    categories.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadImages(currentCategory);
  });
});

// Close modal
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }
});

// Dark mode toggle
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

// Last inn bilder ved start
loadImages(currentCategory);
