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

// ===== Карусель планувань (дані з assets/data/plans.js) =====
const planTrack  = document.getElementById('planTrack');
const planFilter = document.getElementById('planFilter');
const planDots   = document.getElementById('planDots');
const planCar    = document.getElementById('planCar');

if (planTrack && window.PLANS) {
  const roomsWord = n => n === 1 ? '1 кімната' : n + ' кімнати';
  const num = v => v.toFixed(2).replace('.', ',');
  let items = [];

  function render(rooms) {
    items = rooms === 'all'
      ? window.PLANS
      : window.PLANS.filter(p => String(p.rooms) === String(rooms));

    planTrack.innerHTML = items.map((p, i) => `
      <article class="pcard" data-i="${i}">
        <div class="pcard__sheet">
          <picture>
            <source type="image/webp"
                    srcset="assets/img/plans/${p.img}-sm.webp 620w, assets/img/plans/${p.img}.webp 1200w"
                    sizes="(max-width:900px) 62vw, 430px">
            <img src="assets/img/plans/${p.img}-sm.jpg" loading="lazy" decoding="async"
                 srcset="assets/img/plans/${p.img}-sm.jpg 620w, assets/img/plans/${p.img}.jpg 1200w"
                 sizes="(max-width:900px) 62vw, 430px"
                 alt="Планування квартири ${p.code} — ${roomsWord(p.rooms)}, ${num(p.total)} м², ЖК Liberville">
          </picture>
          <span class="pcard__tag">${roomsWord(p.rooms)}</span>
        </div>
        <div class="pcard__body">
          <div class="pcard__head">
            <h3>${p.code}</h3>
            <span class="pcard__area">${num(p.total)} <i>м²</i></span>
          </div>
          <dl class="pcard__specs">
            <div><dt>Житлова</dt><dd>${num(p.living)} м²</dd></div>
            <div><dt>Поверх</dt><dd>${p.floor}</dd></div>
          </dl>
          <button class="btn btn--accent btn--full js-open-modal" type="button">Дізнатись ціну</button>
        </div>
      </article>
    `).join('');

    if (planDots) {
      planDots.innerHTML = items.map((_, i) =>
        `<button class="pcar__dot" type="button" data-i="${i}" aria-label="Планування ${i + 1}"></button>`).join('');
    }
    planTrack.scrollLeft = 0;
    active = -1;
    requestAnimationFrame(() => { measure(); sync(); });
  }

  // підсвічуємо картку, що зараз по центру — сусідні відходять углиб
  let active = -1;
  let centers = [];      // центри карток, поміряні один раз
  let maxScroll = 0;
  let rafId = 0;

  // Геометрію міряємо окремо від прокрутки. Якщо читати offsetLeft на кожному
  // кадрі, браузер щоразу перераховує розкладку — саме через це карусель
  // сіпалась на телефоні.
  function measure() {
    const cards = planTrack.children;
    centers = new Array(cards.length);
    for (let i = 0; i < cards.length; i++) {
      centers[i] = cards[i].offsetLeft + cards[i].offsetWidth / 2;
    }
    maxScroll = planTrack.scrollWidth - planTrack.clientWidth;
  }

  function sync() {
    if (!centers.length) return;
    const mid = planTrack.scrollLeft + planTrack.clientWidth / 2;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < centers.length; i++) {
      const d = Math.abs(centers[i] - mid);
      if (d < bestD) { bestD = d; best = i; }
    }
    // класи чіпаємо ЛИШЕ коли активна картка справді змінилась
    if (best !== active) {
      const cards = planTrack.children;
      if (active >= 0 && cards[active]) cards[active].classList.remove('is-active');
      if (cards[best]) cards[best].classList.add('is-active');
      if (planDots) {
        const ds = planDots.children;
        if (active >= 0 && ds[active]) ds[active].classList.remove('is-on');
        if (ds[best]) ds[best].classList.add('is-on');
      }
      active = best;
    }
    const atStart = planTrack.scrollLeft <= 2;
    const atEnd   = planTrack.scrollLeft >= maxScroll - 2;
    if (prev && prev.disabled !== atStart) prev.disabled = atStart;
    if (next && next.disabled !== atEnd)   next.disabled = atEnd;
  }

  // на кадр — не більше одного перерахунку
  function onScrollFrame() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => { rafId = 0; sync(); });
  }

  function goto(i) {
    const c = planTrack.children[Math.max(0, Math.min(i, planTrack.children.length - 1))];
    if (!c) return;
    planTrack.scrollTo({
      left: c.offsetLeft - (planTrack.clientWidth - c.offsetWidth) / 2,
      behavior: 'smooth'
    });
  }

  const prev = planCar && planCar.querySelector('.pcar__arrow--prev');
  const next = planCar && planCar.querySelector('.pcar__arrow--next');
  if (prev) prev.addEventListener('click', () => goto(active - 1));
  if (next) next.addEventListener('click', () => goto(active + 1));
  if (planDots) planDots.addEventListener('click', e => {
    const d = e.target.closest('.pcar__dot');
    if (d) goto(+d.dataset.i);
  });
  // тап по сусідній картці підводить її в центр
  planTrack.addEventListener('click', e => {
    const card = e.target.closest('.pcard');
    if (card && !card.classList.contains('is-active') && !e.target.closest('button')) {
      goto(+card.dataset.i);
    }
  });

  planTrack.addEventListener('scroll', onScrollFrame, { passive: true });
  window.addEventListener('resize', () => { measure(); sync(); });

  document.addEventListener('keydown', e => {
    if (!planTrack.matches(':hover') && document.activeElement !== planTrack) return;
    if (e.key === 'ArrowLeft')  goto(active - 1);
    if (e.key === 'ArrowRight') goto(active + 1);
  });

  if (planFilter) planFilter.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    planFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    render(btn.dataset.rooms);
  });

  render('all');
}

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



