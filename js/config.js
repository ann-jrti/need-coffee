const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://YOUR_BACKEND_URL.onrender.com';

window.CONFIG = {
  API_URL
};