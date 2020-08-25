import { homePageComponent } from './conponents/home-page.component';
import { notFoundPageComponent } from './conponents/404-page.componennt';

export const appRoutes = [
  { path: '', component: notFoundPageComponent },
  { path: ['/'], component: homePageComponent },
];
