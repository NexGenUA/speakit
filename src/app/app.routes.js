import { homePageComponent } from './pages/home-page.component';
import { notFoundPageComponent } from './pages/404-page.componennt';

export const appRoutes = [
  { path: '', component: notFoundPageComponent },
  { path: ['/'], component: homePageComponent },
];
