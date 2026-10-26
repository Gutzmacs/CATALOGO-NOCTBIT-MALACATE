import test from 'node:test';
import assert from 'node:assert/strict';
import {$cart,cleanCart,addItem,clearCart,cartLines,totalFor,orderMessage,removeItem} from '../src/lib/cart.js';
test('same design and size merge; different sizes stay separate',()=>{
 clearCart();addItem('ninja','M',2);addItem('ninja','M',1);addItem('ninja','G',1);
 assert.equal(cartLines().length,2);assert.equal(cartLines()[0].quantity,3);assert.equal(totalFor(),1540);
});
test('mixed finishes and quantities produce the correct WhatsApp subtotal',()=>{
 clearCart();addItem('ninja','M',2);addItem('espadas','3XL',1);
 assert.equal(totalFor(),1330);assert.match(orderMessage(),/2 pieza\(s\) × \$380 = \$760/);assert.match(orderMessage(),/Bordados de pecho y manga incluidos/);assert.match(orderMessage(),/\$1330 MXN/);
 removeItem('espadas','3XL');assert.equal(totalFor(),760);
});
test('restored prices come from current catalog, not stored input',()=>{
 $cart.set([{key:'ninja',size:'M',quantity:1,unitPrice:1,lineTotal:1}]);
 assert.equal(totalFor(),380);assert.deepEqual(cleanCart($cart.get()),[{key:'ninja',size:'M',quantity:1}]);
});
test('invalid restored variants and quantities are discarded',()=>{
 assert.deepEqual(cleanCart([{key:'unknown',size:'M',quantity:1},{key:'ninja',size:'4XL',quantity:1},{key:'ninja',size:'CH',quantity:-1},null]),[]);
 assert.deepEqual(cleanCart('invalid'),[]);assert.equal(cleanCart([{key:'ninja',size:'M',quantity:999}])[0].quantity,20);
});
test('invalid new quantities and totals above limit are rejected',()=>{
 clearCart();for(const qty of [0,-1,1.5,21,NaN])assert.throws(()=>addItem('ninja','M',qty));
 addItem('ninja','M',20);assert.throws(()=>addItem('ninja','M',1));assert.equal(totalFor(),7600);clearCart();
});
