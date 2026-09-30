const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'backend', 'dist');
const target = path.join(root, 'api', 'lib');

if (!fs.existsSync(source)) {
  console.error('No existe backend/dist. Ejecuta "npm run build:backend" primero.');
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });

function copy(from) {
  const to = path.join(target, path.relative(source, from));
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(path.join(to, entry.name), { recursive: true });
      copy(sourcePath);
    } else if (!entry.name.endsWith('.map') && !entry.name.endsWith('.d.ts')) {
      fs.copyFileSync(sourcePath, path.join(to, entry.name));
    }
  }
}

fs.mkdirSync(target, { recursive: true });
copy(source);
console.log('Backend compilado copiado a api/lib');
