import {readFileSync,readdirSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const pages=['index.html','podminky.html','soukromi.html','404.html'];
for(const name of pages){
 const html=readFileSync(`dist/${name}`,'utf8');
 for(const marker of ['lang="cs"','name="description"','name="author"','<title>','favicon.svg','apple-touch-icon.png','property="og:image"','name="twitter:card"'])assert.ok(html.includes(marker),`${name}: missing ${marker}`);
 if(name!=='index.html')assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${name}: one H1`);
 for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g))assert.ok(url==='/'||existsSync(`dist${url}`),`${name}: missing ${url}`);
 assert.ok(!html.includes('\u2014'),`${name}: em dash`);
 if(name==='404.html')assert.ok(html.includes('noindex,follow'));
}
for(const file of ['og.png','favicon.svg','favicon-32.png','apple-touch-icon.png','robots.txt','sitemap.xml','llms.txt'])assert.ok(existsSync(`dist/${file}`),file);
function scan(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git','dist'].includes(entry.name))continue;const p=`${dir}/${entry.name}`;if(entry.isDirectory())scan(p);else if(/\.(tsx?|mjs|css|html|md|json|svg|txt)$/.test(p))assert.ok(!readFileSync(p,'utf8').includes('\u2014'),`Em dash: ${p}`);}}
scan('.');
console.log('Site checks passed: metadata, legal pages, 404, image assets, internal links, and no em dashes.');
