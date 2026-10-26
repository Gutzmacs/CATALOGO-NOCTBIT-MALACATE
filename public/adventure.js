'use strict';
(() => {
  const launch = document.querySelector('#launch-adventure');
  if (!launch) return;
  launch.addEventListener('click', () => {
    const shell=document.querySelector('#adventure-shell');
    const frame=document.createElement('iframe');
    frame.src='game/index.html';frame.title='Ninja del castillo: aventura retro';
    frame.allow='fullscreen; autoplay; gamepad';frame.allowFullscreen=true;
    shell.replaceChildren(frame);shell.classList.add('adventure-loaded');
    document.querySelector('#adventure-status').textContent='Elige Nueva partida o Continuar dentro del juego.';
  },{once:true});
})();
