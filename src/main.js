import '@fontsource-variable/manrope';
import './styles.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
root.classList.add('js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const EASE = 'expo.out';

/* ------------------------------------------------------------------ smooth scroll */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const scrollToHash = (hash) => {
  const target = hash === '#top' ? 0 : $(hash);
  if (target === null) return;
  const offset = hash === '#form' ? -40 : -24;
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
  else (target === 0 ? window : target).scrollIntoView?.({ behavior: 'smooth' }) ?? window.scrollTo({ top: 0 });
};

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href');
  if (hash.length < 2) { e.preventDefault(); return; }
  e.preventDefault();
  closeMenu();
  scrollToHash(hash);
  if (hash === '#form') setTimeout(() => $('#form input')?.focus({ preventScroll: true }), 1300);
});

/* ------------------------------------------------------------------ header */
const header = $('[data-header]');
const burger = $('[data-burger]');
let menuOpen = false;
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  header.classList.remove('menu-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Открыть меню');
  lenis?.start();
}
burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  header.classList.toggle('menu-open', menuOpen);
  burger.setAttribute('aria-expanded', String(menuOpen));
  burger.setAttribute('aria-label', menuOpen ? 'Закрыть меню' : 'Открыть меню');
  menuOpen ? lenis?.stop() : lenis?.start();
});
addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

{
  // Hide on scroll down, reveal on scroll up. Direction is decided on accumulated
  // travel past a threshold, so the tiny steps at the tail of a smooth-scroll
  // ease can't flip the header back and forth.
  const hero = $('[data-hero]');
  const THRESHOLD = 24;
  let heroBottom = hero.offsetHeight - 60;
  let lastY = scrollY;
  let travel = 0;
  let solid = null;
  let hidden = null;
  const set = (cls, on, prev) => {
    if (on !== prev) header.classList.toggle(cls, on);
    return on;
  };
  const update = () => {
    const y = scrollY;
    const dy = y - lastY;
    lastY = y;
    if (dy !== 0) travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;

    let nextHidden = hidden ?? false;
    if (menuOpen || y < heroBottom + 200) nextHidden = false;
    else if (travel > THRESHOLD) nextHidden = true;
    else if (travel < -THRESHOLD) nextHidden = false;

    solid = set('is-solid', y > heroBottom, solid);
    hidden = set('is-hidden', nextHidden, hidden);
  };
  addEventListener('resize', () => { heroBottom = hero.offsetHeight - 60; }, { passive: true });
  lenis ? lenis.on('scroll', update) : addEventListener('scroll', update, { passive: true });
  update();
}

/* nav: a soft pill glides under the hovered link */
{
  const nav = $('.nav');
  const pill = $('.nav__pill');
  let shown = false;
  const move = (link) => {
    // first hover: appear in place instead of sliding in from the left edge
    if (!shown) pill.style.transition = 'opacity 0.3s';
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    pill.style.opacity = '1';
    if (!shown) { pill.offsetWidth; pill.style.transition = ''; }
    shown = true;
  };
  $$('.nav__link', nav).forEach((l) => {
    l.addEventListener('pointerenter', () => move(l));
    l.addEventListener('focus', () => move(l));
  });
  nav.addEventListener('pointerleave', () => { pill.style.opacity = '0'; shown = false; });
}

/* ------------------------------------------------------------------ split headings into lines */
function splitLines(el) {
  // <br> marks an authored break (matches the mockup); words between breaks wrap naturally
  const chunks = el.innerHTML.trim().split(/<br\s*\/?>/i);
  el.innerHTML = chunks
    .map((c, i) => c.trim().split(/\s+/).map((w) => `<span class="w" data-c="${i}">${w}</span>`).join(' '))
    .join('<br>');
  const spans = $$('.w', el);
  const lines = [];
  let top = null;
  let chunk = null;
  spans.forEach((s) => {
    const t = s.offsetTop;
    if (t !== top || s.dataset.c !== chunk) { lines.push([]); top = t; chunk = s.dataset.c; }
    lines[lines.length - 1].push(s.innerHTML);
  });
  el.innerHTML = lines.map((l) => `<span class="split-line"><span>${l.join(' ')}</span></span>`).join('');
  return $$('.split-line > span', el);
}