// ===== Інтерактивний генплан: обʼєкти перемикаються прокручуванням =====
const mapx = document.querySelector('.mapx');
if (mapx) {
  const pins  = [...mapx.querySelectorAll('.mapx__pin')];
  const cards = [...mapx.querySelectorAll('.mapx__card')];
  const counter = mapx.querySelector('.mapx__counter b');
  const total = pins.length;

  const isMobile = () => window.matchMedia('(max-width:900px)').matches;

  // Десктоп: секція заввишки в 12 екранів — обʼєкти зʼявляються по черзі на скролі.
  // Мобільний: звичайна секція, а кадр гортається вбік як панорама.
  function setHeight() {
    mapx.style.height = isMobile() ? '' : (total + 1.6) * 100 + 'svh';
  }
  setHeight();


  // Мітки задані у відсотках від самого кадру генплану. Оскільки фото
  // обрізається під формат екрана (object-fit: cover), рахуємо реальну
  // геометрію відмальованого зображення й підганяємо під неї шар міток.
  const pinsBox = mapx.querySelector('.mapx__pins');
  const planImg = mapx.querySelector('.mapx__media img');
  function syncPins() {
    if (!pinsBox || !planImg || !planImg.naturalWidth) return;
    if (isMobile()) { pinsBox.style.cssText = ''; return; }
    const st = mapx.querySelector('.mapx__stage').getBoundingClientRect();
    const ratio = planImg.naturalWidth / planImg.naturalHeight;
    let w = st.width, h = w / ratio;
    if (h < st.height) { h = st.height; w = h * ratio; }   // cover
    pinsBox.style.width  = w + 'px';
    pinsBox.style.height = h + 'px';
    pinsBox.style.left   = (st.width - w) / 2 + 'px';
    pinsBox.style.top    = (st.height - h) / 2 + 'px';
  }
  if (planImg) {
    planImg.complete ? syncPins() : planImg.addEventListener('load', syncPins);
    window.addEventListener('resize', syncPins);
  }

  let current = -1;
  function setActive(i) {
    if (i === current) return;
    current = i;
    pins.forEach((p, n) => {
      p.classList.toggle('is-on', n === i);
      p.classList.toggle('is-seen', n < i || i >= total); // після фіналу — усі видимі
    });
    cards.forEach((c, n) => {
      const on = n === i;
      c.classList.toggle('is-on', on);
      const v = c.querySelector('video');
      if (v) { on ? v.play().catch(() => {}) : v.pause(); }
    });
    if (counter) counter.textContent = String(Math.min(i + 1, total)).padStart(2, '0');
  }

  function onScroll() {
    if (isMobile()) return;
    const r = mapx.getBoundingClientRect();
    const scrollable = mapx.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const p = Math.min(Math.max(-r.top / scrollable, 0), 1);   // 0..1 по секції
    // останні ~14% прокрутки — фінал: показуємо всі мітки, картку ховаємо
    const step = p >= 0.86 ? total : Math.min(Math.floor(p / 0.86 * total), total - 1);
    setActive(step);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ===== Мобільна панорама: кадр гортається вбік, знизу — міні-карта =====
  const scroll   = mapx.querySelector('.mapx__scroll');
  const canvas   = mapx.querySelector('.mapx__canvas');
  const minimap  = mapx.querySelector('.mapx__minimap');
  const winBox   = mapx.querySelector('.mapx__window');
  const arrowPrev= mapx.querySelector('.mapx__arrow--prev');
  const arrowNext= mapx.querySelector('.mapx__arrow--next');

  if (scroll && canvas) {
    // Пропорцію віддаємо в CSS — ширину полотна браузер порахує сам через
    // aspect-ratio. Так надійніше за вимірювання: Safari на iOS повертав
    // висоту прокрутного шару невірно й лишав чорні поля по краях кадру.
    function sizeCanvas() {
      if (!planImg || !planImg.naturalWidth) return;
      mapx.style.setProperty('--plan-ratio',
        planImg.naturalWidth + ' / ' + planImg.naturalHeight);
    }

    // біла рамка на міні-карті показує, яку частину зараз видно
    function syncWindow() {
      if (!isMobile() || !winBox) return;
      const w = scroll.scrollWidth, v = scroll.clientWidth;
      if (w <= v) { winBox.style.left = '0'; winBox.style.width = '100%'; return; }
      winBox.style.width = (v / w * 100) + '%';
      winBox.style.left  = (scroll.scrollLeft / w * 100) + '%';
      const atStart = scroll.scrollLeft <= 2;
      const atEnd   = scroll.scrollLeft >= w - v - 2;
      if (arrowPrev) arrowPrev.disabled = atStart;
      if (arrowNext) arrowNext.disabled = atEnd;
    }

    function step(dir) {
      scroll.scrollBy({ left: dir * scroll.clientWidth * 0.8, behavior: 'smooth' });
    }
    if (arrowPrev) arrowPrev.addEventListener('click', () => step(-1));
    if (arrowNext) arrowNext.addEventListener('click', () => step(1));

    // тап по міні-карті — стрибок у це місце панорами
    if (minimap) minimap.addEventListener('click', e => {
      if (!isMobile()) return;
      const r = minimap.getBoundingClientRect();
      const p = (e.clientX - r.left) / r.width;
      const target = p * scroll.scrollWidth - scroll.clientWidth / 2;
      scroll.scrollTo({ left: target, behavior: 'smooth' });
    });

    scroll.addEventListener('scroll', syncWindow, { passive: true });

    function initPan() {
      sizeCanvas();
      if (isMobile() && !scroll.dataset.centered) {
        // стартуємо з центру кварталу, а не з краю поля
        scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2;
        scroll.dataset.centered = '1';
      }
      syncWindow();
    }
    if (planImg) {
      planImg.complete && planImg.naturalWidth ? initPan()
        : planImg.addEventListener('load', initPan);
    }
    window.addEventListener('resize', () => { setHeight(); sizeCanvas(); syncWindow(); });
    window.addEventListener('orientationchange', () => setTimeout(initPan, 250));
  }

  // ===== Перехід до обʼєкта: лупа розкривається в повний кадр =====
  const objx = document.getElementById('objx');
  if (objx) {
    const zoomImg = objx.querySelector('.objx__zoom img');
    const media   = objx.querySelector('.objx__media');
    const mediaImg= media.querySelector('img');
    const elNum   = objx.querySelector('.objx__num');
    const elTitle = objx.querySelector('.objx__title');
    const elDesc  = objx.querySelector('.objx__desc');
    const Z = 2.9;                       // кратність «лупи»
    let openIdx = -1;

    // дані обʼєктів беремо з наявної розмітки — жодного дублювання текстів
    const items = pins.map((pin, n) => {
      const card = cards[n];
      const fig  = card && card.querySelector('figure');
      const img  = fig && fig.querySelector('img');
      return {
        x: parseFloat(pin.style.getPropertyValue('--x')) / 100,
        y: parseFloat(pin.style.getPropertyValue('--y')) / 100,
        title: card ? card.querySelector('h3').textContent.trim() : pin.getAttribute('aria-label'),
        desc:  card ? card.querySelector('p').textContent.trim() : '',
        photo: img ? img.currentSrc || img.src : '',
        alt:   img ? img.alt : '',
        video: fig ? (v => v ? v.getAttribute('src') : '')(fig.querySelector('video')) : '',
        poster: fig ? (v => v ? v.getAttribute('poster') : '')(fig.querySelector('video')) : '',
        viz:   !!(fig && fig.classList.contains('is-viz'))
      };
    });

    // геометрія: кадр генплану розтягуємо «cover» на вікно й наводимо лупу
    function frame(i) {
      const vw = window.innerWidth, vh = window.innerHeight;
      const ratio = (planImg && planImg.naturalWidth)
        ? planImg.naturalWidth / planImg.naturalHeight : 4 / 3;
      let w = vw, h = w / ratio;
      if (h < vh) { h = vh; w = h * ratio; }
      const ox = (vw - w) / 2, oy = (vh - h) / 2;
      const px = w * items[i].x, py = h * items[i].y;
      // куди має «прилетіти» точка: ліворуч від панелі (на мобільному — вище)
      const tx = vw < 900 ? vw * 0.5 : vw * 0.3;
      const ty = vw < 900 ? vh * 0.3 : vh * 0.5;
      let a = tx - Z * px, b = ty - Z * py;
      a = Math.min(0, Math.max(vw - w * Z, a));      // не лишаємо порожніх країв
      b = Math.min(0, Math.max(vh - h * Z, b));
      zoomImg.style.width  = w + 'px';
      zoomImg.style.height = h + 'px';
      objx.style.setProperty('--t0', `translate(${ox}px, ${oy}px) scale(1)`);
      objx.style.setProperty('--t1', `translate(${a}px, ${b}px) scale(${Z})`);
    }

    function fill(i) {
      const it = items[i];
      elNum.textContent   = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      elTitle.textContent = it.title;
      elDesc.textContent  = it.desc;
      const mediaVid = media.querySelector('video');
      if (it.video) {
        mediaVid.src = it.video;
        if (it.poster) mediaVid.poster = it.poster;
        mediaVid.hidden = false; mediaImg.hidden = true;
        mediaImg.removeAttribute('src');
        media.classList.remove('is-empty');
        mediaVid.play().catch(() => {});
      } else if (it.photo) {
        mediaImg.src = it.photo; mediaImg.alt = it.alt;
        mediaImg.hidden = false; mediaVid.hidden = true;
        mediaVid.pause(); mediaVid.removeAttribute('src');
        media.classList.remove('is-empty');
      } else {
        mediaImg.removeAttribute('src'); mediaVid.pause();
        media.classList.add('is-empty');
      }
      media.classList.toggle('is-viz', !!it.viz);
      let cap = media.querySelector('figcaption');
      if (it.viz && !cap) { cap = document.createElement('figcaption'); cap.textContent = 'Візуалізація'; media.appendChild(cap); }
      else if (!it.viz && cap) cap.remove();
    }

    function openObj(i) {
      openIdx = i;
      if (!zoomImg.getAttribute('src') && planImg) zoomImg.src = planImg.currentSrc || planImg.src;
      fill(i);
      frame(i);
      void objx.offsetWidth;               // фіксуємо старт, щоб анімація програлась
      objx.classList.add('is-open');
      objx.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      objx.querySelector('.objx__close').focus({ preventScroll: true });
    }

    function goto(i) {
      openIdx = (i + total) % total;
      fill(openIdx);
      frame(openIdx);
      setActive(openIdx);                  // мітки на генплані теж переключаємо
    }

    function closeObj() {
      objx.classList.remove('is-open');
      objx.setAttribute('aria-hidden', 'true');
      const ov = objx.querySelector('.objx__media video');
      if (ov) ov.pause();
      document.body.style.overflow = '';
      // на десктопі повертаємось на «свій» крок скролу; на мобільному панорама
      // нікуди не їхала — чіпати позицію сторінки не треба
      if (openIdx >= 0 && !isMobile()) {
        const scrollable = mapx.offsetHeight - window.innerHeight;
        if (scrollable > 0) {
          const y = mapx.offsetTop + scrollable * ((openIdx + 0.45) / total) * 0.86;
          window.scrollTo({ top: y, behavior: 'auto' });
        }
      }
      openIdx = -1;
    }

    pins.forEach((p, n) => p.addEventListener('click', () => openObj(n)));

    // кнопка «Детальніше» на кожній картці
    cards.forEach((card, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mapx__more';
      b.innerHTML = 'Детальніше <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
      b.addEventListener('click', () => openObj(n));
      card.appendChild(b);
    });

    objx.querySelector('.objx__close').addEventListener('click', closeObj);
    objx.querySelector('.objx__nav--prev').addEventListener('click', () => goto(openIdx - 1));
    objx.querySelector('.objx__nav--next').addEventListener('click', () => goto(openIdx + 1));
    objx.querySelector('.objx__veil').addEventListener('click', closeObj);
    objx.querySelector('.objx__cta').addEventListener('click', closeObj);   // далі спрацює js-open-modal

    document.addEventListener('keydown', e => {
      if (!objx.classList.contains('is-open')) return;
      if (e.key === 'Escape')     closeObj();
      if (e.key === 'ArrowLeft')  goto(openIdx - 1);
      if (e.key === 'ArrowRight') goto(openIdx + 1);
    });

    window.addEventListener('resize', () => { if (openIdx >= 0) frame(openIdx); });
  } else {
    // запасний варіант: клік по мітці гортає до її кроку
    pins.forEach((p, n) => p.addEventListener('click', () => {
      const scrollable = mapx.offsetHeight - window.innerHeight;
      const y = mapx.offsetTop + scrollable * ((n + 0.45) / total) * 0.86;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }));
  }
}

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
// ===== Небо на головній сходить униз при прокрутці =====
// Рухаємо вікно кадрування (object-position), а не саму картинку — тоді
// композиція на місці, краї не оголюються, а хмари з рендера пливуть донизу.
// На телефоні знімок обрізається лише по ширині, запасу висоти нема — там ефект вимкнено.
const leadSec = document.getElementById('lead');
const leadImg = leadSec && leadSec.querySelector('.lead__media img');
if (leadImg && matchMedia('(min-width:701px)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const SHIFT = 44;              // з 50 доступних — лишаємо 6 у запас від краю
  let rafSky = 0;
  function skyTick() {
    rafSky = 0;
    const h = leadSec.offsetHeight || 1;
    const p = Math.min(Math.max(window.scrollY / h, 0), 1);
    leadImg.style.setProperty('--sky', (50 - SHIFT * p).toFixed(1) + '%');
  }
  addEventListener('scroll', () => { if (!rafSky) rafSky = requestAnimationFrame(skyTick); },
                   { passive: true });
  addEventListener('resize', skyTick);
  skyTick();
}

// ===== Перегляд кварталу: кадр змінюється за рухом курсора =====
// Галерея-перегортайка. Працює на кожному .scrub на сторінці:
// генплан у «Схемі генерального плану» і фітнес-клуб.
document.querySelectorAll('.scrub').forEach(scrub => {
  const frames = [...scrub.querySelectorAll('.scrub__frame')];
  const bars   = [...scrub.querySelectorAll('.scrub__bars i')];
  const cap    = scrub.querySelector('.scrub__cap');
  const caps   = frames.map(f => f.dataset.cap || '');
  let cur = 0;

  function show(i) {
    i = Math.max(0, Math.min(i, frames.length - 1));
    if (i === cur) return;
    cur = i;
    frames.forEach((f, n) => f.classList.toggle('is-on', n === i));
    bars.forEach((b, n) => b.classList.toggle('is-on', n === i));
    if (cap) cap.textContent = caps[i];
  }

  function fromX(clientX) {
    const r = scrub.getBoundingClientRect();
    const p = (clientX - r.left) / r.width;
    show(Math.floor(p * frames.length));
  }

  scrub.addEventListener('pointermove', e => {
    // на тачскріні реагуємо лише коли палець веде по кадру
    if (e.pointerType !== 'mouse' && e.buttons === 0) return;
    scrub.classList.add('is-touched');
    fromX(e.clientX);
  });
  scrub.addEventListener('pointerdown', e => {
    scrub.classList.add('is-touched');
    fromX(e.clientX);
  });
  scrub.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(cur - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
  });

  // на телефоні курсора немає — показуємо кадри по черзі самі,
  // поки блок на екрані
  if (window.matchMedia('(hover: none)').matches) {
    let timer = null;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) {
        timer = setInterval(() => show((cur + 1) % frames.length), 2600);
      } else if (!e.isIntersecting && timer) {
        clearInterval(timer); timer = null;
      }
    }, { threshold: .4 });
    io.observe(scrub);
  }
});

