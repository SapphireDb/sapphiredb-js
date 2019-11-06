import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { hmrBootstrap } from './hmr';

declare const module: any;

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (module.hot) {
  hmrBootstrap(module, bootstrap);
} else {
  bootstrap();
}
