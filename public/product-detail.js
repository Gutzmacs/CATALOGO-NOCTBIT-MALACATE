'use strict';
const product=JSON.parse(document.querySelector('#detail-data').textContent);
const form=document.querySelector('#detail-form');
const whatsapp=document.querySelector('#order-whatsapp');
function updateOrder(){
 const size=new FormData(form).get('size');
 const price=product.prices[size];
 document.querySelector('#detail-price').textContent=price?'$'+price+' MXN':'Consultar precio';
 const message=['Hola, me interesa pedir esta playera:', 'Diseño: '+product.name, 'Talla: '+size, price?'Precio del catálogo: $'+price+' MXN por playera.':'Precio: por consultar.', product.key==='espadas'?'Bordado incluido.':'Quisiera confirmar el acabado y los extras disponibles.', 'Entiendo que la entrega puede tardar hasta 7 días, con disponibilidad por confirmar.', '¿Me confirmas disponibilidad, total y cómo hacer mi pedido?'].join('\n');
 whatsapp.href='https://wa.me/525636457353?text='+encodeURIComponent(message);
}
form.addEventListener('change',updateOrder);
form.addEventListener('submit',event=>event.preventDefault());
updateOrder();
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const image=document.querySelector('#detail-photo');image.src=button.dataset.photo;image.alt=button.dataset.caption+' de '+product.name;image.parentElement.href=button.dataset.photo;document.querySelector('#photo-caption').textContent=button.dataset.caption+' · Toca para ampliar · Desliza entre vistas';document.querySelectorAll('[data-photo]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}));
