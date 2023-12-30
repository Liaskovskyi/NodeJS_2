import * as http from 'node:http';
import router from './router.js';
import defaultHandler from './defaultHandler.js';
import helpers from './helpers.js';
import { safeJSON, parseXML} from './utils.js';

const processedContentTypes = {
    'text/html': (text) =>  callback(null, text),
    'text/plain': (text, callback) => callback(null, text),
    'application/json': (json, callback) => callback(null, safeJSON(json, {})),
    'application/x-www-form-urlencoded': (data, callback) =>
      callback(null, Object.fromEntries(new URLSearchParams(data))),
    'application/xml': (xml, callback) => parseXML(xml, callback),  
  };

  export function createHttpServer( port = 9000) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `https://${req.headers.host}`);
    const routeModule = router.get(url.pathname) ?? {};
    const handler = routeModule[req?.method] ?? defaultHandler;
    let payload = {};
    let rawRequest = '';
    for await (const chunk of req) {
      rawRequest += chunk;
    }
    if (req.headers['content-type']) {
      const contentType = req.headers['content-type'].split(';')[0];
      if (processedContentTypes[contentType]) {
        processedContentTypes[contentType](rawRequest, (fallback, result) => {           
            payload = result || fallback;
          
        });
      }
    }
    try {
        handler(req, Object.assign(res, helpers), url, payload, rawRequest);
      } catch (err) {
        res.statusCode = 500;
        res.end('internal error');
      }
  });
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}).listen(port, () => console.log('Server started on port: ', port));
  

process.on('SIGINT', () => {
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
  });
});
  }