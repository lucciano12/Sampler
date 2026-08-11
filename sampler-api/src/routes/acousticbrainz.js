const express = require('express');
const axios   = require('axios');
const router  = express.Router();


// GET/api/acousticbrainz/search?style=Funk&q=optional&per_page=10
// El backend resuelve la busqueda de discos por estilo y opcionalmente por query MusicBrainz → MBID → AcousticBrainz internamente
// Devuelve tempo, key, mode, danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence y tempo_confidence
router.get('/', async (req, res) => {
  const { artista, titulo } = req.query;

  try {
    // Paso 1: resolver MBID en MusicBrainz
    const mbResp = await axios.get('https://musicbrainz.org/ws/2/recording/', {
      params: {
        query: `recording:"${titulo}" AND artist:"${artista}"`,
        fmt:   'json',
        limit: 1
      },
      headers: { 'User-Agent': 'SamplerApp/1.0 (sampler-dev@example.com)' }
    });

    const recordings = mbResp.data?.recordings;
    if (!recordings?.length) return res.json({ tempo: null, key: null });

    const mbid = recordings[0].id;

    // Paso 2: datos de audio en AcousticBrainz
    const abResp = await axios.get(
      `https://acousticbrainz.org/api/v1/${mbid}/low-level`,
      { headers: { 'User-Agent': 'SamplerApp/1.0' } }
    );

    const bpm      = abResp.data?.rhythm?.bpm     ?? null;
    const keyKey   = abResp.data?.tonal?.key_key  ?? null;
    const keyScale = abResp.data?.tonal?.key_scale ?? null;

    res.json({
      tempo: bpm ? Math.round(bpm) : null,
      key:   keyKey
               ? `${keyKey}${keyScale === 'minor' ? 'm' : ''}`
               : null
    });
  } catch (err) {
    console.error('[AcousticBrainz]', err.message);
    res.json({ tempo: null, key: null }); // nunca 502: no debe romper el waterfall
  }
});

module.exports = router;