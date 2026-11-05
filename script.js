// ######################## CONFIG: edit text, price, links and photos here ########################
const CONFIG = {
  brand: { name: 'Clouds & Cover' },
  currency: '₱',
  price: 200,                                   // one set price for every color
  email: 'alzielle_panganiban@dlsu.edu.ph',
  orderFormUrl: 'https://docs.google.com/forms/d/1YB6uBL1dGD_2V37zWiYCYqjGmkwd-ZLqyzSBbvVvnyM/viewform?embedded=true',
  clouds: { rows: 7, ms: 1000, colors: ['#ffffff', '#f8c8d8', '#bfe0f2', '#fbf0b0', '#cdb8e8', '#f8f4ea'] }, // transition cloud size/speed/colors
  intro: { enabled: true, holdMs: 1100 },        // cloud-parting reveal on every load

  // ---- AUDIO: background music + sound effects. Set any `src` to '' to silence just that sound. ----
  audio: {
    enabled: true,                               // master switch for ALL sound
    music: {
      src: 'assets/audio/once-upon-a-time.mp3',  // put the music file here
      volume: 0.35,                              // 0 to 1
      loop: true,
      title: 'Once Upon a Time',
      artist: 'Austin Farwell',
      credit: 'Background music: \u201cOnce Upon a Time\u201d by Austin Farwell. \u00a9 Austin Farwell. All rights belong to the artist.'
    },
    sfx: {
      volume: 0.7,                               // master volume for every effect below (0 to 1)
      click:         { src: 'assets/audio/sfx/click.mp3',      volume: 1 },    // any button or link
      nav:           { src: 'assets/audio/sfx/nav.mp3',        volume: 1 },    // header menu and logo
      order:         { src: 'assets/audio/sfx/order.mp3',      volume: 1 },    // "Order" buttons
      hover:         { src: 'assets/audio/sfx/hover.mp3',      volume: 0.5 },  // mouse over buttons and cards
      scroll:        { src: 'assets/audio/sfx/scroll.mp3',     volume: 0.4, everyPx: 400, minGapMs: 250 }, // soft tick every 400px scrolled
      intro:         { src: 'assets/audio/sfx/intro.mp3',      volume: 1 },    // clouds parting when the site loads
      transitionIn:  { src: 'assets/audio/sfx/clouds-in.mp3',  volume: 1 },    // clouds cover the screen
      transitionOut: { src: 'assets/audio/sfx/clouds-out.mp3', volume: 1 }     // clouds part to show the new page
    }
  }
};

// PHOTOS: put a file path in `image` (e.g. 'assets/baby-pink.jpg'). Empty = placeholder.
const PRODUCTS = [
  { id: 'baby-pink',   name: 'Baby Pink',   color: '#f8c8d8', image: 'assets/image/pnk.png', description: 'Soft and rosy, a gentle pick for pastel rooms and afternoon naps.' },
  { id: 'lilac-purple', name: 'Lilac Purple', color: '#cdb8e8', image: 'assets/image/lil.png', description: 'A dreamy lilac that feels like the sky just after sunset.' },
  { id: 'sage-green',  name: 'Sage Green',  color: '#b3c7a3', image: 'assets/image/grn.png', description: 'Calm, earthy green for a quiet, restful corner.' },
  { id: 'assorted',    name: 'Assorted',    color: 'linear-gradient(135deg,#f8c8d8,#cdb8e8,#b3c7a3,#bfe0f2,#fbf0b0)', image: 'assets/image/mystery.png', description: 'A mix of our dreamy colors in one pick. If one was picked, then a random color will be given.' },
  { id: 'dark-blue',   name: 'Dark Blue',   color: '#1f2f5c', image: 'assets/image/dark.png', description: 'Deep midnight blue for the coziest late nights.' },
  { id: 'off-white',   name: 'Off White',   color: '#ece5d3', image: 'assets/image/white.png', description: 'Soft and creamy, like a cloud you can wrap around yourself.' },
  { id: 'pale-yellow', name: 'Pale Yellow', color: '#fbf0b0', image: 'assets/image/yel.png', description: 'Warm and buttery, like morning light on your bed.' },
  { id: 'light-blue',  name: 'Light Blue',  color: '#bfe0f2', image: 'assets/image/light.png', description: 'Fresh, airy blue for clear skies and easy sleep.' }
];
PRODUCTS.forEach((p) => { p.price = CONFIG.price; });

