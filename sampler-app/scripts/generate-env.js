/**
 * Script que genera los archivos de environment de Angular
 * desde variables de entorno (.env local o process.env en Vercel).
 *
 * Se ejecuta automáticamente como "prebuild" antes de ng build.
 */

const path = require('path');
const fs = require('fs');

// Cargar dotenv si existe un .env (local); en Vercel las vars ya están en process.env
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch {
  // dotenv no instalado o .env no existe — se usan process.env directamente
}

const envDir = path.join(__dirname, '..', 'src', 'environments');

// Asegurar que el directorio existe
fs.mkdirSync(envDir, { recursive: true });

/**
 * Genera un archivo de environment de Angular.
 * @param {'development'|'production'} mode
 */
function writeEnvironment(mode) {
  const isProd = mode === 'production';
  const filePath = isProd
    ? path.join(envDir, 'environment.prod.ts')
    : path.join(envDir, 'environment.ts');

  const discogsKey = process.env.DISCOGS_KEY || '';

  const content = [
    '// 📁 Archivo generado automáticamente por scripts/generate-env.js',
    '// No editar manualmente — las keys viven en .env (local) o en Vercel Environment Variables',
    '',
    'export const environment = {',
    `  production: ${isProd},`,
    `  discogsKey: ${JSON.stringify(discogsKey)},`,
    '};',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Environment ${mode} generado → ${path.relative(process.cwd(), filePath)}`);
}

writeEnvironment('development');
writeEnvironment('production');
