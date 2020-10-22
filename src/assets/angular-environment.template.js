(function (window) {
  const env =  window.angularEnvironment || {};

  env.serverBaseUrl = '${BACKEND_URL}';
  env.useSsl = '${USE_SSL}';

  window.angularEnvironment = env;
})(this);
