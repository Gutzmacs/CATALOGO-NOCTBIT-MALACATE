import fs from 'node:fs';
const products=JSON.parse(fs.readFileSync('src/data/products.json','utf8'));
const {default:sharp}=await import('sharp');
const seen=new Set();
for(const p of products){
 if(!/^[a-z0-9-]+$/.test(p.key)||seen.has(p.key))throw new Error('Identificador inválido o duplicado: '+p.key);
 seen.add(p.key);
 if(!p.photos?.length)throw new Error('Falta una foto: '+p.name);
 p.prices=Object.fromEntries(Object.entries(p.prices||{}).filter(([k,v])=>v!==null&&v!==''&&v!==undefined).map(([k,v])=>{if(!Number.isFinite(Number(v))||Number(v)<=0)throw new Error('Precio inválido');return [k,Number(v)]}));
 for(const photo of p.photos){
 photo.src=photo.src.replace(/^\//,'');
 if(!photo.src.startsWith('assets/')||photo.src.includes('..'))throw new Error('Ruta de foto inválida');
 const input='public/'+photo.src;
 const metadata=await sharp(input).metadata();
 photo.width=metadata.width;photo.height=metadata.height;
 photo.displaySrc=photo.src.replace(/\.[^.]+$/,'.webp');
 if(input!=='public/'+photo.displaySrc)await sharp(input).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile('public/'+photo.displaySrc);
 await sharp(input).rotate().resize({width:360,height:360,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile('public/'+photo.displaySrc.replace('.webp','-thumb.webp'));
 }
}
fs.writeFileSync('src/data/products.json',JSON.stringify(products,null,2));
