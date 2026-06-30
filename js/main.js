// ===== Прелоадер: прячем после загрузки страницы =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader.classList.add('is-hidden'), 1600);
});

// ===== Кінематографічний вхід (scroll-driven, у стилі Rockstar GTA VI) =====
(function () {
  const intro = document.getElementById('intro');
  if (!intro) return;
  const mosaic = document.getElementById('introMosaic');
  const veil   = document.getElementById('introVeil');
  const video  = document.getElementById('introVideo');
  const center = document.getElementById('introCenter');
  const cta    = document.getElementById('introCta');
  const scroll = document.getElementById('introScroll');

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const seg   = (v, a, b) => clamp((v - a) / (b - a), 0, 1); // нормализуем участок прогресса

  // Уважение к настройке «меньше движения»: статичный кадр без скролл-анимации
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    veil.style.opacity = 0.5;
    cta.style.opacity = 1; cta.style.transform = 'none'; cta.classList.add('is-on');
    return;
  }

  let videoOn = false, scheduled = false;

  function update() {
    scheduled = false;
    const rect = intro.getBoundingClientRect();
    const total = intro.offsetHeight - window.innerHeight;
    const p = clamp(-rect.top / total, 0, 1); // 0..1 — прогресс по секции

    // 1) коллаж: лёгкий зум + растворение («фото уходят»)
    mosaic.style.transform = `scale(${lerp(1, 1.12, p)})`;
    mosaic.style.opacity = 1 - seg(p, 0.46, 0.68);

    // 2) затемнение наплывает (фокус уходит в центр)
    veil.style.opacity = seg(p, 0.05, 0.46) * 0.96;

    // 3) логотип: проявился, чуть подрос; держится, поки фото зникають,
    //    а в самому кінці плавно тане при переході у відео
    const lScale = lerp(0.86, 1.04, seg(p, 0, 0.5));
    const lUp = lerp(0, -7, seg(p, 0.74, 1));
    center.style.transform = `translateY(calc(-50% + ${lUp}vh)) scale(${lScale})`;
    center.style.opacity = 1 - seg(p, 0.88, 1);

    // 4) видео: проявляется поверх затемнення (чітко видно) і грає в зоні показу
    video.style.opacity = seg(p, 0.6, 0.86);
    if (p > 0.5 && !videoOn) { videoOn = true; video.play().catch(() => {}); }
    if (p < 0.46 && videoOn) { videoOn = false; video.pause(); }

    // 5) финальный призыв + скрытие подсказки скролла
    const cOn = seg(p, 0.87, 0.99);
    cta.style.opacity = cOn;
    cta.style.transform = `translateY(${lerp(20, 0, cOn)}px)`;
    cta.classList.toggle('is-on', cOn > 0.5);
    scroll.style.opacity = 1 - seg(p, 0.1, 0.36);
  }

  // Прямой вызов update() на скролле (надёжно во всех браузерах);
  // rAF используем лишь как «сглаживание», но НЕ зависим от него.
  function onScroll() {
    update();
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

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

// Уся логіка модалки/форми працює лише там, де ці елементи є на сторінці.
// (підсторінки — privacy.html, progress.html тощо — підключають той самий main.js без форми)
if (form && modal && formSuccess) {

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

// ===== Відправка заявки: Telegram (миттєво) + Email (дубль) =====
// Налаштування каналів доставки лідів:
const LEAD = {
  tgToken: '8662554569:AAFGZlg9kolj03kvfb2CkD5zpeIiRAu6F0o', // бот @liberville_leads_bot
  tgChat:  '287290291',                                       // куди слати заявки в Telegram
  web3Key: '9370e556-dc5a-4eda-a1fc-ea79897ecf68'  // Web3Forms → e-mail Libervilleua@gmail.com
};

let leadSubmitting = false; // захист від подвійної відправки

form.addEventListener('submit', async e => {
  e.preventDefault();

  // анти-спам: якщо приховане поле заповнене — це бот, мовчки виходимо
  if (form.elements['_gotcha'] && form.elements['_gotcha'].value) return;
  if (leadSubmitting) return; // вже відправляємо — ігноруємо повторне натискання

  const name  = ((form.elements['name']  && form.elements['name'].value)  || '').trim();
  const phone = ((form.elements['phone'] && form.elements['phone'].value) || '').trim();
  if (!name || !phone) return;

  leadSubmitting = true;
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Відправляємо…';

  const page = location.pathname + (location.hash || '');
  const tasks = [];

  // 1) Telegram — миттєве сповіщення менеджеру
  if (LEAD.tgToken && LEAD.tgChat) {
    const text = `🏠 Нова заявка — Liberville\n\n👤 Ім'я: ${name}\n📞 Телефон: ${phone}\n🌐 Сторінка: ${page}`;
    tasks.push(
      fetch(`https://api.telegram.org/bot${LEAD.tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: LEAD.tgChat, text })
      }).then(r => r.ok).catch(() => false)
    );
  }

  // 2) Email — дубль через Web3Forms (запрацює, щойно додамо web3Key)
  if (LEAD.web3Key) {
    tasks.push(
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: LEAD.web3Key,
          subject: 'Нова заявка з сайту Liberville',
          from_name: 'Liberville сайт',
          name, phone, page
        })
      }).then(r => r.ok).catch(() => false)
    );
  }

  const results = await Promise.allSettled(tasks);
  const ok = results.some(r => r.status === 'fulfilled' && r.value);

  leadSubmitting = false;
  btn.disabled = false;
  btn.textContent = label;

  if (ok) {
    form.reset();
    form.style.display = 'none';
    formSuccess.classList.add('is-visible');
  } else {
    alert('Не вдалося відправити заявку. Зателефонуйте нам: +380 63 887 57 28');
  }
});

} // кінець guard (form && modal && formSuccess)

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
