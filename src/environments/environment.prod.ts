export const environment = {
  production: true,
  serverBaseUrl: 'sapphire-db-docs-server.azurewebsites.net',
  useSsl: true,
  ...(window as any).angularEnvironment
};
