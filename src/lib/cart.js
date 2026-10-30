import { persistentAtom, setPersistentEngine } from '@nanostores/persistent';
import catalog from '../data/products.json' with { type: 'json' };
import {finishFor} from './product-finish.js';
if (typeof window !== 'undefined') {
 try { const key='noctbit-storage-probe'; localStorage.setItem(key,'1'); localStorage.removeItem(key); }
 catch { setPersistentEngine({}, {addEventListener(){},removeEventListener(){}}); }
}
const sizes=['CH','M','G','XL','2XL','3XL'];
export const productFor=key=>catalog.find(p=>p.key===key);
export function cleanCart(value){
 if(!Array.isArray(value))return [];
 const valid=new Map();
 for(const item of value.slice(0,100)){
  const product=productFor(item?.key),size=item?.size,quantity=Number(item?.quantity);
  if(!product||!sizes.includes(size)||!Number.isFinite(product.prices[size])||product.prices[size]<=0||!Number.isInteger(quantity)||quantity<1)continue;
  const id=product.key+':'+size,previous=valid.get(id)?.quantity||0;
  valid.set(id,{key:product.key,size,quantity:Math.min(20,quantity+previous)});
 }
 return [...valid.values()];
}
export const $cart=persistentAtom('noctbit-malacate:cart:v1',[],{
 encode:value=>JSON.stringify(cleanCart(value)),
 decode:value=>{try{return cleanCart(JSON.parse(value))}catch{return []}}
});
export function cartLines(){return cleanCart($cart.get()).map(item=>{const product=productFor(item.key);return {...item,product,unitPrice:product.prices[item.size],lineTotal:product.prices[item.size]*item.quantity}})}
export function addItem(key,size,quantity=1){
 const product=productFor(key);
 if(!product||!sizes.includes(size)||!Number.isFinite(product.prices[size])||product.prices[size]<=0||!Number.isInteger(quantity)||quantity<1||quantity>20)throw new Error('Revisa el diseño, la talla y la cantidad (1 a 20).');
 const items=cleanCart($cart.get()),found=items.find(item=>item.key===key&&item.size===size);
 if(found){if(found.quantity+quantity>20)throw new Error('Puedes agregar hasta 20 unidades por diseño y talla.');found.quantity+=quantity;}else items.push({key,size,quantity});
 $cart.set(items);
}
export function setQuantity(key,size,quantity){if(!Number.isInteger(quantity)||quantity<1||quantity>20)return;$cart.set(cleanCart($cart.get()).map(item=>item.key===key&&item.size===size?{...item,quantity}:item));}
export const removeItem=(key,size)=>$cart.set(cleanCart($cart.get()).filter(item=>item.key!==key||item.size!==size));
export const clearCart=()=>$cart.set([]);
export const totalFor=()=>cartLines().reduce((sum,line)=>sum+line.lineTotal,0);
export function orderMessage(){
 const lines=cartLines();
 return ['Hola, me gustaría confirmar este pedido de NOCTBIT × Malacate:','',...lines.map((line,i)=>(i+1)+'. '+line.product.name+' · '+line.product.brand+'\nCorte oversize · Talla '+line.size+' · '+line.quantity+' pieza(s) × $'+line.unitPrice+' = $'+line.lineTotal+' MXN\n'+finishFor(line.product)),'','Subtotal de prendas: $'+totalFor()+' MXN.','Total de piezas: '+lines.reduce((sum,line)=>sum+line.quantity,0)+'.','Pago contra entrega por el momento.','¿Me confirmas disponibilidad, tallas y entrega en hasta 7 días?','Si requiere envío, por favor cotízalo aparte.'].join('\n');
}
