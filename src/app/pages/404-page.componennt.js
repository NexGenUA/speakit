import { Component } from '../../lib';

class NotFoundPageComponent extends Component {
}

export const notFoundPageComponent = new NotFoundPageComponent({
  selector: '#app-page-not-found',
  template: require('./html/404.html'),
  title: () => 'Page Not Found',
});
