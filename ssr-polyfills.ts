window = <any>{
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

  },
  location: {

  }
};

Element = <any>{
  prototype: {
    Matches: function () {

    }
  }
};

Event = <any>{
  prototype: {
    stopPropagation: function () {

    }
  }
};

Document = <any>{
  prototype: {

  }
};

DocumentFragment = <any>{
  prototype: {

  }
};

declare let $: any;

$ = function () {
  return {
    addClass: function () {

    },
    removeClass: function () {

    },
    clone: function () {
      return {
        addClass: function () {

        },
        removeClass: function () {

        },
        parent: function () {
          return {
            remove: function () {

            },
            addClass: function () {

            }
          };
        },
        checkbox: function () {
          return {
            data: function () {
              return {
                enable: function () {

                },
                disable: function () {

                }
              };
            }
          };
        },
        input: function() {
          return {
            data: function () {
              return {
                enable: function () {

                }
              };
            }
          };
        },
        panel: function() {
          return {
            data: function () {
              return {

              };
            }
          };
        },
        progress: function() {
          return {
            data: function () {
              return {

              };
            }
          };
        },
        textarea: function() {
          return {
            data: function () {
              return {
                enable: function () {

                },
                resize: function () {

                }
              };
            }
          };
        },
        one: function () {

        },
        on: function () {

        },
        removeAttr: function () {

        },
        prop: function () {

        },
        attr: function () {

        },
        val: function () {

        },
        children: function () {
          return {
            appendTo: function () {

            }
          };
        }
      };
    },
    parent: function () {
      return {
        append: function () {

        }
      };
    },
    children: function () {
      return {
        appendTo: function () {

        }
      };
    }
  };
};

MutationObserver = <any>function () {
  return {
    observe: function () {

    },
    disconnect: function () {

    }
  };
};

declare let METRO_ANIMATION_DURATION: any;
declare let METRO_JQUERY: any;
declare let METRO_LOCALE: any;
declare let METRO_WEEK_START: any;
declare let METRO_DATE_FORMAT: any;
declare let METRO_TIMEOUT: any;
declare let METRO_INIT: any;
declare let jquery_present: any;
declare let m4q: any;

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
  };
};

m4q.meta = function () {
  return {
    attr: function () {

    }
  };
};

m4q.extend = function() {

};

m4q.fn = {};

navigator = <any>{

};

document = <any>{

};

localStorage = <any>{
  getItem: function () {

  }
};
