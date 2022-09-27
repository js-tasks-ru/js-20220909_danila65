/* eslint-disable indent */
export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.subElements = {};

    this.render();
  }

  render() {
    const tableRoot = document.createElement("div");
    tableRoot.classList.add('sortable-table');
    const header = this.renderHeader();
    const body = this.renderBody();
    tableRoot.append(header);
    tableRoot.append(body);
    this.element = tableRoot;
    this.subElements.header = header;
    this.subElements.body = body;
  }

  renderHeader({field = '', order = ''} = {}) {
    const headerContent = `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig
          .map((column) => {
            return `
            <div class="sortable-table__cell"
              data-id="${column.id}" 
              data-sortable="${column.sortable}" 
              ${column.id === field ? `data-order=${order}` : ''}
            >
              <span>${column.title}</span>
              ${column.id === field ? `
                <span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
                </span>
              ` : ''}
            </div>
          `;
          })
          .join("")}
      </div>
    `;

    return this.contentToElement(headerContent);
  }

  renderBody() {
    const content = `
    <div data-element="body" class="sortable-table__body">
        ${this.data
          .map((row) => {  
            return `<a class="sortable-table__row" href="#">    
          ${this.headerConfig
            .map((column) => {
              if (column.template) {
                return column.template(this.data);
              }

              return `
                <div class="sortable-table__cell">${row[column.id]}</div>
              `;
            })
            .join("")}
          </a>`;
          })
          .join("")}
    </div>
    `;

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

      if (order === "asc") {
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueA - valueB;
        }

        return valueA.localeCompare(valueB, ["ru", "en"], { caseFirst: "upper" });
      }
  
      if (order === "desc") {
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueB - valueA;
        }

        return valueB.localeCompare(valueA, ["ru", "en"], { caseFirst: "upper" });
      }
    });
    
    this.data = res;
    this.rerender({field, order});
  }

  rerender({field, order}) {
    const tableRoot = document.querySelector('.sortable-table');
    tableRoot.innerHTML = '';
    const header = this.renderHeader({field, order});
    const body = this.renderBody();
    tableRoot.append(header);
    tableRoot.append(body);
    this.element = tableRoot;
    this.subElements.header = header;
    this.subElements.body = body;
  }

  destroy() {
    const tableRoot = document.querySelector('.sortable-table');
    if (tableRoot) {
      tableRoot.remove();
    }
  }
}
