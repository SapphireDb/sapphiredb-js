require('zone.js/dist/zone-node');
require('./ssr-polyfills');

const {join} =  require('path');

const express = require('express');
const { ngExpressEngine } = require('@nguniversal/express-engine');
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

const app = express();

const DIST_FOLDER = join(process.cwd());

var { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(join(DIST_FOLDER, 'server', 'main'));

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

app.get('/sapphire/*', (req, res) => {
  res.status(404).send('data requests are not supported');
});

app.get('*', (req, res) => {
  res.render('index', { req, res });
  console.log(`new GET request at : ${req.originalUrl}`);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Angular server started on port ${port}`);
});
