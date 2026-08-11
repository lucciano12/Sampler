const express = require('express');
const axios = require('axios');
const router = express.Router();


const DISCOGS_KEY = process.env.DISCOGS_KEY;

//Aca se define el header de autorizacion para la API 
const headers = {
  'User-Agent': 'SamplerApp/1.0 +https://sampler-lp.vercel.app'
}

//El endpoint para buscar discos por estilo 
// GET /api/discogs/search?style=Funk&q=optional&per_page=10
// Usado por DiscogsService.buscarPorEstilo()
//El router recibe el request especifico

router.get('/search', async (req, res) => {
  const { style, q, per_page = 10 } = req.query; //Lee los parametros que mando Angular en el request
  try {
    const params = { per_page, token: DISCOGS_KEY };
    if (style) params.style = style;
    if (q)     params.q     = q;

    const { data } = await axios.get(
      'https://api.discogs.com/database/search',
      { params, headers }
    );
    res.json(data); //Manda la respuesta de Discogs a Angular
  } catch (err) {
    console.error('[Discogs/search]', err.message);
    res.status(502).json({ results: [] }); // misma forma que Discogs real
  }
});

//El endpoint para enriquecer un disco con datos de Discogs con titulo y artista
// GET /api/discogs/enrich?artista=Michael+Jackson&titulo=Thriller
// Usado por DiscogsService.enrichFromDiscogs()
router.get('/enrich', async (req, res) => {
  const { artista, titulo } = req.query;
  try {
    const { data } = await axios.get(
      'https://api.discogs.com/database/search',
      { params: { artist: artista, title: titulo, per_page: 1, token: DISCOGS_KEY }, headers }
    );
    res.json(data);
  } catch (err) {
    console.error('[Discogs/enrich]', err.message);
    res.status(502).json({ results: [] });
  }
});

module.exports = router;