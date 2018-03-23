import * as mustacheExpress from 'mustache-express';
import * as express from 'express';
import { join } from 'path';

import { AppRouterOptions } from './app-router/app-router.model';

const PORT = process.env.PORT || 4000;
const DIST_PATH = join(process.cwd(), 'dist');
declare const SSR_ENABLED: boolean;
declare const NG_PROXY: boolean;
declare const NG_PORT: number;
declare const STYLES: string[];
declare const SCRIPTS: string[];

const app = express();
const server = require('http').createServer(app);

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', join(DIST_PATH, './views'));

if (NG_PROXY) {
  const proxy = require('http-proxy').createProxyServer({
    target: `http://localhost:${NG_PORT}`,
    ws: true
  });
  app.get('*.*', (req, res) => proxy.web(req, res, {}));

  server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));
} else {
  app.get('*.*', express.static(join(DIST_PATH, 'browser'), {
    maxAge: '1y'
  }));
}


const { createAppRouter } = require(SSR_ENABLED ? './app-router/app-router-ssr' : './app-router/app-router');
app.use(createAppRouter({
  scripts: SCRIPTS,
  styles: STYLES
} as AppRouterOptions));

server.listen(PORT, (err) => {
  if (err) {
    console.error('Cannot start Node server', err);
    return;
  }
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
