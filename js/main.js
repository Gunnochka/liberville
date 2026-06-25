// ===== Прелоадер: прячем после загрузки страницы =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader.classList.add('is-hidden'), 1600);
});

// ===== Шапка меняет фон при скролле =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 60);
});

// ===== Бургер-меню (мобильное) =====
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('is-open'));
nav.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => nav.classList.remove('is-open'))
);

// ===== Каталог квартир (фильтр + рендер из assets/data/flats.js) =====
const flatsGrid = document.getElementById('flatsGrid');
const flatFilter = document.getElementById('flatFilter');

function roomsWord(n) { return n + '-кімнатна'; }
function fmtPrice(p) { return p ? '$' + Number(p).toLocaleString('uk-UA') : 'Ціна за запитом'; }

function renderFlats(rooms) {
  if (!flatsGrid || !window.FLATS) return;
  const list = rooms === 'all'
    ? window.FLATS
    : window.FLATS.filter(f => String(f.rooms) === String(rooms));
  if (!list.length) {
    flatsGrid.innerHTML = '<p class="flats-empty">Немає квартир за цим фільтром.</p>';
    return;
  }
  flatsGrid.innerHTML = list.map(f => `
    <div class="flat-card">
      <div class="flat-card__top">
        <span class="flat-card__rooms">${roomsWord(f.rooms)}</span>
        <span class="flat-badge flat-badge--${f.status}">${f.status === 'available' ? 'Вільна' : 'Заброньована'}</span>
      </div>
      <div class="flat-card__params">
        <div><span>Площа</span><b>${f.area} м²</b></div>
        <div><span>Поверх</span><b>${f.floor}</b></div>
        <div><span>Секція</span><b>${f.section}</b></div>
      </div>
      <div class="flat-card__price">${fmtPrice(f.price)}</div>
      <button class="btn btn--accent btn--full js-open-modal">Дізнатись ціну</button>
    </div>
  `).join('');
}

if (flatFilter) {
  flatFilter.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    flatFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    renderFlats(btn.dataset.rooms);
    if (flatsGrid) flatsGrid.scrollLeft = 0; // на початок при зміні типу
  });
  renderFlats('all');
}

// Стрелки слайдера каталога
const flatsPrev = document.getElementById('flatsPrev');
const flatsNext = document.getElementById('flatsNext');
function slideFlats(dir) {
  if (flatsGrid) flatsGrid.scrollBy({ left: dir * flatsGrid.clientWidth * 0.85, behavior: 'smooth' });
}
if (flatsPrev) flatsPrev.addEventListener('click', () => slideFlats(-1));
if (flatsNext) flatsNext.addEventListener('click', () => slideFlats(1));

// ===== Модальное окно =====
const modal = document.getElementById('modal');
const form = document.getElementById('form');
const formSuccess = document.getElementById('formSuccess');

function openModal() {
  modal.classList.add('is-open');
  form.style.display = 'flex';
  formSuccess.classList.remove('is-visible');
}
function closeModal() {
  modal.classList.remove('is-open');
}
// Делегирование: работает и для кнопок, созданных каталогом динамически
document.addEventListener('click', e => {
  if (e.target.closest('.js-open-modal')) openModal();
  else if (e.target.closest('.js-close-modal')) closeModal();
});

// Закрытие по клавише Esc
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Отправка формы (пока без сервера — просто показываем «Дякуємо»)
form.addEventListener('submit', e => {
  e.preventDefault();
  form.style.display = 'none';
  formSuccess.classList.add('is-visible');
});

// ===== Анимация появления блоков при скролле =====
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
reveals.forEach(el => observer.observe(el));

// ===== «Ленивые» видео: грузятся и играют только в зоне видимости =====
// (экономит трафик и ускоряет первую загрузку — видео не качаются все сразу)
const lazyVideos = document.querySelectorAll('video[data-autoplay]');
if (lazyVideos.length) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {}); // play() сам подгрузит видео (preload="none")
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });
  lazyVideos.forEach(v => videoObserver.observe(v));
}
