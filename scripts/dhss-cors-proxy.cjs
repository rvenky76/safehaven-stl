#!/usr/bin/env node
/**
 * Dev-only CORS proxy for the SafeHaven WEB build.
 * Re-serves the MO DHSS Cooling Center ArcGIS query with permissive CORS.
 * Native (Android/iOS) hits the service directly and needs no proxy.
 *
 * Usage:  node scripts/dhss-cors-proxy.cjs      # 127.0.0.1:8790
 * Point the web build at it:
 *   EXPO_PUBLIC_DHSS_URL=http://127.0.0.1:8790/query
 */
const http = require('http');
const https = require('https');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 8790);
const UPSTREAM = 'https://gis.mo.gov/arcgis/rest/services/DHSS/Cooling_Center/MapServer/0/query';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

http
  .createServer((req, res) => {
    if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    https
      .get(UPSTREAM + qs, (up) => {
        res.writeHead(up.statusCode || 502, {
          ...CORS,
          'Content-Type': up.headers['content-type'] || 'application/json',
        });
        up.pipe(res);
      })
      .on('error', (e) => {
        res.writeHead(502, { ...CORS, 'Content-Type': 'text/plain' });
        res.end('upstream error: ' + e.message);
      });
  })
  .listen(PORT, HOST, () => console.log(`DHSS CORS proxy on http://${HOST}:${PORT}/query -> ${UPSTREAM}`));
