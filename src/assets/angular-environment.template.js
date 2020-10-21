(function (window) {
  const env =  window.angularEnvironment || {};

  env.sapphireDb = {
    serverBaseUrl: '${BACKEND_URL}',
    useSsl: '${USE_SSL}',
    apiKey: '${API_KEY}',
    apiSecret: '${API_SECRET}'
  };

  window.angularEnvironment = env;
})(this);
