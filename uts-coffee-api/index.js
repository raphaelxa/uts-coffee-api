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
const imagesDir = path.resolve(__dirname, 'images');
app.use('/images', express.static(imagesDir));

// Route untuk root URL "/"
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Coffee API!</h1>
    <p>Try <a href="/coffee">/coffee</a> to view the coffee list.</p>
  `);
});

// Endpoint untuk membaca CSV dan kirim JSON
app.get('/coffee', (req, res) => {
  const csvFile = path.join(__dirname, 'coffee_list_data.csv');

  fs.readFile(csvFile, 'utf8', (error, fileData) => {
    if (error) {
      return res.status(500).json({ message: 'Error reading CSV file', error });
    }

    const rows = fileData.split('\n').filter(row => row);
    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.split(';');

    const coffeeList = dataRows.map(row => {
      const values = row.split(';');
      const coffeeItem = {};

      headers.forEach((header, idx) => {
        coffeeItem[header.trim()] = values[idx]?.trim();
      });

      coffeeItem.thumbnail_url = `${req.protocol}://${req.get('host')}/images/${coffeeItem.coffee_thumbnails}`;
      coffeeItem.poster_url = `${req.protocol}://${req.get('host')}/images/${coffeeItem.coffee_poster}`;

      return coffeeItem;
    });

    res.json(coffeeList);
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

