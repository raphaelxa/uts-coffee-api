const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Sajikan gambar dari folder "images"
app.use('/images', express.static(path.join(__dirname, 'images')));

// Route untuk root URL "/"
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Coffee API!</h1><p>Try <a href="/coffee">/coffee</a> to view the coffee list.</p>');
});

// Endpoint untuk membaca CSV dan kirim JSON
app.get('/coffee', (req, res) => {
  const csvPath = path.join(__dirname, 'coffee_list_data.csv');

  fs.readFile(csvPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading CSV file', error: err });
    }

    const lines = data.split('\n').filter(line => line);
    const headers = lines[0].split(';');

    const jsonData = lines.slice(1).map(line => {
      const values = line.split(';');
      const coffee = {};

      headers.forEach((header, index) => {
        coffee[header.trim()] = values[index].trim();
      });

      coffee.thumbnail_url = `${req.protocol}://${req.get('host')}/images/${coffee.coffee_thumbnails}`;
      coffee.poster_url = `${req.protocol}://${req.get('host')}/images/${coffee.coffee_poster}`;

      return coffee;
    });

    res.json(jsonData);
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});