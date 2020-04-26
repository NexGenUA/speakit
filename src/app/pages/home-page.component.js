import { Component } from '../../lib';

class HomePageComponent extends Component {
  onLoad() {
  }
}

export const homePageComponent = new HomePageComponent({
  selector: '#app-home-page',
  template: require('./html/home.html'),
  title: () => 'Speakit',
});
