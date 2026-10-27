'use strict';
const PRICES={"ninja":{"CH":380,"M":380,"G":400,"XL":420,"2XL":440,"3XL":450},"japones":{"CH":380,"M":380,"G":400,"XL":420,"2XL":440,"3XL":450},"espadas":{"CH":500,"M":500,"G":520,"XL":540,"2XL":560,"3XL":570},"juggernaut":{"CH":380,"M":380,"G":400,"XL":420,"2XL":440,"3XL":450},"muertos":{"CH":350,"M":350,"G":350,"XL":380,"2XL":380,"3XL":380}};
const MODELS={"ninja":{"name":"Ninja","finish":"Acabado incluido: solo DTF.","images":[["ninja-lookbook-hd.webp","Frente, espalda y detalles"],["ninja-back-hd.webp","Vista trasera"],["ninja-close-hd.webp","Frente y acercamiento"]]},"japones":{"name":"Japonés Rojo","finish":"Acabado incluido: solo DTF.","images":[["japones-front-hd.webp","Vista frontal"],["japones-back-hd.webp","Vista trasera"],["japones-detalle-manga.webp","Detalle de manga"],["japones-detalle-frente.webp","Detalle frontal"],["japones-detalle-espalda.webp","Detalle trasero"]]},"espadas":{"name":"Espadas","finish":"Bordados de pecho y manga incluidos.","images":[["espadas-lookbook-original.webp","Frente, espalda y detalles"],["espadas-back-original.webp","Vista trasera"],["espadas-detalle-emblema.webp","Emblema del pecho"],["espadas-detalle-parche.webp","Parche de manga"]]},"juggernaut":{"name":"Juggernaut","finish":"Acabado incluido: solo DTF.","images":[["camiseta-negra-con-estampado-comic.webp","Vista frontal · oversize unisex"],["camiseta-oversized-negra-con-estampado-comic.webp","Vista frontal · oversize de mujer"],["seb-juggernaut-original.webp","Referencia anterior del diseño"]]},"muertos":{"name":"Hora de pan de muerto","finish":"Acabado incluido: solo DTF.","images":[["nai-dia-de-muertos-original.webp","Imagen completa"]]},"marco-de-angeles":{"name":"Marco de Ángeles","finish":"Bordado en el pecho y detalle de manga; marco de ángeles en la espalda.","images":[["marco-de-angeles-espalda.webp","Vista trasera · marco de ángeles"],["marco-de-angeles-frente.webp","Vista frontal · emblema y manga"],["marco-de-angeles-detalles.webp","Espalda y acercamientos del diseño"],["marco-de-angeles-bordado.webp","Detalle del bordado del pecho"]]}};
const form=document.querySelector('#config-form');
const total=document.querySelector('#total');
const gallery=document.querySelector('#gallery');
const status=document.querySelector('#copy-status');
let activeModel='ninja';
function getSelection(){const data=new FormData(form);const size=data.get('size');const design=data.get('design');return{quantity:Number(data.get('quantity')||1),model:MODELS[design].name,size,finish:MODELS[design].finish,price:PRICES[design]?.[size]??null};}
function updatePrice(){
 const selection=getSelection();
 const pending=selection.price===null;
 const add=form.querySelector('[data-add-order]');
 add.disabled=pending;add.textContent=pending?'Consulta el precio antes de agregar':'Agregar a mi pedido ↗';
 document.querySelector('#finish-description').textContent=pending?'Consulta el precio y la disponibilidad de este diseño en tu talla.':selection.model+' · Talla '+selection.size+' · $'+selection.price+' MXN.';
 document.querySelector('#embroidery-hint').hidden=false;
 document.querySelector('#embroidery-hint').textContent=selection.finish;
 total.classList.toggle('price-on-request',pending);
 total.replaceChildren(document.createTextNode(pending?'Consultar precio':'$'+selection.price+' '));
 if(!pending){const unit=document.createElement('small');unit.textContent='MXN';total.append(unit);}
 status.textContent='';document.querySelector('#copy-fallback').hidden=true;
}
form.addEventListener('change',updatePrice);
form.addEventListener('submit',event=>event.preventDefault());
function openGallery(key,initialIndex=0){activeModel=key;const model=MODELS[key];document.querySelector('#gallery-title').textContent=model.name;const content=document.querySelector('#gallery-content');content.classList.remove('gallery-zoom');document.querySelector('#gallery-zoom')?.remove();content.replaceChildren();document.querySelector('#gallery-tabs')?.remove();const tabs=document.createElement('div');tabs.id='gallery-tabs';tabs.className='gallery-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Vistas de '+model.name);model.images.forEach(([file,caption],index)=>{const tab=document.createElement('button');tab.textContent=caption;tab.setAttribute('aria-pressed',index===initialIndex?'true':'false');tab.addEventListener('click',()=>{content.classList.remove('gallery-zoom');document.querySelector('#gallery-zoom')?.setAttribute('aria-pressed','false');content.querySelectorAll('figure').forEach((figure,j)=>figure.hidden=j!==index);tabs.querySelectorAll('button').forEach((button,j)=>button.setAttribute('aria-pressed',j===index?'true':'false'));});tabs.append(tab);});content.before(tabs);for(const[file,caption]of model.images){const figure=document.createElement('figure');const img=document.createElement('img');img.src='assets/'+file;img.alt=caption+' de '+model.name;const label=document.createElement('figcaption');label.textContent=caption;figure.append(img,label);figure.hidden=content.children.length!==initialIndex;content.append(figure);}const zoom=document.createElement('button');zoom.id='gallery-zoom';zoom.className='zoom-detail-button';zoom.textContent='Ampliar / ajustar detalle';zoom.setAttribute('aria-pressed','false');zoom.addEventListener('click',()=>{const on=content.classList.toggle('gallery-zoom');zoom.setAttribute('aria-pressed',String(on));});content.before(zoom);gallery.showModal();document.body.classList.add('modal-open');window.NinjaAmbience?.open(key);}
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>openGallery(button.dataset.gallery,Number(button.dataset.view||0))));
document.querySelector('#close-gallery').addEventListener('click',()=>gallery.close());
gallery.addEventListener('close',()=>document.body.classList.remove('modal-open'));
gallery.addEventListener('click',event=>{const rect=gallery.getBoundingClientRect();if(event.target===gallery&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))gallery.close();});
document.querySelector('#choose-design').addEventListener('click',()=>{form.elements.design.value=activeModel;updatePrice();gallery.close();document.querySelector('#elige').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});form.elements.design.focus({preventScroll:true});});
document.querySelector('#copy').addEventListener('click',async()=>{const quantity=form.querySelector('[name="quantity"]');if(quantity&&!quantity.reportValidity())return;const s=getSelection();const message=`Hola, me interesa una playera de NOCTBIT × Malacate.\nDiseño: ${s.model}\nTalla: ${s.size}\nCantidad: ${s.quantity}\nAcabado: ${s.finish}\n${s.price===null?'Precio: por consultar.':'Precio del catálogo: $'+s.price+' MXN por playera.'}\n¿Me confirmas disponibilidad y cómo hacer mi pedido?`;try{await navigator.clipboard.writeText(message);status.textContent='Selección copiada. Pégala en tu mensaje.';}catch{const fallback=document.querySelector('#copy-fallback');fallback.value=message;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Copia este texto para compartir tu elección.';}});
// Carry the chosen product and size from its individual sheet.
const requested=new URLSearchParams(location.search);
if(MODELS[requested.get('design')]) form.elements.design.value=requested.get('design');
const requestedSize=[...form.querySelectorAll('[name="size"]')].find(input=>input.value===requested.get('size'));
if(requestedSize) requestedSize.checked=true;
updatePrice();

// Pixel animation and mouse-play engine. All overlays ignore pointer events.
(() => {
  const DURATIONS = { jump: 700, slash: 430, throw: 560, roll: 600, dash: 350, celebrate: 900 };
  function createActor(x, y) {
    return { x, y, tx: x, ty: y, dir: 1, last: 0, moved: 0, action: null, queue: [], stars: [], ghosts: [], lastGhost: 0, count: 0 };
  }
  function queueAction(actor, type, now, target, reduced = false) {
    if (reduced) return;
    if (type === 'roll') actor.queue.length = 0;
    actor.queue.push({ type, at: now + 110 + (actor.count++ % 3) * 40, target });
    if (actor.queue.length > 4) actor.queue.shift();
  }
  function updateActor(actor, now, reduced = false) {
    const dt = Math.min(50, actor.last ? now - actor.last : 16);
    actor.last = now;
    const dx = actor.tx - actor.x, dy = actor.ty - actor.y;
    const distance = Math.hypot(dx, dy);
    if (Math.abs(dx) > 1.5) actor.dir = dx < 0 ? -1 : 1;
    const easing = reduced ? 1 : 1 - Math.pow(actor.action?.type === 'dash' ? .55 : .82, dt / 16);
    actor.x += dx * easing; actor.y += dy * easing;
    if (distance > 1) actor.moved = now;
    if (actor.action && now - actor.action.start >= actor.action.duration) actor.action = null;
    if (!actor.action && actor.queue.length && now >= actor.queue[0].at) {
      const next = actor.queue.shift();
      actor.action = { ...next, start: now, duration: DURATIONS[next.type], emitted: false };
    }
    if (reduced) { actor.action = null; actor.queue.length = 0; actor.stars.length = 0; actor.ghosts.length = 0; }
    const action = actor.action;
    const progress = action ? Math.min(1, (now - action.start) / action.duration) : 0;
    if (action?.type === 'throw' && progress > .3 && !action.emitted) {
      action.emitted = true;
      const sx = actor.x + actor.dir * 24, sy = actor.y - 54;
      const target = action.target || { x: sx + actor.dir * 100, y: sy - 50 };
      const length = Math.max(1, Math.hypot(target.x - sx, target.y - sy));
      actor.stars.push({ x: sx, y: sy, vx: (target.x - sx) / length * .42, vy: (target.y - sy) / length * .42, born: now });
    }
    actor.stars = actor.stars.filter(star => now - star.born < 700);
    actor.stars.forEach(star => { star.x += star.vx * dt; star.y += star.vy * dt; });
    if (!reduced && (distance > 35 || ['roll', 'dash'].includes(action?.type)) && now - actor.lastGhost > 65) {
      actor.ghosts.push({ x: actor.x, y: actor.y, dir: actor.dir, born: now }); actor.lastGhost = now;
    }
    actor.ghosts = actor.ghosts.filter(ghost => now - ghost.born < 240).slice(-5);
    return { mode: action?.type || (now - actor.moved < 140 ? 'run' : 'idle'), progress };
  }
  function drawSprite(ctx, x, y, dir, mode, progress, time, alpha = 1, reduced = false) {
    const ink = '#0c1424', dark = '#293a55', light = '#6d839f', red = '#c92e49', bright = '#ff6776', gold = '#e9c17a';
    const running = !reduced && ['run', 'dash'].includes(mode);
    const step = running ? [0, 3, 5, 2, -3, -5][Math.floor(time / 80) % 6] : 0;
    let lift = 0;
    if (!reduced && mode === 'jump') lift = -Math.sin(progress * Math.PI) * 53;
    if (!reduced && mode === 'roll') lift = -Math.sin(progress * Math.PI) * 15;
    if (!reduced && mode === 'celebrate') lift = -Math.abs(Math.sin(progress * Math.PI * 3)) * 22;
    lift = Math.max(lift, Math.min(0, 96 - y));
    const bob = reduced ? 0 : running ? Math.abs(step) * -.5 : Math.round(Math.sin(time / 430));
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = '#0005'; ctx.fillRect(Math.round(x - 20), Math.round(y + 2), 40, 4);
    ctx.translate(Math.round(x), Math.round(y + lift + bob));
    if (!reduced && mode === 'roll') { ctx.translate(0, -40); ctx.rotate(progress * Math.PI * 2 * dir); ctx.translate(0, 40); }
    if (!reduced && mode === 'slash') ctx.rotate(Math.sin(progress * Math.PI) * .15 * dir);
    ctx.scale(dir * 2, 2); ctx.translate(-16, -46);
    function p(px, py, w, h, color) { ctx.fillStyle = color; ctx.fillRect(px, py, w, h); }
    // Articulated, integer-pixel limbs keep the taller silhouette crisp in every pose.
    function segment(x1, y1, x2, y2, width, color) {
      const length = Math.max(Math.abs(x2-x1), Math.abs(y2-y1), 1);
      for (let n = 0; n <= length; n++) p(Math.round(x1+(x2-x1)*n/length), Math.round(y1+(y2-y1)*n/length), width, width, color);
    }
    const flutter = reduced ? 0 : Math.floor(time / 110) % 3 - 1;
    segment(8, 3, 11, 30, 3, ink); segment(9, 3, 12, 29, 1, light); p(7, 9, 7, 2, gold);
    p(4, 12, 10, 3, red); p(-2, 14+flutter, 9, 3, red); p(-6, 16+flutter, 7, 2, bright);
    p(12, 0, 8, 2, ink); p(10, 2, 12, 9, ink); p(12, 2, 8, 3, dark); p(11, 5, 11, 2, red); p(12, 5, 6, 1, bright);
    p(13, 7, 9, 2, '#c49475');
    if (reduced || time % 3400 < 3230) { p(15, 7, 2, 1, '#fff4d2'); p(20, 7, 2, 1, '#fff4d2'); }
    p(12, 9, 10, 4, ink); p(13, 10, 7, 2, dark); p(11, 12, 11, 3, red); p(12, 12, 8, 1, bright);
    // Narrow waist, longer torso and separated thigh / shin / boot shapes.
    p(10, 15, 13, 11, ink); p(12, 15, 9, 9, dark); p(12, 16, 2, 6, light);
    segment(20, 15, 13, 25, 2, '#525c74'); p(15, 19, 3, 3, gold);
    p(11, 26, 12, 3, red); p(16, 26, 3, 2, gold); p(19, 29, 3, 7, red);
    for (let leg=0; leg<2; leg++) {
      const swing = leg ? step : -step, hip = leg ? 18 : 12;
      const tuck = mode === 'jump' || mode === 'roll' ? (leg ? 7 : 4) : 0;
      const kneeX = hip + Math.round(swing*.7), kneeY = 35 - (swing>0 ? 3 : 0) - tuck;
      const footX = hip + swing, footY = 43 - (swing>0 ? 4 : 0) - tuck;
      segment(hip, 29, kneeX, kneeY, 4, ink); segment(hip+1, 29, kneeX+1, kneeY, 2, dark);
      p(kneeX, kneeY, 4, 3, leg ? light : '#4b5e7a');
      segment(kneeX, kneeY+2, footX, footY, 3, ink); segment(kneeX+1, kneeY+3, footX+1, footY, 1, light);
      p(footX, footY-1, 4, 2, gold); p(footX-1, footY+1, 7, 2, dark); p(footX-1, footY+3, 8, 1, ink);
    }
    let left = [7, 21, 9, 27], right = [25, 21, 24, 27];
    if (running) { left=[8-step,20,7-step,24]; right=[24+step,19,25+step,23]; }
    if (['jump','celebrate'].includes(mode)) { left=[7,12,8,6];right=[26,11,26,5]; }
    if (mode==='slash') { const sweep=Math.round(Math.sin(progress*Math.PI)*7);right=[25,17,30,12+sweep]; }
    if (mode==='throw') right=[26,17,32,16];
    [[11,16,left],[21,16,right]].forEach(([sx,sy,[ex,ey,hx,hy]])=>{
      segment(sx,sy,ex,ey,4,ink);segment(sx+1,sy,ex+1,ey,2,dark);
      segment(ex,ey,hx,hy,3,dark);p(hx,hy,3,2,gold);p(hx,hy+2,3,2,'#c49475');
    });
    if (mode === 'slash' && progress > .15 && progress < .85) {
      const phase = Math.floor(progress * 6);
      segment(31,14,40,4+phase,2,'#fff0bd'); p(29,15,6,2,gold);
      for (let i=0;i<8;i++) p(33+i,5+phase+i*2,2,3,i<4?'#fff0bd':bright);
    }
    ctx.restore();
  }
  function renderActor(ctx, actor, now, reduced = false) {
    const pose = updateActor(actor, now, reduced);
    actor.ghosts.forEach(ghost => drawSprite(ctx, ghost.x, ghost.y, ghost.dir, 'run', 0, now, .22 * (1 - (now - ghost.born) / 240), reduced));
    drawSprite(ctx, actor.x, actor.y, actor.dir, pose.mode, pose.progress, now, 1, reduced);
    actor.stars.forEach(star => {
      ctx.save(); ctx.translate(Math.round(star.x), Math.round(star.y)); ctx.rotate(now / 55); ctx.fillStyle = '#ffe1a4';
      ctx.fillRect(-8, -2, 16, 4); ctx.fillRect(-2, -8, 4, 16); ctx.fillStyle = '#151222'; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    });
  }
  window.SenaiDrawSprite = drawSprite;
  const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const overlay = document.createElement('canvas'); overlay.id = 'senai-pixel-cursor'; overlay.hidden = true; overlay.setAttribute('aria-hidden', 'true');
  const ctx = overlay.getContext('2d');
  if (!ctx) return;
  document.body.append(overlay);
  const actor = createActor(0, 0);
  let visible = false, frameId = 0, lastPaint = 0, pointerX = 0, pointerY = 0, initialized = false, clickIndex = 0, hot = false, lastDash = -1000;
  function resize() { overlay.width = window.innerWidth; overlay.height = window.innerHeight; ctx.imageSmoothingEnabled = false; }
  resize(); window.addEventListener('resize', resize);
  function paint(now) {
    frameId = 0;
    if (!visible) return;
    if (now - lastPaint >= 30 || reducedMotion.matches) {
      lastPaint = now; ctx.clearRect(0, 0, overlay.width, overlay.height);
      ctx.fillStyle = hot ? '#ffffff' : '#edcf95'; ctx.fillRect(Math.round(pointerX - 2), Math.round(pointerY - 2), 4, 4);
      renderActor(ctx, actor, now, reducedMotion.matches);
    }
    if (!reducedMotion.matches) frameId = requestAnimationFrame(paint);
  }
  function start() { if (!frameId) frameId = requestAnimationFrame(paint); }
  function hide() { visible = false; overlay.hidden = true; root.classList.remove('pixel-cursor-active'); if (frameId) cancelAnimationFrame(frameId); frameId = 0; actor.last = 0; }
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || event.pointerType === 'touch' || document.hidden || event.target.closest?.('input,select,textarea,[contenteditable="true"],#dojo-arena,#castle-game')) { hide(); return; }
    const travel = Math.hypot(event.clientX-pointerX,event.clientY-pointerY);
    pointerX = event.clientX; pointerY = event.clientY;
    if (visible && travel > 100 && performance.now()-lastDash > 1000 && !actor.action) { queueAction(actor,'dash',performance.now(),null,reducedMotion.matches);lastDash=performance.now(); }
    actor.tx = Math.min(window.innerWidth - 48, Math.max(48, pointerX + 36));
    actor.ty = Math.min(window.innerHeight - 12, Math.max(112, pointerY + 75));
    if (!initialized || !visible) { actor.x = actor.tx; actor.y = actor.ty; initialized = true; }
    hot = !!event.target.closest?.('a,button,label,[role="button"]');
    visible = true; overlay.hidden = false; root.classList.add('pixel-cursor-active'); start();
  }, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') { hide(); return; }
    if (visible) queueAction(actor, event.detail >= 2 ? 'roll' : ['jump','slash','throw','slash'][clickIndex++ % 4], performance.now(), { x: event.clientX, y: event.clientY }, reducedMotion.matches);
    start();
  }, { passive: true });
  document.addEventListener('dblclick', event => { if(visible){queueAction(actor,'roll',performance.now(),{x:event.clientX,y:event.clientY},reducedMotion.matches);start();} });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') hide(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  window.addEventListener('blur', hide); finePointer.addEventListener('change', hide);
  reducedMotion.addEventListener('change', () => { if (visible) start(); });
  const productDialog = document.querySelector('#gallery');
  if (productDialog) new MutationObserver(() => { (productDialog.open ? productDialog : document.body).append(overlay); if (visible) start(); }).observe(productDialog, { attributes: true, attributeFilter: ['open'] });

  // A compact training arena works with mouse, touch and ordinary keyboard buttons.
  const arena = document.querySelector('#dojo-arena');
  if (!arena || getComputedStyle(arena.closest('.dojo')).display === 'none') return;
  const canvas = document.querySelector('#dojo-canvas'), ac = canvas.getContext('2d');
  if (!ac) return;
  const trainee = createActor(80, 205), seals = [...arena.querySelectorAll('.dojo-seal')];
  const feedback = document.querySelector('#dojo-feedback');
  let points = 0, combo = 1, lastHit = -10000, gameFrame = 0, inView = true, arenaPaint = 0;
  const timers = new Set();
  function resizeArena() { canvas.width = arena.clientWidth; canvas.height = arena.clientHeight; trainee.tx = Math.min(trainee.tx, canvas.width - 30); trainee.ty = Math.min(trainee.ty, canvas.height - 18); }
  resizeArena(); new ResizeObserver(resizeArena).observe(arena);
  function gameTick(now) {
    gameFrame = 0;
    if (!inView || document.hidden) return;
    if (now - arenaPaint >= 30 || reducedMotion.matches) { arenaPaint = now; ac.clearRect(0,0,canvas.width,canvas.height); renderActor(ac,trainee,now,reducedMotion.matches); }
    if (!reducedMotion.matches) gameFrame = requestAnimationFrame(gameTick);
  }
  function runGame() { if (!gameFrame && inView && !document.hidden) gameFrame = requestAnimationFrame(gameTick); }
  function aim(event) {
    const rect = arena.getBoundingClientRect();
    trainee.tx = Math.max(28, Math.min(canvas.width - 28, event.clientX - rect.left));
    trainee.ty = Math.max(68, Math.min(canvas.height - 18, event.clientY - rect.top + 48)); runGame();
  }
  arena.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') aim(event); }, { passive: true });
  arena.addEventListener('pointerdown', event => { aim(event); if (!event.target.closest('.dojo-seal')) queueAction(trainee,['jump','slash','throw'][trainee.count % 3],performance.now(),{x:trainee.tx,y:trainee.ty-45},reducedMotion.matches);runGame(); }, { passive: true });
  arena.addEventListener('dblclick', event => { aim(event);queueAction(trainee,'roll',performance.now(),null,reducedMotion.matches);runGame(); });
  seals.forEach((seal,index) => seal.addEventListener('click', () => {
    const now = performance.now(), rect = seal.getBoundingClientRect(), bounds = arena.getBoundingClientRect();
    combo = now - lastHit < 1800 ? Math.min(combo + 1,5) : 1; lastHit = now;
    const gained = 10 * combo; points += gained;
    document.querySelector('#dojo-score').textContent = points; document.querySelector('#dojo-combo').textContent = '×' + combo;
    feedback.textContent = combo > 1 ? `¡Combo ×${combo}! +${gained} puntos` : `¡Sello atrapado! +${gained} puntos`;
    trainee.tx = rect.left - bounds.left + rect.width/2; trainee.ty = Math.min(canvas.height-18,rect.top - bounds.top + 60);
    queueAction(trainee,combo>=3?'celebrate':['slash','jump','throw'][index],now,{x:trainee.tx,y:trainee.ty-45},reducedMotion.matches);
    seal.disabled = true; seal.classList.add('caught');
    const timer = setTimeout(() => { timers.delete(timer); seal.style.left=(14+Math.random()*72)+'%';seal.style.top=(22+Math.random()*40)+'%';seal.disabled=false;seal.classList.remove('caught'); }, 420);
    timers.add(timer); runGame();
  }));
  document.querySelector('#dojo-reset').addEventListener('click', () => {
    timers.forEach(clearTimeout);timers.clear();points=0;combo=1;lastHit=-10000;
    document.querySelector('#dojo-score').textContent='0';document.querySelector('#dojo-combo').textContent='×1';feedback.textContent='Nueva partida. Atrapa un sello.';
    arena.addEventListener('dblclick', event => { aim(event);queueAction(trainee,'roll',performance.now(),null,reducedMotion.matches);runGame(); });
  seals.forEach((seal,index)=>{seal.disabled=false;seal.classList.remove('caught');seal.style.left=[24,52,79][index]+'%';seal.style.top=[32,58,28][index]+'%';});
    trainee.queue.length=0;trainee.action=null;trainee.stars.length=0;trainee.ghosts.length=0;runGame();
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView=entries[0].isIntersecting;if(inView){trainee.last=0;runGame();}else if(gameFrame){cancelAnimationFrame(gameFrame);gameFrame=0;} }).observe(arena);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&gameFrame){cancelAnimationFrame(gameFrame);gameFrame=0;}else{trainee.last=0;runGame();}});
  reducedMotion.addEventListener('change',runGame);runGame();
})();
