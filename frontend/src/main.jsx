import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter as Router} from 'react-router-dom'
import AOS from "aos";
import 'aos/dist/aos.css';
import { Toaster } from 'react-hot-toast';

AOS.init();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Toaster position="bottom-right" reverseOrder={false} />
      <App />
    </Router>
  </StrictMode>,
)
