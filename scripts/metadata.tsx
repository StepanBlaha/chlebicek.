import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync,writeFileSync} from 'node:fs';
import sharp from 'sharp';
import {Sandwich} from '../src/Food';
import {presets} from '../src/recipe';
import {InfoPage} from '../src/Pages';
const origin=(process.env.SITE_URL || 'https://chlebicek.vercel.app').replace(/\/$/,'');
if(origin&&!/^https:\/\/[^/]+$/.test(origin))throw new Error('SITE_URL must be an HTTPS origin without a path.');
const base=readFileSync('dist/index.html','utf8');
const desc='Malý zábavný builder chlebíčků. Přidávej suroviny, přesouvej je a stáhni svůj výtvor jako PNG nebo průhlednou samolepku.';
const pages=[['/','Chlebíček | Malý zábavný builder',desc],['/podminky.html','Podmínky používání | Chlebíček','Podmínky používání bezplatného tvořivého webu Chlebíček.'],['/soukromi.html','Soukromí | Chlebíček','Jak Chlebíček zachází s daty, obrázky a sdílenými odkazy.'],['/404.html','Stránka nenalezena | Chlebíček','Tato stránka neexistuje. Vraťte se do builderu chlebíčků.']];
for(const [path,title,description] of pages){
 const url=origin?origin+path:undefined;
 const schema=path==='/'?{'@context':'https://schema.org','@type':'WebApplication',name:'Chlebíček',description,applicationCategory:'EntertainmentApplication',operatingSystem:'Any',inLanguage:'cs',isAccessibleForFree:true,author:{'@type':'Person',name:'Štěpán Bláha',url:'https://www.stepanblaha.com/'},...(url?{url,image:origin+'/og.png'}:{})}:url&&path!='/404.html'?{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Chlebíček',item:origin+'/'},{'@type':'ListItem',position:2,name:title.split(' |')[0],item:url}]}:null;
 const tags=`${url&&path!='/404.html'?`<link rel="canonical" href="${url}">`:''}<meta name="robots" content="${!origin||path==='/404.html'?'noindex,follow':'index,follow'}"><meta property="og:type" content="website"><meta property="og:locale" content="cs_CZ"><meta property="og:site_name" content="Chlebíček"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${origin||''}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Ilustrovaný chlebíček se šunkou, vejcem a zeleninou">${url?`<meta property="og:url" content="${url}">`:''}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${origin||''}/og.png">${schema?`<script type="application/ld+json">${JSON.stringify(schema)}</script>`:''}`;
 let html=base.replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${description}">`).replace('</head>',tags+'</head>');
 if(path!=='/')html=html.replace('<div id="root"></div>',`<div id="root">${renderToStaticMarkup(<InfoPage path={path}/>)}</div>`);
 writeFileSync('dist/'+(path==='/'?'index.html':path.slice(1)),html);
}
writeFileSync('dist/robots.txt',origin?`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${origin?pages.filter(([p])=>p!='/404.html').map(([p])=>`<url><loc>${origin+p}</loc></url>`).join(''):''}</urlset>`);
writeFileSync('dist/llms.txt',`# Chlebíček\n\n> Free Czech sandwich illustration builder by Štěpán Bláha.\n\nAdd multiple ingredients, move each piece, share a layout link, export PNG or transparent PNG stickers. No accounts, orders, payments or analytics.\n\n- [Builder](${origin||''}/)\n- [Terms](${origin||''}/podminky.html)\n- [Privacy](${origin||''}/soukromi.html)\n- [Author](https://www.stepanblaha.com/)\n`);
const sandwich=renderToStaticMarkup(<Sandwich recipe={presets['Česká klasika']} selected={null} onSelect={()=>{}} onMove={()=>{}} onRemove={()=>{}}/>);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f4f5f7"/><text x="70" y="140" font-family="sans-serif" font-size="64" font-weight="700" fill="#303a32">chlebíček.</text><text x="73" y="189" font-family="sans-serif" font-size="23" fill="#68796a">Postav si vlastní. Jen tak, pro radost.</text><g transform="translate(310 110)">${sandwich.replace('<svg ','<svg width="850" height="540" ')}</g></svg>`;
await sharp(Buffer.from(svg)).png({palette:true,compressionLevel:9}).toFile('dist/og.png');
if(!origin)console.warn('Public domain not configured. Set SITE_URL=https://your-domain before publishing to enable canonical URLs, sitemap entries and indexing.');
await sharp('public/favicon.svg').resize(180,180).png().toFile('dist/apple-touch-icon.png');
await sharp('public/favicon.svg').resize(32,32).png().toFile('dist/favicon-32.png');
for(const [path] of pages){const file='dist/'+(path==='/'?'index.html':path.slice(1));writeFileSync(file,readFileSync(file,'utf8').replace('</head>','<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"></head>'));}
