# Where Coffee ☕

A web application to find coffee shops near you using Google Maps Places API.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env file in project root
   echo "GOOGLE_MAPS_API_KEY=your_api_key_here" > .env
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Project structure

```
where-coffee/
├── index.html
├── styles.css
├── server.js (optional)
├── package.json (optional)
├── .env (do not include in git)
├── js/
│   ├── config.js (do not include in git)
│   ├── config.example.js
│   ├── App.js
│   ├── components/
│   ├── models/
│   ├── services/
│   └── utils/
```

## Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the APIs: Places API and Maps JavaScript API
4. Create an API key in "Credentials"
5. Configure domain restrictions for better security (optional)

## Deploy

To deploy on services like Netlify, Vercel, etc., use the provider's environment variables for the API key.