/* ------------------------------------------------------------------ intro */
function intro() {
  const lines = $$('.hero__title .line__in');
  const items = $$('[data-hero-in]');
  const hand = $('.hero__hand');
  if (reduced) { gsap.set(items, { opacity: 1 }); return; }
  const isMobile = matchMedia('(max-width: 767px)').matches;
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.from('.hero__bg', { opacity: 0, scale: 1.08, duration: 2.2 }, 0)
    .from(hand, { yPercent: 18, xPercent: 6, rotate: 8, opacity: 0, duration: 1.8 }, 0.15)
    .fromTo(items[0], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1 }, 0.3);
  if (!isMobile) tl.from(lines, { yPercent: 110, duration: 1.3, stagger: 0.09 }, 0.35);
  else tl.from(lines, { opacity: 0, y: 18, duration: 1.1, stagger: 0.06 }, 0.35);
  tl.fromTo(items.slice(1), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.75)
    .from('.header__inner > *', { opacity: 0, y: -14, duration: 1, stagger: 0.08, clearProps: 'opacity,transform' }, 0.2);

  // savings tick up to the real value while the line lands
  const num = $('[data-count]');
  const target = +num.dataset.count;
  const fmt = (v) => `${Math.round(v).toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`;
  const o = { v: 0 };
  tl.to(o, { v: target, duration: 1.6, ease: 'power3.out', onUpdate: () => (num.textContent = fmt(o.v)) }, 0.6);
}

