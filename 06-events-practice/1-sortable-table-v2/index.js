/* eslint-disable indent */
export default class SortableTable {
  constructor(headerConfig = [], { data = [], sorted = {} } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.subElements = {};
    this.sorted = sorted;
    this.isSortLocally = true;

    this.render();
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

    const sortedData = this.sortData(this.sorted.id, this.sorted.order);
    const allColumns = this.element.querySelectorAll(
      ".sortable-table__cell[data-id]"
    );
    const currentColumn = this.element.querySelector(
      `.sortable-table__cell[data-id="${this.sorted.id}"]`
    );

    Array.from(allColumns).forEach((column) => {
      column.dataset.order = "";
    });

    currentColumn.dataset.order = this.sorted.order;

    this.subElements.body.innerHTML = this.getBodyRows(sortedData);

    this.addSortListener();
  }

  renderHeader() {
    const headerContent = `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map((column) => this.getHeaderRow(column)).join("")}
      </div>
    `;

    return this.contentToElement(headerContent);
  }

  getHeaderRow({ id, sortable, title }) {
    const order = this.sorted.id === id ? this.sorted.order : '';

    return `<div class="sortable-table__cell"
    data-id="${id}" 
    data-sortable="${sortable}"
    data-order="${order}"
  >
    <span>${title}</span>
    ${this.getHeaderArrow(id)}
  </div>`;
  }

  getHeaderArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : "";

    if (!isOrderExist) {
      return "";
    }

    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  renderBody() {
    const content = `
    <div data-element="body" class="sortable-table__body">${this.getBodyRows(
      this.data
    )}</div>
    `;

    return this.contentToElement(content);
  }

  getBodyRows(data = []) {
    return data
      .map((row) => {
        return `
          <a class="sortable-table__row" href="#">${this.getBodyRow(row)}</a>`;
      })
      .join("");
  }

  getBodyRow(row) {
    return this.headerConfig
      .map(({ id, template }) => {
        if (template) {
          return template(row[id]);
        }

        return `<div class="sortable-table__cell">${row[id]}</div>`;
      })
      .join("");
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

  sortData(field, order) {
    const copyArr = [...this.data];

    const res = copyArr.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      const { sortType } = this.headerConfig.find((el) => el.id === field);
      const directions = {
        asc: 1,
        desc: -1,
      };
      const direction = directions[order];

      switch (sortType) {
        case "number":
          return direction * (valueA - valueB);
        case "string":
          return (
            direction *
            valueA.localeCompare(valueB, ["ru", "en"], {
              caseFirst: "upper",
            })
          );
        default:
          console.error("Unexpected field for sorting!");
      }
    });

    return res;
  }

  getSubElements(parentElem) {
    const result = {};
    const elements = parentElem.querySelectorAll("[data-element]");

    Array.from(elements).forEach((subElement) => {
      result[subElement.dataset.element] = subElement;
    });

    return result;
  }

  addSortListener() {
    this.subElements.header.addEventListener("pointerdown", this.headerClickHandler);
  }

  headerClickHandler = (e) => {
    const column = e.target.closest('[data-sortable="true"]');

    if (column) {
      const { id } = column.dataset;
      this.sorted.order = this.changeOrder(this.sorted.order);
      const sortedData = this.sortData(id, this.sorted.order);
      const arrow = column.querySelector("sortable-table__sort-arrow");

      column.dataset.order = this.sorted.order ;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getBodyRows(sortedData);
    }
  };

  changeOrder(prevOrder) {
    if (prevOrder === "asc") {
      return "desc";
    }

    return "asc";
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
