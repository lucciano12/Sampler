const express = require('express');
const cors = require('cors');
const limiter = require('./middlewares/rateLimiter');
const youtubeRouter = require('./routes/youtube');

const app = express(); // Crea una instancia de la aplicación Express

// Middlewares 
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://sampler-lp.vercel.app'
  ]
}));
app.use(express.json());
app.use('/api/', limiter);

// Rutas
app.use('/api/youtube', youtubeRouter);

module.exports = app;

