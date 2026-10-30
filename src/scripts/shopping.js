import {$cart,cartLines,totalFor,addItem,setQuantity,removeItem,clearCart,orderMessage,productFor} from '../lib/cart.js';
import {finishFor} from '../lib/product-finish.js';
import {coverPhotoFor} from '../lib/product-photos.js';
const cartDialog=document.querySelector('#order-dialog'),sizeDialog=document.querySelector('#size-dialog');
const money=value=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value)+' MXN';
const toast=document.querySelector('#order-toast');let toastTimer;
function announce(message){toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true},4500)}
function openDialog(dialog){for(const other of [cartDialog,sizeDialog])if(other!==dialog&&other.open)other.close();if(!dialog.open)dialog.showModal()}
function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n}
function render(){
 const focused=document.activeElement?.getAttribute('aria-label');
 const lines=cartLines(),count=lines.reduce((sum,line)=>sum+line.quantity,0),container=document.querySelector('#order-lines');container.replaceChildren();
 document.querySelectorAll('[data-order-count]').forEach(n=>n.textContent=String(count));
 document.querySelector('#order-empty').hidden=lines.length>0;
 document.querySelector('#order-total').textContent=money(totalFor());
 document.querySelector('#clear-order').disabled=!lines.length;
 const send=document.querySelector('#send-order');send.setAttribute('aria-disabled',String(!lines.length));if(lines.length)send.href='https://wa.me/525636457353?text='+encodeURIComponent(orderMessage());else send.removeAttribute('href');
 for(const line of lines){
  const row=node('article','order-line'),image=node('img','order-image');image.src=coverPhotoFor(line.product).displaySrc;image.alt=line.product.name;image.width=76;image.height=90;image.loading='lazy';
  const info=node('div','order-line-info'),heading=node('h3','',line.product.name),meta=node('p','',line.product.brand+' · Talla '+line.size),finish=node('p','order-finish',finishFor(line.product)),price=node('p','',money(line.unitPrice)+' por pieza');
  const controls=node('div','order-controls');
  for(const delta of [-1,1]){const button=node('button','order-quantity',delta===-1?'−':'+');button.type='button';button.setAttribute('aria-label',(delta===-1?'Reducir':'Aumentar')+' cantidad de '+line.product.name+', talla '+line.size);button.disabled=delta===-1?line.quantity===1:line.quantity===20;button.addEventListener('click',()=>setQuantity(line.key,line.size,line.quantity+delta));controls.append(button);if(delta===-1)controls.append(node('span','order-count',String(line.quantity)))}
  const remove=node('button','shop-text-button','Quitar');remove.type='button';remove.setAttribute('aria-label','Quitar '+line.product.name+', talla '+line.size);remove.addEventListener('click',()=>{removeItem(line.key,line.size);announce('Playera retirada del pedido.');});controls.append(remove);
  info.append(heading,meta);
  if(line.size==='3XL')info.append(node('p','order-size-note','3XL: confirma medidas y disponibilidad antes de cerrar el pedido.'));
  info.append(finish,price,controls);row.append(image,info,node('strong','order-line-total',money(line.lineTotal)));container.append(row);
 }
 if(focused){const target=[...container.querySelectorAll('button')].find(button=>button.getAttribute('aria-label')===focused&&!button.disabled);target?.focus({preventScroll:true});}
}
$cart.subscribe(render);
document.querySelectorAll('[data-open-order]').forEach(button=>button.addEventListener('click',()=>openDialog(cartDialog)));
document.querySelectorAll('[data-open-size-guide]').forEach(button=>button.addEventListener('click',()=>{
 const product=productFor(document.body.dataset.product),size=document.querySelector('#detail-form input[name="size"]:checked')?.value;
 const message=['Hola, quisiera ayuda para elegir mi talla.','Diseño: '+(product?.name||'___'),'Corte: oversize',size?'Talla que me interesa: '+size:null,size==='3XL'?'¿Me confirmas las medidas y disponibilidad de 3XL?':null,'Mi playera de referencia mide ___ cm de ancho y ___ cm de largo.'].filter(Boolean).join('\n');
 document.querySelector('#ask-size').href='https://wa.me/525636457353?text='+encodeURIComponent(message);
 openDialog(sizeDialog);
}));
document.querySelectorAll('[data-size-cut]').forEach(button=>button.addEventListener('click',()=>{
 const cut=button.dataset.sizeCut;
 document.querySelectorAll('[data-size-cut]').forEach(option=>option.setAttribute('aria-pressed',String(option.dataset.sizeCut===cut)));
 document.querySelectorAll('[data-size-cut-panel]').forEach(panel=>panel.hidden=panel.dataset.sizeCutPanel!==cut);
}));
document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.closeDialog).close()));
for(const dialog of [cartDialog,sizeDialog])dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close()});
document.querySelector('#clear-order').addEventListener('click',()=>{clearCart();announce('Pedido vaciado.');});
document.querySelector('#send-order').addEventListener('click',event=>{if(!cartLines().length)event.preventDefault()});
// Each gallery and collection card uses the current catalog price for its chosen size.
document.querySelectorAll('[data-inline-purchase]').forEach(form=>{
 const update=()=>{
  const data=new FormData(form),product=productFor(data.get('design')),size=data.get('size'),price=product?.prices[size],known=Number.isFinite(price)&&price>0;
  const prices=Object.values(product?.prices||{}),button=form.querySelector('[data-add-order]');
  form.querySelector('[data-inline-price]').textContent=known?money(price):size?'Consultar precio':prices.length?'Desde '+money(Math.min(...prices)):'Consultar precio';
  form.querySelector('[data-inline-hint]').textContent=known?'Precio por playera. Disponibilidad por confirmar.':size?'Confirma el precio y la disponibilidad por WhatsApp.':prices.length?'Elige una talla para ver su precio.':'Precio por confirmar. Consulta por WhatsApp.';
  button.disabled=!known;button.textContent=known?'Agregar a mi pedido ↗':size?'Precio por confirmar':'Elige tu talla';
  const consult=form.querySelector('[data-inline-consult]');consult.hidden=known||(!size&&prices.length>0);
  consult.href='https://wa.me/525636457353?text='+encodeURIComponent('Hola, me interesa '+product.name+(size?', talla '+size:'')+'. ¿Me confirmas precio y disponibilidad?');
 };
 form.addEventListener('change',update);form.addEventListener('submit',event=>event.preventDefault());update();
});
document.querySelectorAll('[data-add-order]').forEach(button=>button.addEventListener('click',()=>{
 const form=document.querySelector(button.dataset.orderForm),data=new FormData(form),key=button.dataset.productKey||data.get('design'),size=data.get('size'),quantityInput=form.querySelector('[name="quantity"]');
 if(quantityInput&&!quantityInput.reportValidity())return;
 try{addItem(key,size,quantityInput?Number(quantityInput.value):1);announce(productFor(key).name+', talla '+size+', agregada a tu pedido.');document.querySelector('#gallery')?.close();openDialog(cartDialog)}catch(error){announce(error.message)}
}));
try{const key='noctbit-storage-check';localStorage.setItem(key,'1');localStorage.removeItem(key)}catch{document.querySelector('#cart-storage-note').textContent='Tu navegador no permite guardar la selección. Mantenla abierta mientras armas tu pedido.'}
document.documentElement.dataset.shoppingReady='true';
document.dispatchEvent(new Event('shopping:ready'));
