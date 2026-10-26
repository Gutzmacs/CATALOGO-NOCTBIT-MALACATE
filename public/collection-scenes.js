'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const soundButton = document.querySelector('#collection-sound');
  const layer = document.createElement('div');
  layer.className = 'collection-scene';
  layer.setAttribute('aria-hidden', 'true');
  layer.hidden = true;
  document.body.append(layer);
  const tracks = {};
  const durations = { seb: 2800, nai: 4200 };
  const sources = { seb: 'assets/seb-video-original.m4a', nai: 'assets/nai-red-ink-short-audio.m4a' };
  let muted = false, generation = 0, timer = 0, activeTrack = null, activeVideo = null;
  try { muted = localStorage.getItem('sebnai-muted') === 'true'; } catch {}
  function updateButton() {
    soundButton.textContent = muted ? '♪ Sonido apagado' : '♪ Sonido activado';
    soundButton.setAttribute('aria-pressed', String(!muted));
    soundButton.setAttribute('aria-label', muted ? 'Activar sonido de las colecciones' : 'Silenciar sonido de las colecciones');
  }
  function stopSound() {
    generation++;
    Object.values(tracks).forEach(track => { track.pause(); track.currentTime = 0; });
    activeTrack = null;
    if (activeVideo) activeVideo.muted = true;
  }
  function stopScene() {
    clearTimeout(timer);
    if (activeVideo) { activeVideo.pause(); activeVideo.currentTime = 0; activeVideo = null; }
    layer.hidden = true;
    layer.replaceChildren();
    stopSound();
  }
  async function playPhrase(owner) {
    if (muted || document.hidden || !sources[owner]) return;
    const ticket = generation;
    try {
      if (!tracks[owner]) {
        tracks[owner] = new Audio(sources[owner]);
        tracks[owner].preload = 'none';
        tracks[owner].volume = owner === 'seb' ? .85 : .55;
      }
      const track = tracks[owner];
      activeTrack = track;
      track.currentTime = 0;
      await track.play();
      if (ticket !== generation && activeTrack !== track) track.pause();
    } catch { /* Silent visual fallback if a browser blocks audio. */ }
  }
  function setMuted(value) {
    muted = Boolean(value);
    try { localStorage.setItem('sebnai-muted', String(muted)); } catch {}
    updateButton(); stopSound();
  }
  soundButton.addEventListener('click', () => {
    setMuted(!muted);
    if (!muted) {
      if (activeVideo) activeVideo.muted = false;
      else playPhrase(document.documentElement.dataset.designer);
    }
  });
  updateButton();

  // Five notched petals with alternating opaque white and blush fills.
  const petalPath = 'M50 51C35 43 27 28 34 17Q39 10 46 15L50 20L54 15Q61 10 66 17C73 28 65 43 50 51Z';
  const flower = `<svg viewBox="0 0 100 100" fill="none" stroke="#db829e" stroke-width="1.3">${[0,72,144,216,288].map(angle => `<path d="${petalPath}" fill="var(--petal-fill,#fff6fa)" transform="rotate(${angle} 50 51)"/>`).join('')}<circle cx="50" cy="51" r="7" fill="#efafc3"/><g stroke="#fff7dc" stroke-width="2"><path d="M50 47V40M54 50L60 47M53 55L57 60M46 54L42 59M45 50L39 47"/></g><circle cx="50" cy="51" r="2" fill="#c56888"/></svg>`;
  const cat = '<svg viewBox="0 0 180 260" fill="none" stroke="#b96780" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M119 214Q165 241 165 202Q165 180 150 181" stroke="#f5c9d7" stroke-width="12"/><path d="M54 111Q32 142 40 211Q41 238 60 242H118Q140 236 138 210L131 139Q128 120 119 111Z" fill="#fff7ef"/><path d="M45 61L37 12Q36 8 42 12L69 34Q88 27 108 34L134 12Q141 7 140 16L135 64Q146 78 140 99Q132 123 91 126Q49 125 37 104Q26 84 45 61Z" fill="#fffaf4"/><path d="M46 25L51 52L65 40ZM130 25L113 40L129 52Z" fill="#edacc0" stroke="none"/><path d="M52 79Q62 67 73 79M108 79Q119 67 130 79M85 88L96 88L91 95Z"/><path d="M91 95Q81 108 74 96M91 95Q101 108 108 96M42 88L62 92M39 101L62 98M119 92L141 88M120 98L145 102"/><ellipse cx="56" cy="100" rx="8" ry="4" fill="#f5ccd4" stroke="none"/><ellipse cx="126" cy="100" rx="8" ry="4" fill="#f5ccd4" stroke="none"/><path d="M52 124Q89 140 128 125" stroke="#ce526f" stroke-width="7"/><circle cx="91" cy="139" r="10" fill="#e6c27b" stroke="#ae8552"/><path d="M91 136V143M45 171Q16 170 19 147Q21 131 32 139L52 154M56 228Q67 217 79 231M103 231Q116 218 127 229M76 167Q91 155 107 167L110 204Q91 219 73 204Z"/><path d="M83 185H101M91 176V196" stroke="#ca9474"/><g class="waving-paw"><path d="M125 148Q143 129 141 108L143 82Q143 66 156 67Q171 68 170 85L168 122Q168 151 139 165" fill="#fffaf4"/><path d="M149 76V87M158 76V87M166 79V89"/></g></svg>';

  function addFlowers(count, landscapePetals = false) {
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = landscapePetals ? 'scene-landscape-petal' : 'scene-flower';
      petal.style.cssText = `--x:${(i*29+7)%100}%;--size:${landscapePetals ? 7+i%4*3 : 23+i%4*12}px;--delay:${(i%5)*.09}s;--drift:${(i%2?1:-1)*(30+i*5)}px;--turn:${i%2?170:-150}deg;--petal-fill:${i%3 ? '#fff7fa' : '#f3b3ca'}`;
      petal.innerHTML = landscapePetals ? '<i></i>' : flower;
      layer.append(petal);
    }
  }
  function startSeb() {
    layer.innerHTML = '<div class="scene-landscape"><img src="assets/seb-moon-landscape.webp" alt="" width="1672" height="941" decoding="async"></div><div class="scene-foliage"></div><div class="scene-moonlight"></div><div class="scene-mist mist-back"></div><div class="scene-mist mist-front"></div><div class="scene-caption"><span>COLECCIÓN</span><strong>NOCTBIT</strong><small>El camino bajo la luna</small></div>';
    addFlowers(18, true);
  }
  function startNai() {
    const video = document.createElement('video');
    activeVideo = video;
    video.className = 'scene-nai-video';
    video.src = 'assets/nai-red-ink-short.mp4';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'none';
    video.muted = muted;
    video.volume = .85;
    video.addEventListener('playing', () => {
      if (activeVideo !== video) return;
      clearTimeout(timer);
      layer.classList.add('video-playing');
      timer = setTimeout(stopScene, durations.nai);
    });
    video.addEventListener('ended', () => { if (activeVideo === video) stopScene(); });
    video.addEventListener('error', () => { if (activeVideo === video) stopScene(); });
    layer.append(video);
    // Keep video and its original soundtrack on the same playback clock.
    video.play().catch(() => {
      if (activeVideo !== video) return;
      video.muted = true;
      video.play().catch(() => { if (activeVideo === video) stopScene(); });
    });
  }
  window.CollectionScenes = {
    stop: stopScene,
    isMuted: () => muted,
    setMuted,
    play(owner) {
      stopScene();
      if (!durations[owner] || document.hidden) return;
      if (reduced.matches) { playPhrase(owner); return; }
      layer.getBoundingClientRect();
      layer.dataset.scene = owner;
      layer.style.setProperty('--scene-duration', durations[owner] + 'ms');
      layer.hidden = false;
      layer.classList.remove('video-playing');
      if (owner === 'seb') { startSeb(); playPhrase(owner); }
      else startNai();
      timer = setTimeout(stopScene, owner === 'nai' ? 15000 : durations[owner]);
    }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopScene(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') stopScene(); });
  reduced.addEventListener('change', () => { if (reduced.matches) stopScene(); });
  window.addEventListener('pagehide', stopScene);
})();
