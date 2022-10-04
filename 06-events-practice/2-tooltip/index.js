class Tooltip {
  static instance = null;
  element = null;
  controller = new AbortController();

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  onPointerOver = (e) => {
    const currentEl = e.target.closest("[data-tooltip]");

    if (currentEl) {
      this.render(currentEl.dataset.tooltip);
      document.addEventListener("pointermove", this.onPointerMove);
    }
  }

  onPointerOut = (e) => {
    const tooltip = e.target.closest('[data-tooltip]');

    if (tooltip) {
      this.remove();
      document.removeEventListener("pointermove", this.onPointerMove);
    }
  }

  onPointerMove = (e) => {
    this.moveTooltip(e);
  };

  moveTooltip(e) {
    const padding = 10;
    const left = `${e.clientX + padding}px`;
    const top = `${e.clientY + padding}px`;

    this.element.style.left = left;
    this.element.style.top = top;
  }

  render(content) {
    const el = document.createElement("div");
    el.classList.add("tooltip");
    el.innerHTML = content;
    this.element = el;

    document.body.append(this.element);
  }

  initialize() {
    this.addListeners();
  }

  addListeners() {
    document.addEventListener("pointerover", this.onPointerOver, {
      signal: this.controller.signal,
    });
    document.addEventListener("pointerout", this.onPointerOut, {
      signal: this.controller.signal,
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.controller.abort();
  }
}

export default Tooltip;
