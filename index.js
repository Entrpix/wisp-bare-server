const { createBareServer } = require('@tomphttp/bare-server-node');
const wisp = require("wisp-server-node");
const weassl = require('weassl');
const https = require('https');

const serverOptions = weassl.setup('path/to/key.pem', 'path/to/cert.pem');
const bareServer = createBareServer('/bare/');

const requestHandler = (req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bare: /bare/\nWisp: /wisp/');
    } else if (req.url.startsWith("/wisp/")) {
        wisp.routeRequest(req, res);
    } else if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        res.writeHead(400);
        res.end('Not found.');
    }
};

const upgradeHandler = (req, socket, head) => {
    if (req.url.endsWith("/wisp/")) {
        wisp.routeRequest(req, socket, head);
    } else if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    };
};

const httpsServer = https.createServer(serverOptions, requestHandler);
httpsServer.on("upgrade", upgradeHandler);

httpsServer.listen(443, () => {
    console.log('Server Running\nBare: /bare/\nWisp: /wisp/');
});
