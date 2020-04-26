import { router } from '../tools/router';

const setActiveLink = () => {
  for (const link of document.querySelectorAll('.menu a')) {
    if (link.pathname === window.location.pathname) {
      link.classList.add('active-menu-link');
    } else {
      link.classList.remove('active-menu-link');
    }
  }
};

export class MainModule {
  constructor(config) {
    this.components = config.components;
    this.mainComponent = config.main;
    this.routes = config.routes;
  }

  start() {
    this.init();
    if (this.routes) this.initRoutes();
  }

  init() {
    this.mainComponent.render();
    this.components.forEach(this.renderComponent.bind(this));
    this.renderRoute();
  }

  initRoutes() {
  }

  renderRoute() {
    const url = router.getUrl();
    let route = this.routes.find(r => r.path.includes(url));
    if (!route) route = this.routes[0];
    document.querySelector('#router-outlet').innerHTML = `<div id="${route.component.selector.slice(1)}"></div>`;
    document.title = route.component.title();
    this.renderComponent(route.component);
    setActiveLink();
  }

  renderComponent(c) {
    c.render();
    if (c.onLoad) c.onLoad();
  }
}
