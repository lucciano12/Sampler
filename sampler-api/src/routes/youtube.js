const express = require('express');
const axios = require('axios');
const router = express.Router();

//GET /api/youtube?q=amen+break

router.get('/', async (req, res) => { // Endpoint para buscar un video en YouTube por nombre
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'El parámetro q es requerido' });
  }

  const respuesta = await axios.get('https://www.googleapis.com/youtube/v3/search', { 
    //Realiza una solicitud GET a la API de YouTube para buscar videos
    params: { //Se pasa los parametros necesarios para la busqueda
      q, // El parámetro de búsqueda proporcionado por el usuario
      key: process.env.YOUTUBE_API_KEY, // La clave de API de YouTube almacenada en las variables de entorno
      part: 'snippet', // Se especifica que se desea obtener información del snippet del video
      maxResults: 1, // Se limita la búsqueda a un solo resultado
      type: 'video' // Se especifica que solo se desean resultados de tipo video
    }
  });

  const items = respuesta.data.items; //Se obtiene la lista de resultados de la respuesta de la API de Youtube
  //data: Contiene la información devuelta por la API de YouTube, incluyendo los resultados de búsqueda.
  //items: Es un arreglo que contiene los resultados de búsqueda de videos devueltos por la API de YouTube.

  if (!items || items.length === 0) { 
    return res.status(404).json({ error: 'No se encontró ningún video' });
  }

  const videoId = items[0].id.videoId;
  res.json({ videoId });
});

module.exports = router;