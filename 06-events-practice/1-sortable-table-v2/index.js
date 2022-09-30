export default class SortableTable {
  constructor(headerConfig = [], { data = [], sorted = {} } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.subElements = {};
    this.sorted = sorted;
    this.isSortLocally = true;

    this.render();
    this.sort(this.sorted.id, this.sorted.order);
  }

  render() {
    const tableRoot = document.createElement("div");
    tableRoot.classList.add("sortable-table");
    const header = this.renderHeader();
    const body = this.renderBody();
    tableRoot.append(header);
    tableRoot.append(body);
    this.element = tableRoot;

    this.subElements = this.getSubElements(this.element);
    this.addSortListener();
  }

  renderHeader({ field = "", order = "" } = {}) {
    const headerContent = `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig
          .map((column) => {
            return `
            <div class="sortable-table__cell"
              data-id="${column.id}" 
              data-sortable="${column.sortable}" 
              ${column.id === field ? `data-order=${order}` : ""}
            >
              <span>${column.title}</span>
              ${
                column.id === field
                  ? `
                <span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
                </span>
              `
                  : ""
              }
            </div>
          `;
          })
          .join("")}
      </div>
    `;

    return this.contentToElement(headerContent);
  }

  renderBody() {
    const content = `<div data-element="body" class="sortable-table__body">${this.data
      .map((row) => {
        return `<a class="sortable-table__row" href="#">${this.headerConfig
          .map((column) => {
            if (column.template) {
              return column.template(this.data);
            }

            return `<div class="sortable-table__cell">${row[column.id]}</div>`;
          })
          .join("")}</a>`;
      })
      .join("")}</div>`;

    return this.contentToElement(content);
  }

  renderLoading() {
    const content = `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;

    return this.contentToElement(content);
  }

  renderPlaceholder() {
    const content = `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>`;

    return content;
  }

  contentToElement(contentString) {
    const wrap = document.createElement("div");
    wrap.innerHTML = contentString;
    return wrap.firstElementChild;
  }

  sort(field, order) {
    const copyArr = [...this.data];

    const res = copyArr.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      const sortType = this.headerConfig.find(el => el.id === field).sortType;

      if (order === "asc") {
        if (sortType === 'number') {
          return valueA - valueB;
        }

        return valueA.localeCompare(valueB, ["ru", "en"], {
          caseFirst: "upper",
        });
      }

      if (order === "desc") {
        if (sortType === 'number') {
          return valueB - valueA;
        }

        return valueB.localeCompare(valueA, ["ru", "en"], {
          caseFirst: "upper",
        });
      }
    });

    this.data = res;
    this.rerender({ field, order });
  }

  rerender({ field, order }) {
    this.updateHeader({ field, order });

    const body = this.renderBody();
    this.subElements.body.innerHTML = "";
    Array.from(body.children).forEach((bodyItem) => {
      this.subElements.body.append(bodyItem);
    });

    this.subElements = this.getSubElements(this.element);
  }

  updateHeader({ field, order }) {
    Array.from(this.subElements.header.children).forEach((headerChild) => {
      headerChild.dataset.order = order;
      if (headerChild.children.length > 1) {
        headerChild.children[1].remove();
      }

      if (headerChild.dataset.id === field) {
        const spanContent = `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`;
        const spanArrow = this.contentToElement(spanContent);
        headerChild.append(spanArrow);
      }
    });
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.removeSortListener();
    }
  }

  getSubElements(parentElem) {
    const result = {};

    Array.from(parentElem.children).forEach((childElem) => {
      result[childElem.dataset.element] = childElem;
    });

    return result;
  }

  addSortListener() {
    this.subElements.header.addEventListener(
      "click",
      this.headerClickHandler.bind(this)
    );
  }
  removeSortListener() {
    this.subElements.header.removeEventListener(
      "click",
      this.headerClickHandler.bind(this)
    );
  }

  headerClickHandler(e) {
    const invokeSortFromHandler = (sortedField) => {
      if (this.sorted.id === sortedField) {
        this.sorted.order = this.changeOrder(this.sorted.order);
        this.sort(this.sorted.id, this.sorted.order);
        return;
      }

      this.sorted.order = this.changeOrder(this.sorted.order);
      this.sorted.id = sortedField;
      this.sort(this.sorted.id, this.sorted.order);
      return;
    };

    if (e.target.tagName.toLowerCase() === "span") {
      const sortedField = e.target.parentElement.dataset.id;
      invokeSortFromHandler(sortedField);
      return;
    }

    const sortedField = e.target.dataset.id;
    invokeSortFromHandler(sortedField);
  }

  changeOrder(prevOrder) {
    if (prevOrder === "asc") {
      return "desc";
    }

    return "asc";
  }
}
