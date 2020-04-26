import { Component } from '../lib';

class AppComponent extends Component {
}

export const appComponent = new AppComponent({
  selector: '#main-container',
  template: require('./pages/html/index.html'),
});
