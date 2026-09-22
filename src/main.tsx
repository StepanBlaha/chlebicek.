import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/outfit/latin-400.css';
import '@fontsource/outfit/latin-600.css';
import '@fontsource/outfit/latin-700.css';
import App from './App';
import './style.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
