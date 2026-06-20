// const app = require('express')();

import express from 'express';
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello, World, Rush!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});