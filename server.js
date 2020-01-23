// Angular requires Zone.js
const {join} =  require('path');

require('zone.js/dist/zone-node');

const express = require('express');
const { ngExpressEngine } = require('@nguniversal/express-engine');
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

window = {
  addEventListener: function () {

  },
  Event: {
    prototype: {

    }
  },
  navigator: {
    msPointerEnabled: false
  },
  scroll: function () {

  },
  ga: function () {

  }
};

Element = {
  prototype: {
    Matches: function () {

    }
  }
};

Event = {
  prototype: {
    stopPropagation: function () {

    }
  }
};

Document = {
  prototype: {

  }
};

DocumentFragment = {
  prototype: {

  }
};

$ = function () {
  return {
    addClass: function () {

    },
    removeClass: function () {

    },
    clone: function () {
      return {
        removeClass: function () {

        },
        parent: function () {
          return {
            remove: function () {

            }
          }
        },
        checkbox: function () {
          return {
            data: function () {
              return {
                enable: function () {

                }
              }
            }
          }
        },
        one: function () {

        },
        on: function () {

        },
        removeAttr: function () {

        },
        prop: function () {

        }
      }
    },
    parent: function () {
      return {
        append: function () {

        }
      }
    }
  };
};

MutationObserver = function () {
  return {
    observe: function () {

    },
    disconnect: function () {

    }
  }
};

METRO_ANIMATION_DURATION = {};
METRO_JQUERY = {};
METRO_LOCALE = {};
METRO_WEEK_START = {};
METRO_DATE_FORMAT = {};
METRO_TIMEOUT = {};
METRO_INIT = {};
jquery_present = false;

m4q = function() {
  return {
    on: function () {

    }
  }
};

m4q.meta = function () {
  return {
    attr: function () {

    }
  }
};

m4q.extend = function() {

};

m4q.fn = {};

navigator = {

};

document = {

};

localStorage = {
  getItem: function () {

  }
};

// create express app
const app = express();

const DIST_FOLDER = join(process.cwd(), 'dist', 'DemoClient');

// import server module bundle
var { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/DemoClient/server/main');

// set up engine for .html file
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// server static files
// app.use(express.static(__dirname + '/dist/DemoClient/browser', { index: false }));
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// return rendered index.html on every request
app.get('*', (req, res) => {
  res.render('index', { req, res });
  console.log(`new GET request at : ${req.originalUrl}`);
});

// start server and listen
app.listen(3000, () => {
  console.log('Angular server started on port 3000');
});
