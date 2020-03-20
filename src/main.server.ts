import {enableProdMode} from '@angular/core';
import 'linq4js';

enableProdMode();

export { AppServerModule } from './app/app.server.module';

export { renderModule, renderModuleFactory } from '@angular/platform-server';
