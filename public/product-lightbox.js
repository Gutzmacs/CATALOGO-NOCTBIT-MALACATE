import PhotoSwipeLightbox from './vendor/photoswipe/photoswipe-lightbox.esm.js';
const photos=JSON.parse(document.querySelector('#photo-data').textContent);
const trigger=document.querySelector('.main-photo-link');
const thumbs=[...document.querySelectorAll('[data-photo]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lightbox=new PhotoSwipeLightbox({dataSource:photos,pswpModule:()=>import('./vendor/photoswipe/photoswipe.esm.js'),showHideAnimationType:'fade',showAnimationDuration:reduced?0:220,hideAnimationDuration:reduced?0:180,bgOpacity:.97,closeTitle:'Cerrar galería',zoomTitle:'Ampliar o reducir',arrowPrevTitle:'Foto anterior',arrowNextTitle:'Foto siguiente',errorMsg:'No se pudo cargar la foto. Cierra la galería e inténtalo de nuevo.',returnFocus:true});
lightbox.on('uiRegister',()=>{
 lightbox.pswp.ui.registerElement({name:'photo-caption',order:9,isButton:false,appendTo:'root',onInit:(element,pswp)=>{
  element.style.cssText='position:absolute;bottom:20px;left:60px;right:60px;text-align:center;color:white;font:13px/1.6 Arial,sans-serif;pointer-events:none;text-shadow:0 1px 4px black';
  const update=()=>{const photo=pswp.currSlide?.data;element.textContent=[photo?.imageType,photo?.alt].filter(Boolean).join(' · ');};pswp.on('change',update);update();
 }});
});
lightbox.on('change',()=>{const index=lightbox.pswp.currIndex;if(thumbs[index]) thumbs[index].click();});
lightbox.init();
trigger.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const index=Math.max(0,thumbs.findIndex(item=>item.getAttribute('aria-pressed')==='true'));lightbox.loadAndOpen(index);});
