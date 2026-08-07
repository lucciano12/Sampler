const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // ventana 1 minuto
  max: 100, // límite de 100 solicitudes por ventana (desarrollo)
  message: {error: 'Demasiadas peticiones, espere un momento'}
});

module.exports = limiter; // se exporta el middleware para usarlo en las rutas de la API