const MEMBERS = ['Lian Urielle Abestilla', 'Zion Hombrebueno', 'Anton Limaco', 'Alzielle Jean Panganiban', 'Zoltan Tapongot'];

// ######################## helpers ########################
const $ = (s) => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PAGES = ['home', 'products', 'order'];
const layer = $('#clouds');

// ######################## audio (music + sound effects) ########################
// Browsers block sound until the visitor interacts, so music starts on the first click, tap or key press.
const AUDIO = (() => {
  const cfg = CONFIG.audio, bank = {}, failed = {}, gestures = ['pointerdown', 'pointerup', 'keydown', 'touchend'];
  let on = cfg.enabled, music = null;
  try { if (localStorage.getItem('cc-sound') === 'off') on = false; } catch (e) {}

  function load(name) {
    const s = cfg.sfx[name];
    if (!s || !s.src || failed[name]) return null;
    if (!bank[name]) { bank[name] = new Audio(s.src); bank[name].addEventListener('error', () => { failed[name] = true; }); }
    return bank[name];
  }
  function sfx(name) {
    const base = on && cfg.enabled && load(name);
    if (!base) return;
    const a = base.cloneNode();                  // clone so quick repeats can overlap
    a.volume = Math.min(1, cfg.sfx.volume * (cfg.sfx[name].volume ?? 1));
    a.play().catch(() => {});
  }
  function unlock() { playMusic(); }
  function playMusic() {
    if (music && on) music.play().then(() => gestures.forEach((g) => removeEventListener(g, unlock))).catch(() => {});
  }
  function setOn(v) {
    on = v;
    try { localStorage.setItem('cc-sound', v ? 'on' : 'off'); } catch (e) {}
    if (music) { if (v) playMusic(); else music.pause(); }
    const b = $('#sound-toggle');
    b.textContent = v ? '\u266a Sound on' : '\u266a Sound off';
    b.setAttribute('aria-pressed', v);
  }
  function init() {
    if (cfg.music.src) { music = new Audio(cfg.music.src); music.loop = cfg.music.loop; music.volume = cfg.music.volume; }
    Object.keys(cfg.sfx).forEach(load);          // preload effects
    $('#sound').hidden = !cfg.enabled;
    $('#sound-credit').textContent = cfg.music.title + ' by ' + cfg.music.artist;
    $('#music-credit').textContent = cfg.music.credit;
    $('#sound-toggle').addEventListener('click', () => setOn(!on));
    gestures.forEach((g) => addEventListener(g, unlock, { passive: true }));
    setOn(on);

    document.addEventListener('click', (e) => {  // click / nav / order sounds
      const t = e.target.closest('a, button');
      if (!t) return;
      sfx(t.matches('.btn[href="#order"]') ? 'order' : t.closest('nav') || t.matches('.brand') ? 'nav' : 'click');
    });
    let lastHover = null;
    document.addEventListener('pointerover', (e) => {  // hover sound (mouse only)
      if (e.pointerType !== 'mouse') return;
      const t = e.target.closest('.btn, nav a, .brand, .product, .swatches a');
      if (t && t !== lastHover) sfx('hover');
      lastHover = t;
    });
    const sc = cfg.sfx.scroll;
    let lastY = scrollY, acc = 0, lastT = 0;
    addEventListener('scroll', () => {           // scroll sound (quiet during page transitions)
      acc += Math.abs(scrollY - lastY); lastY = scrollY;
      const now = performance.now();
      if (!busy && sc && acc >= sc.everyPx && now - lastT >= sc.minGapMs) { acc = 0; lastT = now; sfx('scroll'); }
    }, { passive: true });
  }
  return { sfx, init };
})();

