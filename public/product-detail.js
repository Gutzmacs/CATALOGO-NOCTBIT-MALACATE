'use strict';
const product=JSON.parse(document.querySelector('#detail-data').textContent);
const form=document.querySelector('#detail-form');
const whatsapp=document.querySelector('#order-whatsapp');
function updateOrder(){
 const size=new FormData(form).get('size');
 const quantity=Number(new FormData(form).get('quantity')||1);
 if(!Number.isInteger(quantity)||quantity<1||quantity>20){whatsapp.removeAttribute('href');whatsapp.setAttribute('aria-disabled','true');return;}
 whatsapp.removeAttribute('aria-disabled');
 const price=product.prices[size];
 const add=document.querySelector('[data-add-order]');
 add.disabled=!price||document.documentElement.dataset.shoppingReady!=='true';add.textContent=price?'Agregar al carrito ↗':'Consulta el precio antes de agregar';
 document.querySelector('#detail-price').textContent=price?'$'+price+' MXN':'Consultar precio';
 const message=['Hola, me interesa pedir esta playera:', 'Diseño: '+product.name, 'Talla: '+size, 'Cantidad: '+quantity, price?'Precio por playera: $'+price+' MXN. Subtotal: $'+(price*quantity)+' MXN.':'Precio: por consultar.', product.finish, 'Entiendo que la entrega puede tardar hasta 7 días, con disponibilidad por confirmar.', '¿Me confirmas disponibilidad, total y cómo hacer mi pedido?'].join('\n');
 whatsapp.href='https://wa.me/525636457353?text='+encodeURIComponent(message);
}
form.addEventListener('change',updateOrder);
form.addEventListener('input',updateOrder);
document.addEventListener('shopping:ready',updateOrder);
form.addEventListener('submit',event=>event.preventDefault());
updateOrder();
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
 const image=document.querySelector('#detail-photo');image.src=button.dataset.photo;image.alt=button.dataset.caption+' de '+product.name;
 image.width=Number(button.dataset.width);image.height=Number(button.dataset.height);image.parentElement.href=button.dataset.original;
 document.querySelector('#photo-caption').textContent=button.dataset.caption+' · Toca para ampliar · Desliza entre vistas';
 const kind=document.querySelector('#photo-kind');kind.textContent=button.dataset.imageType||'';kind.hidden=!button.dataset.imageType;
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
