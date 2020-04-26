export class Component {
  constructor(config) {
    this.template = config.template;
    this.selector = config.selector;
    this.title = config.title;
    this.el = null;
  }

  render() {
    this.el = document.querySelector(this.selector);
    if (!this.el) throw new Error(`Component with selector ${this.selector} not fount`);
    this.el.innerHTML = this.template;
    this.initEvents();
  }

  initEvents() {
    if (!this.events) return;

    const events = this.events();

    for (const event in events) {
      const selectorEvent = event.split(' ');
      const el = this.el.querySelector(selectorEvent[1]);
      el.addEventListener(selectorEvent[0], this[events[event]].bind(this));
    }
  }
}