// ===== Промо-фільм: вантажимо тільки коли натиснули =====
// Автозапуск з'їв би трафік відвідувача, тому стартуємо по кліку.
// За замовчуванням у плеєрі легка версія 1080p (11 МБ); якщо екран великий
// і зв'язок не економний — підміняємо на оригінал 4K (66 МБ).
const promoFrame = document.getElementById('promoFrame');
const promoVideo = document.getElementById('promoVideo');
if (promoFrame && promoVideo) {
  function wantsUHD() {
    const uhd = promoVideo.dataset.uhd;
    if (!uhd) return null;
    const c = navigator.connection;
    if (c && (c.saveData || /(^|-)[23]g$/.test(c.effectiveType || ''))) return null;
    const px = promoFrame.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2);
    return px > 1600 ? uhd : null;
  }

  const startPromo = () => {
    if (promoFrame.classList.contains('is-playing')) return;
    promoFrame.classList.add('is-playing');
    const uhd = wantsUHD();
    if (uhd && !promoVideo.getAttribute('src')) {
      promoVideo.setAttribute('src', uhd);
      promoVideo.load();
    }
    promoVideo.controls = true;
    promoVideo.play().catch(() => {});
    if (typeof gtag === 'function') {
      gtag('event', 'video_start', {
        video_title: 'Liberville promo',
        video_quality: uhd ? '4K' : '1080p'
      });
    }
  };
  promoFrame.querySelector('.video-play').addEventListener('click', startPromo);
  promoVideo.addEventListener('play', () => promoFrame.classList.add('is-playing'));
  promoVideo.addEventListener('ended', () => promoFrame.classList.remove('is-playing'));
}

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
