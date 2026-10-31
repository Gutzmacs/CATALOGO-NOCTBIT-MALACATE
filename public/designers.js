'use strict';
(() => {
  const root = document.documentElement;
  const cards = [...document.querySelectorAll('.product[data-owner]')];
  const controls = [...document.querySelectorAll('[data-designer]')];
  const status = document.querySelector('#designer-status');
  const grid = document.querySelector('#designer-gallery');
  const colors = { all: '#0b0b18', seb: '#110d23', nai: '#24130f' };
  function chooseDesigner(owner, remember = true) {
    if (!['all', 'seb', 'nai'].includes(owner)) owner = 'all';
    root.dataset.designer = owner;
    cards.forEach(card => { card.hidden = owner !== 'all' && card.dataset.owner !== owner; });
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.designer === owner)));
    const activeLabel = document.querySelector('#active-collection');
    if (activeLabel) activeLabel.textContent = owner === 'all' ? 'Explorando ambas colecciones' : owner === 'seb' ? 'Colección NOCTBIT · Por Seb' : 'Colección Malacate · Por Nai';
    document.querySelectorAll('.collection-brand small').forEach(label => {
      const selected = label.closest('button').dataset.designer === owner;
      label.textContent = (label.closest('button').dataset.designer === 'seb' ? 'POR SEB' : 'POR NAI') + (selected ? ' · ACTIVA' : ' ↗');
    });
    const count = cards.filter(card => !card.hidden).length;
    status.textContent = `${count} diseños · ${owner === 'all' ? 'NOCTBIT + Malacate' : owner === 'seb' ? 'NOCTBIT · Seb' : 'Malacate · Nai'}`;
    document.querySelector('meta[name="theme-color"]').content = colors[owner];
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && grid.animate) {
      grid.animate([{ opacity: .35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
    }
    document.dispatchEvent(new CustomEvent('catalog:designer', {detail: {owner}}));
    if (remember) { try { localStorage.setItem('sebnai-designer', owner); } catch {} }
  }
  controls.forEach(button => button.addEventListener('click', () => chooseDesigner(button.dataset.designer)));
  let saved = 'all';
  try { saved = localStorage.getItem('sebnai-designer') || 'all'; } catch {}
  chooseDesigner(saved, false);
})();
