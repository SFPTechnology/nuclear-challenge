const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'dist');
const server = http.createServer((req, res) => {
  const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = path.resolve(root, '.' + requested);
  if (!file.startsWith(root) || !fs.existsSync(file)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const types = { '.html': 'text/html; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
server.listen(4173, '127.0.0.1', () => console.log('Nuclear Challenge local server: http://127.0.0.1:4173/'));
