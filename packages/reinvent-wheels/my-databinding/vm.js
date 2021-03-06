export default class VM {
  constructor(context) {
    const root = document.querySelector(context.el);
    const observe = context.engine;
    this._watchers = {};

    this._data = observe(context.data, this._notify.bind(this));
    this._walk(root);
  }
  _walk(parent) {
    const children = parent.children;

    // Iterate array-like HTMLCollection
    Reflect.apply(Array.prototype.forEach, children, [node => {
      this._walk(node);

      const bindDataName = node.getAttribute("bind");
      const modelDataName = node.getAttribute("model");
      // TODO: handle other directives and node type
      if (modelDataName) {
        this._addUpdater(node, "value", modelDataName);

        if (node.tagName === "INPUT") {
          node.addEventListener("input", ({ target: { value } }) => {
            this._data[modelDataName] = value;
          });
        }
      } else if (bindDataName) {
        this._addUpdater(node, "textContent", bindDataName);
      }
    }]);
  }
  _notify(prop) {
    if (!this._watchers[prop]) {
      return;
    }

    // Updaters is similar to the Dep in Vue
    const updaters = this._watchers[prop];
    updaters.forEach(updater => {
      updater();
    });
  }
  _addUpdater(node, attr, prop) {
    if (!this._watchers[prop]) {
      this._watchers[prop] = [];
    }

    this._watchers[prop].push(this._updater.bind(this, node, attr, prop));
  }
  _updater(node, attr, prop) {
    // TODO: handle deep prop
    node[attr] = this._data[prop];
  }
  get data() {
    return this._data;
  }
}