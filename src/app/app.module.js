import { MainModule } from '../lib';
import { appComponent } from './app.component';
import { appMainPage } from './conponents/main-page.component';
import { appRoutes } from './app.routes';

class AppModule extends MainModule {
}

export const appModule = new AppModule({
  components: [
    appMainPage,
  ],
  main: appComponent,
  routes: appRoutes,
});