// ######################## procedural clouds ########################
// Two clouds per row (one from each side) with random width, color, delay and drift. New clouds every time.
function makeClouds() {
  layer.querySelectorAll('.cloud').forEach((c) => c.remove());
  const { rows, colors } = CONFIG.clouds, h = 100 / rows, list = [];
  for (let r = 0; r < rows; r++) {
    for (const dir of [-1, 1]) {                 // -1 = left cloud, 1 = right cloud
      const el = document.createElement('div');
      el.className = 'cloud';
      el.style.top = r * h - 3 + 'vh';
      el.style.height = h + 6 + 'vh';
      el.style.width = rand(66, 84) + 'vw';
      el.style[dir < 0 ? 'left' : 'right'] = rand(-8, -2) + 'vw';
      el.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
      layer.prepend(el);
      list.push({ el, dir, delay: rand(0, 280), dy: rand(-5, 5) });
    }
  }
  return list;
}
// 'in' = clouds meet in the middle and cover the screen, 'out' = they part and reveal it
function sweep(list, to, ms = CONFIG.clouds.ms) {
  const away = (c) => `translate(${c.dir * 125}vw, ${c.dy}vh)`, home = 'translate(0, 0)';
  return Promise.all(list.map((c) => c.el.animate(
    [{ transform: to === 'in' ? away(c) : home }, { transform: to === 'in' ? home : away(c) }],
    { duration: ms, delay: c.delay, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'both' }
  ).finished));
}
async function cover() { const list = makeClouds(); layer.className = 'on'; AUDIO.sfx('transitionIn'); await sweep(list, 'in'); return list; }
async function part(list, sound = 'transitionOut') { AUDIO.sfx(sound); await sweep(list, 'out'); list.forEach((c) => c.el.remove()); layer.className = ''; }

// ######################## pages + transition ########################
let current = null, busy = false, queued = null;
function showPage(name) {
  if (!PAGES.includes(name)) name = 'home';
  PAGES.forEach((p) => { $('#page-' + p).hidden = p !== name; });
  document.querySelectorAll('nav a').forEach((a) => (a.dataset.page === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.body.dataset.page = name;
  current = name;
  window.scrollTo(0, 0);
}
async function navigate(name) {
  if (!PAGES.includes(name)) name = 'home';
  if (busy) { queued = name; return; }
  if (name === current) return;
  if (reduceMotion) { showPage(name); return; }
  busy = true;
  const list = await cover();                    // clouds sweep in...
  showPage(name);                                // ...page swaps while hidden...
  await sleep(150);
  await part(list);                              // ...clouds part
  busy = false;
  if (queued) { const q = queued; queued = null; navigate(q); }
}
async function intro() {
  showPage(location.hash.slice(1));
  if (!CONFIG.intro.enabled || reduceMotion) { layer.className = ''; return; }
  const list = makeClouds();
  list.forEach((c) => { c.el.style.transform = 'none'; });   // start fully covered
  layer.className = 'on';
  $('.mark').classList.add('show');
  await sleep(CONFIG.intro.holdMs);
  $('.mark').classList.remove('show');
  await part(list, 'intro');
}

// ######################## rendering ########################
function renderProducts() {
  $('#product-list').innerHTML = PRODUCTS.map((p) => `
    <article class="product" id="${p.id}">
      <div class="photo" style="--c:${p.color}"><span>PHOTO</span>${p.image ? `<img src="${p.image}" alt="${p.name} blanket" loading="lazy" onerror="this.remove()">` : ''}</div>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="buy"><span class="price">${CONFIG.currency}${p.price}</span><a class="btn" href="#order">Order</a></div>
    </article>`).join('');
  $('#swatches').innerHTML = PRODUCTS.map((p) => `<li><a href="#products" style="--c:${p.color}" title="${p.name}" aria-label="${p.name}"></a></li>`).join('');
  $('#price-note').textContent = CONFIG.currency + CONFIG.price;
}

function start() {
  document.title = CONFIG.brand.name;
  document.querySelectorAll('[data-brand]').forEach((el) => { el.textContent = CONFIG.brand.name; });
  document.querySelectorAll('[data-email]').forEach((el) => { el.textContent = CONFIG.email; el.href = 'mailto:' + CONFIG.email; });
  $('#order-form').src = CONFIG.orderFormUrl;
  $('#order-form-link').href = CONFIG.orderFormUrl.replace('?embedded=true', '');
  $('#member-list').innerHTML = MEMBERS.map((m) => `<li>${m}</li>`).join('');
  renderProducts();
  AUDIO.init();
  window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
  intro();
}
start();