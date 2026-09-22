import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
function notFound():Plugin{return {name:'custom-404',configurePreviewServer(server){server.middlewares.use((req,res,next)=>{const path=(req.url||'/').split('?')[0];if(!['/','/index.html','/podminky.html','/soukromi.html'].includes(path)&&(req.headers.accept||'').includes('text/html')&&!path.startsWith('/assets/')){res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(readFileSync('dist/404.html'));return;}next();});}}}
export default defineConfig({plugins:[react(),notFound()]});
