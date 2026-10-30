'use strict';
const product=JSON.parse(document.querySelector('#detail-data').textContent);
const form=document.querySelector('#detail-form');
const whatsapp=document.querySelector('#order-whatsapp');
const add=document.querySelector('[data-add-order]');
const priceOutput=document.querySelector('#detail-price');
const sizeNote=document.querySelector('#detail-size-note');
function updateOrder(){
 const data=new FormData(form),size=data.get('size');
 const quantity=Number(data.get('quantity'));
 const validQuantity=Number.isInteger(quantity)&&quantity>=1&&quantity<=20;
 const price=product.prices[size],known=Number.isFinite(price)&&price>0;
 document.querySelector('#detail-3xl-note').hidden=size!=='3XL';
 priceOutput.textContent=!size?'Elige tu talla':known?'$'+price+' MXN':'Consultar precio';
 sizeNote.textContent=!size?'Selecciona tu talla para ver el precio exacto y agregarla a tu pedido.':!validQuantity?'Elige una cantidad entera de 1 a 20 playeras.':'Talla '+size+' · Corte oversize · Disponibilidad por confirmar.';
 add.disabled=!size||!known||!validQuantity||document.documentElement.dataset.shoppingReady!=='true';
 add.textContent=!size?'Elige tu talla para agregar':!validQuantity?'Revisa la cantidad':known?'Agregar a mi pedido ↗':'Consulta el precio antes de agregar';
 whatsapp.textContent=size==='3XL'?'Consultar talla 3XL por WhatsApp ↗':'Consultar por WhatsApp ↗';
 if(!size||!validQuantity){
  whatsapp.removeAttribute('href');whatsapp.setAttribute('aria-disabled','true');whatsapp.tabIndex=-1;return;
 }
 whatsapp.removeAttribute('aria-disabled');
 whatsapp.removeAttribute('tabindex');
 const message=['Hola, me interesa pedir esta playera:', 'Diseño: '+product.name, 'Corte: oversize', 'Talla: '+size, 'Cantidad: '+quantity, known?'Precio por playera: $'+price+' MXN. Subtotal: $'+(price*quantity)+' MXN.':'Precio: por consultar.', product.finish, size==='3XL'?'Necesito confirmar las medidas y la disponibilidad de la talla 3XL antes de cerrar el pedido.':null, 'Pago contra entrega por el momento.', 'Entiendo que la entrega puede tardar hasta 7 días, con disponibilidad por confirmar.', 'Mi zona de entrega: ___', 'Si requiere envío, ¿me confirmas cobertura, costo aparte y total antes de cerrar mi pedido?', '¿Me confirmas disponibilidad y cómo hacer mi pedido?'].filter(Boolean).join('\n');
 whatsapp.href='https://wa.me/525636457353?text='+encodeURIComponent(message);
}
form.addEventListener('change',updateOrder);
form.addEventListener('input',updateOrder);
document.addEventListener('shopping:ready',updateOrder);
form.addEventListener('submit',event=>event.preventDefault());
whatsapp.addEventListener('click',event=>{if(whatsapp.getAttribute('aria-disabled')==='true')event.preventDefault();});
updateOrder();
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
 const image=document.querySelector('#detail-photo');image.src=button.dataset.photo;image.alt=button.dataset.caption+' de '+product.name;
 image.width=Number(button.dataset.width);image.height=Number(button.dataset.height);image.parentElement.href=button.dataset.original;
 document.querySelectorAll('[data-photo]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
}));
const shareButton=document.querySelector('#share-product'),shareStatus=document.querySelector('#share-status'),shareUrl=new URL(location.href);
shareUrl.search='';shareUrl.hash='';
const shareData={title:product.name+' · '+product.brand,text:'Mira esta playera de '+product.brand+': '+product.name,url:shareUrl.href};
const shareWhatsapp=document.querySelector('#share-whatsapp');
shareWhatsapp.href='https://wa.me/?text='+encodeURIComponent(shareData.text+'\n'+shareData.url);shareWhatsapp.hidden=false;
shareButton.addEventListener('click',async()=>{
 shareStatus.textContent='';
 if(typeof navigator.share==='function'){
  try{await navigator.share(shareData);return;}catch(error){if(error.name==='AbortError')return;}
 }
 try{await navigator.clipboard.writeText(shareData.url);shareStatus.textContent='Enlace copiado. Ya puedes compartir esta playera.';}
 catch{const fallback=document.querySelector('#share-url');fallback.hidden=false;fallback.value=shareData.url;fallback.focus();fallback.select();shareStatus.textContent='Copia este enlace para compartir la playera.';}
});
