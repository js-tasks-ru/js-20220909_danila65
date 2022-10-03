import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

/* eslint-disable indent */
export default class SortableTable {
  constructor(headerConfig = [], { data = [], sorted = {}, url = "" } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.subElements = {};
    this.sorted = sorted;
    this.url = url;
    this.isSortLocally = false;

    this.sortFromServerStep = 30;
    this.startPosData = 0;
    this.endPosData = this.sortFromServerStep;

    this.isLoading = true;

    this.render();

    fetchJson(
      `${BACKEND_URL}/${this.url}?_embed=subcategory.category&_start=${this.startPosData}&_end=${this.sortFromServerStep}`
    ).then((res) => {
      this.isLoading = false;
      this.table.classList.remove('sortable-table_loading');
      this.subElements.body.innerHTML = this.getBodyRows(res);
      this.data = res;
    });
  }

  render() {
    const tableRoot = document.createElement("div");
    tableRoot.classList.add("sortable-table");
    tableRoot.classList.add('sortable-table_loading');
    this.table = tableRoot;
    const header = this.renderHeader();
    const body = this.renderBody();
    tableRoot.append(header);
    tableRoot.append(body);
    this.element = tableRoot;

    this.subElements = this.getSubElements(this.element);

    const sortedData = this.sortOnClient(this.sorted.id, this.sorted.order);
    const allColumns = this.element.querySelectorAll(
      ".sortable-table__cell[data-id]"
    );
    const currentColumn = this.element.querySelector(
      `.sortable-table__cell[data-id="${this.sorted.id}"]`
    );

    Array.from(allColumns).forEach((column) => {
      column.dataset.order = "";
    });

    if (this.sorted.order) {
      currentColumn.dataset.order = this.sorted.order;
      this.subElements.body.innerHTML = this.getBodyRows(sortedData);
    }

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
    const order = this.sorted.id === id ? this.sorted.order : "";

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
    <div data-element="body" class="sortable-table__body">${
      this.isLoading ? this.renderLoading() : this.getBodyRows(this.data)
    }</div>
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

    return content;
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

  sortOnClient(field, order) {
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
    this.subElements.header.addEventListener(
      "pointerdown",
      this.headerClickHandler
    );
  }

  headerClickHandler = async (e) => {
    const column = e.target.closest('[data-sortable="true"]');

    if (column) {
      const { id } = column.dataset;
      this.sorted.order = this.changeOrder(this.sorted.order);
      const sortedData = this.isSortLocally
        ? this.sortOnClient(id, this.sorted.order)
        : await this.sortOnServer(id, this.sorted.order);

      const arrow = column.querySelector("sortable-table__sort-arrow");

      column.dataset.order = this.sorted.order;

      if (!arrow) {
        if (!this.subElements.arrow) {
          const arrow = `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>`;

          column.append(this.contentToElement(arrow));
          this.subElements = this.getSubElements(this.element);
        } else {
          column.append(this.subElements.arrow);
        }
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

  async sortOnServer(id, order) {
    this.table.classList.add('sortable-table_loading');
    this.subElements.body.innerHTML = this.renderLoading(); 

    const paramString = `_embed=subcategory.category&_sort=${id}&_order=${order}&_start=${this.startPosData}&_end=${this.endPosData}`;
    const response = await fetchJson(
      `${BACKEND_URL}/${this.url}?${paramString}`
    );

    return response;
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