/* ------------------------------------------------------------------ scroll reveals */
function reveals() {
  if (reduced) return;

  $$('[data-split]').forEach((h) => {
    const lines = splitLines(h);
    gsap.from(lines, {
      yPercent: 105,
      duration: 1.2,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
    });
  });

  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 22 }, {
      opacity: 1, y: 0, duration: 1.1, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true, onEnter: () => el.classList.add('is-in') },
    });
  });

  $$('[data-stagger]').forEach((list) => {
    const kids = [...list.children];
    gsap.fromTo(kids, { opacity: 0, y: 36, scale: 0.98 }, {
      opacity: 1, y: 0, scale: 1, duration: 1.15, ease: EASE, stagger: 0.09, clearProps: 'transform',
      scrollTrigger: {
        trigger: list, start: 'top 86%', once: true,
        onEnter: () => kids.forEach((k, i) => setTimeout(() => k.classList.add('is-in'), 120 + i * 90)),
      },
    });
  });

  // steps: cards cascade, badges pop in sequence like a progress run
  const stepper = $('[data-stepper]');
  const steps = [...stepper.children];
  gsap.timeline({ scrollTrigger: { trigger: stepper, start: 'top 85%', once: true } })
    .fromTo(steps, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.12, clearProps: 'transform' })
    .from($$('.badge', stepper), { scale: 0, rotate: -30, duration: 0.9, ease: 'back.out(2.2)', stagger: 0.12 }, 0.15);

  // drifting blobs
  $$('[data-parallax]').forEach((b) => {
    const k = parseFloat(b.dataset.parallax);
    gsap.to(b, {
      yPercent: k * 300, ease: 'none',
      scrollTrigger: { trigger: b.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // hero hand eases away as the panel slides under
  gsap.to('.hero__visual', {
    yPercent: 10, rotate: -3, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // spec card: image glides in, callout leaders draw, dots land
  const spec = $('[data-spec]');
  const st = gsap.timeline({
    scrollTrigger: { trigger: spec, start: 'top 78%', once: true, onEnter: () => spec.classList.add('is-in') },
    defaults: { ease: EASE },
  });
  st.fromTo(spec, { clipPath: 'inset(8% 6% 8% 6% round 2.4rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2.4rem)', duration: 1.6, clearProps: 'clipPath' }, 0)
    .from('[data-spec-img]', { xPercent: 10, yPercent: 14, scale: 1.08, opacity: 0, duration: 1.8 }, 0)
    .to('.spec__lines path', { strokeDashoffset: 0, duration: 1.3, stagger: 0.12, ease: 'power3.inOut' }, 0.6)
    .to('.spec__dot', { scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(3)' }, 1.3)
    .from('.spec__item', { opacity: 0, y: 14, duration: 1, stagger: 0.1 }, 0.5);

  gsap.to('[data-spec-img]', {
    yPercent: -6, ease: 'none',
    scrollTrigger: { trigger: spec, start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // form card: scanner terminal swings in over the edge
  gsap.from('[data-apply-img]', {
    xPercent: 14, yPercent: -10, rotate: 6, opacity: 0, duration: 1.8, ease: EASE,
    scrollTrigger: { trigger: '[data-apply]', start: 'top 80%', once: true },
  });
  gsap.to('[data-apply-img]', {
    yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '[data-apply]', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

/* ------------------------------------------------------------------ pointer niceties */
function pointer() {
  if (reduced || !finePointer) return;

  // magnetic CTAs
  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.18}px`);
      btn.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.28}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });

  // hero: the hand answers the cursor with a slight 3D tilt
  const hero = $('[data-hero]');
  const hand = $('.hero__hand');
  const rx = gsap.quickTo(hand, 'rotationX', { duration: 1.2, ease: 'power3.out' });
  const ry = gsap.quickTo(hand, 'rotationY', { duration: 1.2, ease: 'power3.out' });
  const tx = gsap.quickTo(hand, 'x', { duration: 1.4, ease: 'power3.out' });
  hero.addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / hero.offsetHeight - 0.5;
    ry(nx * 10); rx(-ny * 8); tx(nx * 14);
  });
  hero.addEventListener('pointerleave', () => { rx(0); ry(0); tx(0); });

  // spec card: image parallax against the cursor
  const spec = $('[data-spec]');
  const img = $('[data-spec-img]');
  const ix = gsap.quickTo(img, 'x', { duration: 1.4, ease: 'power3.out' });
  const iy = gsap.quickTo(img, 'y', { duration: 1.4, ease: 'power3.out' });
  spec.addEventListener('pointermove', (e) => {
    const r = spec.getBoundingClientRect();
    ix(((e.clientX - r.left) / r.width - 0.5) * -18);
    iy(((e.clientY - r.top) / r.height - 0.5) * -12);
  });
  spec.addEventListener('pointerleave', () => { ix(0); iy(0); });
}

/* ------------------------------------------------------------------ 3D terminal (lazy) */
function terminal() {
  const stage = $('[data-stage]');
  if (!stage) return;
  const io = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    try {
      const { mountTerminal } = await import('./terminal.js');
      await mountTerminal(stage, { reduced, lenis });
    } catch (err) {
      console.warn('[terminal] staying on the poster image:', err);
    }
  }, { rootMargin: '600px 0px' });
  io.observe(stage);
}

/* ------------------------------------------------------------------ form */
function form() {
  const f = $('[data-form]');
  const phone = $('[data-phone]', f);
  const inn = $('[data-inn]', f);
  const status = $('.form__status', f);
  const submit = $('.form__submit', f);

  const formatPhone = (raw) => {
    let d = raw.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    let out = '+7';
    if (p[0]) out += ` ${p[0]}`;
    if (p[1]) out += ` ${p[1]}`;
    if (p[2]) out += `-${p[2]}`;
    if (p[3]) out += `-${p[3]}`;
    return out;
  };
  phone.addEventListener('input', () => { phone.value = phone.value ? formatPhone(phone.value) : ''; });
  phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+7 '; });
  phone.addEventListener('blur', () => { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });
  inn.addEventListener('input', () => { inn.value = inn.value.replace(/\D/g, '').slice(0, 12); });

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Укажите имя'),
    city: (v) => (v.trim().length >= 2 ? '' : 'Укажите город'),
    phone: (v) => (v.replace(/\D/g, '').length === 11 ? '' : 'Нужно 11 цифр'),
    inn: (v) => (/^\d{10}$|^\d{12}$/.test(v) ? '' : 'ИНН — 10 или 12 цифр'),
  };
  const check = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const msg = rule(input.value);
    const field = input.closest('.field');
    field.classList.toggle('is-error', !!msg);
    $('.field__err', field).textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  };
  $$('input', f).forEach((i) => {
    i.addEventListener('blur', () => i.value && check(i));
    i.addEventListener('input', () => i.closest('.is-error') && check(i));
  });
  const pd = $('[name="pd"]', f);
  pd.addEventListener('change', () => pd.closest('.box').classList.remove('is-error'));

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = $$('.field input', f);
    const ok = inputs.map(check).every(Boolean);
    const agreed = pd.checked;
    pd.closest('.box').classList.toggle('is-error', !agreed);
    if (!ok || !agreed) {
      status.textContent = !agreed && ok ? 'Подтвердите согласие на обработку персональных данных' : 'Проверьте отмеченные поля';
      const first = $('.is-error input', f);
      first?.focus();
      if (!reduced) gsap.fromTo(submit, { x: -6 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    submit.disabled = true;
    $('.btn__label', submit).textContent = 'Отправляем…';
    status.textContent = '';
    await new Promise((r) => setTimeout(r, 1100));
    f.classList.add('is-sent');
    $('.btn__label', submit).textContent = 'Заявка отправлена';
    status.textContent = 'Спасибо! Мы свяжемся с вами, чтобы обсудить обмен кассы.';
  });
}

/* ------------------------------------------------------------------ boot */
const boot = () => {
  intro();
  reveals();
  pointer();
  terminal();
  form();
  ScrollTrigger.refresh();
};
document.fonts?.ready ? document.fonts.ready.then(boot) : addEventListener('load', boot);
