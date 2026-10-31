'use strict';
(() => {
  const root = document.querySelector('[data-showcase]');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-featured-slide]')];
  const dots = [...root.querySelectorAll('[data-featured-index]')];
  const controls = root.querySelector('.featured-controls');
  const stage = root.querySelector('.featured-stage');
  const count = root.querySelector('.featured-count');
  const previous = root.querySelector('[data-featured-prev]');
  const next = root.querySelector('[data-featured-next]');
  const toggle = root.querySelector('[data-featured-toggle]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let available = slides, active = 0, timer = 0, visible = false;
  let paused = motion.matches, hovering = false, focused = false;
  let pointerStart = null, suppressClickUntil = 0;

  function stop() { clearTimeout(timer); timer = 0; root.dataset.playing = 'false'; }
  function schedule() {
    stop();
    if (paused || hovering || focused || !visible || document.hidden || available.length < 2) return;
    root.dataset.playing = 'true';
    timer = setTimeout(() => show(active + 1), 7000);
  }
  function updateToggle() {
    toggle.disabled = available.length < 2;
    const label = available.length < 2 ? 'Vista fija' : paused ? 'Reproducir' : 'Pausar';
    toggle.firstChild.textContent = label + ' ';
    toggle.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
    toggle.setAttribute('aria-label', available.length < 2 ? 'Un diseño destacado en esta colección' : paused ? 'Reproducir presentación' : 'Pausar presentación');
  }
  function show(index, manual = false) {
    active = (index + available.length) % available.length;
    const current = available[active];
    if (available.length > 1) available[(active + 1) % available.length].querySelector('img').loading = 'eager';
    stage.setAttribute('aria-live', manual || paused ? 'polite' : 'off');
    slides.forEach(slide => { slide.hidden = slide !== current; });
    available.forEach((slide, i) => { slide.setAttribute('aria-label', `${i + 1} de ${available.length}: ${slide.querySelector('h2').textContent}`); });
    dots.forEach((dot, index) => {
      dot.hidden = !available.includes(slides[index]);
      dot.setAttribute('aria-pressed', String(slides[index] === current));
    });
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(available.length).padStart(2, '0')}`;
    previous.disabled = next.disabled = available.length < 2;
    updateToggle();
    schedule();
  }
  function filter(owner) {
    available = slides.filter(slide => owner === 'all' || slide.dataset.owner === owner);
    if (!available.length) available = slides;
    show(0);
  }
  previous.addEventListener('click', () => show(active - 1, true));
  next.addEventListener('click', () => show(active + 1, true));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(available.indexOf(slides[i]), true)));
  toggle.addEventListener('click', () => { paused = !paused; if (!paused) { focused = false; hovering = false; } stage.setAttribute('aria-live', paused ? 'polite' : 'off'); updateToggle(); schedule(); });
  root.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(active + (event.key === 'ArrowRight' ? 1 : -1), true);
  });
  root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; schedule(); } });
  root.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', event => { focused = root.contains(event.relatedTarget); schedule(); });
  root.addEventListener('pointerdown', event => { if (event.pointerType === 'touch' && !event.target.closest('.featured-controls')) pointerStart = {x:event.clientX, y:event.clientY}; });
  root.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClickUntil = performance.now() + 400;
    show(active + (dx < 0 ? 1 : -1), true);
  });
  root.addEventListener('pointercancel', () => { pointerStart = null; });
  root.addEventListener('click', event => { if (performance.now() < suppressClickUntil) { suppressClickUntil = 0; event.preventDefault(); event.stopPropagation(); } }, true);
  document.addEventListener('catalog:designer', event => filter(event.detail.owner));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { if (motion.matches) paused = true; updateToggle(); schedule(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', schedule);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold:.2}).observe(root);
  else visible = true;
  controls.hidden = false;
  filter(document.documentElement.dataset.designer || 'all');
})();
