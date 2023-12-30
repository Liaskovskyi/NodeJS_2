import * as http from 'node:http';
import router from './router.js';
import defaultHandler from './defaultHandler.js';
import helpers from './helpers.js';
import {safeJSON} from './utils.js';

const proccessedContentTypes = {
    'text/html': (text) => text,
    'text/plain': (text) => text,
    'application/json': (json) => safeJSON(json, {}),
    'application/x-www-form-urlencode': (data) => {
        return Object.fromEntries(new URLSearchParams(data))
    }
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

    if (req.headers['Content-type']) {
        const contentType = req.headers['Content-type'].split(';')[0];
        if (proccessedContentTypes[contentType]) {
            payload = proccessedContentTypes[contentType](rawRequest);
        }
    }

    try {
        handler(req, Object.assign(res, helpers), url, payload, rawRequest);
    } catch (e) {
        res.statusCode = 500;
        res.end(e);
    }
}).listen(port, () => console.log('Server started on port: ', port));


server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});



process.on('SIGINT', () => {
    server.close((error) => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
    });
});
}