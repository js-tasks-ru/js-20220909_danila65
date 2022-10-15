import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  elements;
  subElements;
  components;
  url = new URL("api/dashboard/bestsellers", BACKEND_URL);

  render() {
    const elem = document.createElement("div");

    elem.innerHTML = this.template;

    this.element = elem.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.createComponents();
    this.renderComponents();
    this.initListeners();

    return this.element;
  }

  createComponents() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = new Date();

    const rangePicker = new RangePicker({
      from,
      to,
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=30&from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc`,
      isSortLocally: true,
    });

    const ordersChart = new ColumnChart({
      label: "Заказы",
      url: "api/dashboard/orders",
      link: "",
      range: {
        from,
        to,
      },
    });

    const salesChart = new ColumnChart({
      label: "Продажи",
      url: "api/dashboard/sales",
      link: "",
      formatHeading: (d) => `${d}$`,
      range: {
        from,
        to,
      },
    });

    const customersChart = new ColumnChart({
      label: "Клиенты",
      url: "api/dashboard/customers",
      link: "",
      range: {
        from,
        to,
      },
    });

    this.components = {
      rangePicker,
      sortableTable,
      ordersChart,
      salesChart,
      customersChart,
    };
  }

  renderComponents() {
    Object.entries(this.components).forEach(([key]) => {
      const root = this.subElements[key];
      const { element } = this.components[key];

      root.append(element);
    });
  }

  get template() {
    return `
      <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }

  async update({ from, to }) {
    const data = await this.fetchData(this.url);

    this.components.sortableTable.update(data);

    this.components.ordersChart.update(from, to);
    this.components.customersChart.update(from, to);
    this.components.salesChart.update(from, to);
  }

  fetchData({ from, to }) {
    this.url.searchParams.set("_start", "1");
    this.url.searchParams.set("_end", "30");
    this.url.searchParams.set("_order", "asc");
    this.url.searchParams.set("_sort", "title");

    this.url.searchParams.set("from", from.toISOString());
    this.url.searchParams.set("to", to.toISOString());

    return fetchJson(this.url);
  }

  initListeners() {
    this.components.rangePicker.element.addEventListener("data-select", (e) => {
      const { from, to } = e.detail;

      this.update({ from, to });
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.element = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
