const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Servește fișierele statice din folderul `public`
app.use(express.static(path.join(__dirname, 'public')));

// Rutează toate cererile către `WeatherApp.html`
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'WeatherApp.html'));
});

// Pornește serverul
app.listen(port, () => {
  console.log(`Serverul rulează pe http://localhost:${port}`);
});