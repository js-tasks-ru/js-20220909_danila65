export default class NotificationMessage {
  constructor(message, { duration = 2000, type = 'error'} = {}) {
    this.message = message;
    this.animationProp = {
      duration,
      type,
    };
    this.duration = duration;
    this.type = type;

    this.show();
  }

  static hasNotification = false;
  static id = Math.random().toString(36).substring(2, 7);
  static interval = null;

  show(additionalEl = '') {
    const template = `
    <div class="notification ${this.animationProp.type}" style="--value:${
      this.animationProp.duration / 1000
    }s" id="${NotificationMessage.id}">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.animationProp.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>
    `;

    const wrapper = document.createElement("div");

    if (additionalEl) { 
      additionalEl.innerHTML = template;
      wrapper.append(additionalEl);
    } else {
      wrapper.innerHTML = template;
    }

    if (NotificationMessage.hasNotification === true) {
      const currentEl = document.getElementById(NotificationMessage.id);
      currentEl.remove();
      currentEl.style.display = 'none';
      clearInterval(NotificationMessage.interval);
    }

    const content = wrapper.firstElementChild;
    this.element = content;
    document.body.append(content);
    NotificationMessage.hasNotification = true;

    NotificationMessage.interval = setTimeout(() => {
      this.remove();
    }, this.animationProp.duration);
  }

  remove() {
    const currentEl = document.getElementById(NotificationMessage.id);
    currentEl.remove();
    NotificationMessage.hasNotification = false;
  }

  destroy() {
    const currentEl = document.getElementById(NotificationMessage.id);
    if (currentEl) {
      currentEl.remove();
      NotificationMessage.hasNotification = false;
      clearInterval(NotificationMessage.interval);
    }
  }
}
