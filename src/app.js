import express from 'express';

const app = express('');
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('OK!');
});

const server = app.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
