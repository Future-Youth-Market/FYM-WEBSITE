const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const port = Number(process.env.PORT || 4177);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.yml': 'text/yaml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

execFileSync(process.execPath, [path.join(__dirname, 'build-site.cjs')], { stdio: 'inherit' });

http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname); }
  catch { response.writeHead(400).end(); return; }
  const target = path.resolve(output, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
  if (!target.startsWith(output + path.sep) && target !== output) { response.writeHead(403).end(); return; }
  const file = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`FYM preview: http://127.0.0.1:${port}/`));
