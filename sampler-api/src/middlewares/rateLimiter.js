const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // ventana 1 minuto
  max: 30, // límite de 30 solicitudes por ventana
  message: {error: 'Demasiadas peticiones, espere un momento'}
});

module.exports = limiter; // se exporta el middleware para usarlo en las rutas de la API