const express = require('express');
const cors = require('cors');
const limiter = require('./middlewares/rateLimiter');
const youtubeRouter = require('./routes/youtube');
const discogsRouter = require('./routes/discogs');
const acousticbrainzRouter = require('./routes/acousticbrainz');

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
app.use('/api/youtube', youtubeRouter); //Express escucha y redirige al router de youtube
app.use('/api/discogs', discogsRouter); //Express escucha y redirige al router de discogs
app.use('/api/acousticbrainz', acousticbrainzRouter); //Express escucha y redirige al router de acousticbrainz

module.exports = app;

