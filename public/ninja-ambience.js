'use strict';
(() => {
  const gallery = document.querySelector('#gallery');
  const atmosphere = document.createElement('div');
  atmosphere.className = 'ninja-atmosphere'; atmosphere.setAttribute('aria-hidden', 'true');
  atmosphere.innerHTML = '<div class="ninja-brush"></div><div class="ninja-haze"></div>';
  for (let i=0;i<12;i++) {
    const leaf=document.createElement('span');leaf.className='ninja-leaf';
    leaf.style.cssText=`--left:${(i*31+5)%100}%;--delay:${-i*1.7}s;--duration:${12+i%4*3}s;--size:${11+i%3*6}px`;
    leaf.innerHTML='<svg viewBox="0 0 40 50" fill="none" stroke="currentColor" stroke-width="1.3"><path fill="currentColor" fill-opacity=".23" d="M20 40Q-2 22 20 2Q42 22 20 40Z"/><path d="M20 8V48M20 21L12 15M20 29L29 20"/></svg>';
    atmosphere.append(leaf);
  }
  const bar=document.createElement('div');bar.className='ninja-soundbar';
  bar.innerHTML='<span>VIENTO ENTRE HOJAS <small>Un momento en el mundo Ninja.</small></span>';
  const button=document.createElement('button');button.type='button';bar.append(button);
  const audio=new Audio('assets/ninja-wind-flute.mp3');audio.preload='none';audio.loop=true;audio.volume=.65;
  let active=false, playing=false, attempt=0;
  function updateButton() {
    button.textContent=playing?'♪ Silenciar ambiente':'♪ Escuchar viento y flauta';
    button.setAttribute('aria-pressed',String(playing));
  }
  function pause() { attempt++;audio.pause();playing=false;updateButton(); }
  async function start() {
    if(!active||document.hidden||window.CollectionScenes?.isMuted()) return;
    const ticket=++attempt;
    try { await audio.play(); if(ticket!==attempt||!active||document.hidden){if(!active||document.hidden)audio.pause();return;}playing=true;updateButton(); }
    catch { if(ticket===attempt){playing=false;updateButton();} }
  }
  function close() {
    active=false;pause();audio.currentTime=0;
    gallery.classList.remove('ninja-world');atmosphere.remove();bar.remove();
  }
  button.addEventListener('click',()=>{
    if(playing){window.CollectionScenes?.setMuted(true);pause();}
    else{window.CollectionScenes?.setMuted(false);start();}
  });
  window.NinjaAmbience={
    open(key){
      close();
      if(key!=='ninja')return;
      active=true;window.CollectionScenes?.stop();gallery.classList.add('ninja-world');
      gallery.prepend(atmosphere);gallery.querySelector('.dialog-head').after(bar);
      start();
    },close
  };
  gallery.addEventListener('close',close);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('pagehide',pause);
  updateButton();
})();
