'use strict';
(() => {
  const status=document.querySelector('#controller-status');
  const button=document.querySelector('#controller-check');
  const engineFrame=document.querySelector('iframe');
  let active=false, timer=0;
  function say(value){if(status.textContent!==value)status.textContent=value;}
  function check(){
    if(!navigator.getGamepads){say('Este navegador no permite detectar controles.');return;}
    try{
      const pad=Array.from(navigator.getGamepads()).find(p=>p?.connected);
      if(pad){
        active=true;status.classList.add('connected');
        say((/dualsense|054c|sony/i.test(pad.id)?'DualSense detectado':'Control detectado')+(pad.mapping==='standard'?' · Listo para jugar':' · Prueba los botones'));
        button.textContent='Enfocar juego';
      }else{
        status.classList.remove('connected');say(active?'Control desconectado. Puedes seguir con el joystick.':'Conecta tu control y pulsa × para detectarlo.');
        button.textContent='Detectar control';
      }
    }catch{say('Abre el juego en otra pestaña para probar el control.');}
  }
  button.addEventListener('click',()=>{check();engineFrame.focus();try{engineFrame.contentWindow.focus();}catch{}});
  window.addEventListener('gamepadconnected',check);window.addEventListener('gamepaddisconnected',check);
  function schedule(){if(timer)clearInterval(timer);if(!document.hidden){check();timer=setInterval(check,750);}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(timer);timer=0;}else schedule();});
  schedule();
})();
