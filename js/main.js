// ===== Завжди починаємо з головного екрана =====
// Браузер за замовчуванням відновлює позицію прокрутки з минулого візиту —
// через це сторінка могла відкриватися десь посередині. Вимикаємо це.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// ===== Прелоадер: прячем после загрузки страницы =====
window.addEventListener('load', () => {
  // якщо у посиланні немає якоря — піднімаємось на самий верх
  if (!location.hash) window.scrollTo(0, 0);

  const preloader = document.getElementById('preloader');
  // 2400 мс — щоб анімація появи логотипа та лінія-індикатор встигли дограти
  if (preloader) setTimeout(() => preloader.classList.add('is-hidden'), 2400);
});

// ===== Кнопка «Дізнатися більше» на головному екрані =====
// Гортаємо плавно, але НЕ лишаємо якір в адресі — інакше при наступному
// заході браузер одразу стрибав би на «Основну ідею», минаючи головний екран.
const leadBtn = document.querySelector('.lead__btn');
if (leadBtn) {
  leadBtn.addEventListener('click', e => {
    const target = document.querySelector(leadBtn.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', location.pathname + location.search);
  });
}

// ===== Шапка меняет фон при скролле =====
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  });
}

// ===== Бургер-меню (мобильное) =====
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  const setNav = open => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => setNav(false))
  );
}

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
  web3Key: '9370e556-dc5a-4eda-a1fc-ea79897ecf68', // Web3Forms → e-mail Libervilleua@gmail.com
  crm: {                                  // G-PLUS CRM — кабінет Time Development
    url:       'https://crm.g-plus.app/api/actions',
    partnerId: '22095',
    token:     'ng3b9ESBSvA-GdDAhhwP9RZsN3nZuBLzeppe-hfqOKc'
  }
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

  // 3) G-PLUS CRM — заявка одразу потрапляє в CRM забудовника
  if (LEAD.crm && LEAD.crm.token && LEAD.crm.partnerId) {
    const crmData = {
      action:     'partner-custom-form',
      token:      LEAD.crm.token,
      partner_id: LEAD.crm.partnerId,
      name, phone,
      lang: 'ua',
      note: `Заявка з сайту Liberville (${page})`
    };
    // прокидаємо UTM-мітки, щоб у CRM було видно, з якої реклами прийшов лід
    new URLSearchParams(location.search).forEach((v, k) => {
      if (k.indexOf('utm_') === 0) crmData[k] = v;
    });
    tasks.push(
      fetch(LEAD.crm.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(crmData)
      }).then(r => r.json()).then(d => !!(d && d.success)).catch(() => false)
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
    // Конверсія: повідомляємо рекламну аналітику про заявку.
    // Спрацює автоматично, щойно підключимо GA4 та Meta Pixel (до того — мовчить).
    if (typeof gtag === 'function') gtag('event', 'generate_lead', { form_page: page });
    if (typeof fbq === 'function') fbq('track', 'Lead');
  } else {
    alert('Не вдалося відправити заявку. Зателефонуйте нам: +380 77 507 55 57');
  }
});

} // кінець guard (form && modal && formSuccess)


// ===== Блоки-тези: текст зʼявляється, коли секція входить в екран =====
const stmts = document.querySelectorAll('.stmt');
if (stmts.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.28 });
  stmts.forEach(s => io.observe(s));
}

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
