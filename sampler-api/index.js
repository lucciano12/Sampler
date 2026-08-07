require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
const app = require('./src/app'); // Importa la aplicación Express desde el archivo app.js
 
const PORT = process.env.PORT || 3000; // Define el puerto en el que se ejecutará el servidor, utilizando la variable de entorno PORT o el valor predeterminado 3000

app.listen(PORT, () => { // Inicia el servidor y escucha en el puerto especificado
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});