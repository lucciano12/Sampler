/**
 * Script que genera los archivos de environment de Angular
 * desde variables de entorno (process.env).
 *
 * Se ejecuta como "prebuild" antes de ng build.
 * Compatible con Vercel, CI/CD y entorno local.
 *
 * En local: intenta cargar .env via dotenv (si está instalado).
 * En Vercel/CI: usa process.env directamente (las vars se configuran en el dashboard).
 */

const fs = require('fs');
const path = require('path');

// Intentar cargar .env local (no falla si dotenv no está instalado o .env no existe)
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (_) {
  // dotenv no disponible (CI/Vercel) — se usan process.env directamente
}

const envDir = path.join(__dirname, 'src', 'environments');

// Crear el directorio si no existe (necesario en CI/Vercel)
fs.mkdirSync(envDir, { recursive: true });

/**
 * Genera un archivo de environment de Angular.
 * @param {'development'|'production'} mode
 */
function writeEnvironment(mode) {
  const isProd = mode === 'production';
  const suffix = isProd ? 'prod' : '';
  const filePath = path.join(envDir, `environment${suffix ? '.' + suffix : ''}.ts`);

  // Leer de process.env (Vercel, CI) — sin depender de dotenv ni .env
  const discogsKey = process.env.DISCOGS_KEY || '';

  const content = [
    '// Auto-generado por generate-env.js — no editar manualmente',
    `// Las variables vienen de process.env (Vercel Environment Variables)`,
    '',
    'export const environment = {',
    `  production: ${isProd},`,
    `  discogsKey: ${JSON.stringify(discogsKey)},`,
    '};',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ environment.${suffix || 'ts'} generado (production: ${isProd})`);
}

writeEnvironment('development');
writeEnvironment('production');
