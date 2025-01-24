import http from 'node:http';
import times from './times.mjs';

http.createServer((req, res) => {
  if (req.url === '/') return times(req, res);

  res.writeHead(404);
  res.end();
}).listen(3000);
console.log('http://localhost:3000');
