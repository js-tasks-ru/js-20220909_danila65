import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  constructor({
    label = "",
    link = "",
    formatHeading = (data) => data,
    range = {},
    url = "",
  } = {}) {
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.range = range;
    this.url = url;

    this.chartHeight = 50;

    this.render();
  }

  render() {
    const chartRoot = document.createElement("div");
    chartRoot.classList.add("column-chart");
    chartRoot.style = "--chart-height: 50";

    const titleDiv = this.createChartTitle();
    const chartContainer = this.createInitChartContainer();

    chartRoot.append(titleDiv);
    chartRoot.append(chartContainer);
    this.element = chartRoot;
    this.subElements = this.getSubElements(this.element);

    const { from, to } = this.range;
    this.update(from, to);
  }

  createChartTitle() {
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("column-chart__title");
    titleDiv.textContent = `Total ${this.label}`;

    if (this.link) {
      const link = document.createElement("a");
      link.classList.add("column-chart__link");
      link.textContent = "View all";
      link.setAttribute("href", this.link);

      titleDiv.append(link);
    }

    return titleDiv;
  }

  createInitChartContainer() {
    const chartContainer = document.createElement("div");
    chartContainer.classList.add("column-chart__container");

    const header = document.createElement("div");
    header.classList.add("column-chart__header");
    header.dataset.element = "header";

    const body = document.createElement("div");
    body.classList.add("column-chart__chart");
    body.dataset.element = "body";

    chartContainer.append(header);
    chartContainer.append(body);

    return chartContainer;
  }

  createBar({ value, measureUnit, key }) {
    const barDiv = document.createElement("div");
    barDiv.style = `--value: ${Math.floor(value * measureUnit)}`;
    barDiv.dataset.tooltip = `<div><small>${key}</small>${value}</div>`;

    return barDiv;
  }

  async update(from, to) {
    this.element.classList.add("column-chart_loading");

    const data = await this.fetchData(from, to);

    const { header, body } = this.subElements;

    const total = Object.values(data).reduce((acc, value) => {
      acc += value;
      return acc;
    }, 0);
    header.textContent = this.formatHeading(total);

    const maxBarValue = Math.max(...Object.values(data));
    const measureUnit = this.chartHeight / maxBarValue;

    Object.entries(data).forEach(([key, value]) => {
      const barEl = this.createBar({ value, measureUnit, key });
      body.append(barEl);
    });

    this.element.classList.remove("column-chart_loading");

    return data;
  }

  async fetchData(from, to) {
    const response = await fetchJson(
      `${BACKEND_URL}/${this.url}?from=${this.parseRange(
        from
      )}&to=${this.parseRange(to)}`
    );

    return response;
  }

  getSubElements(parentElem) {
    const result = {};
    const elements = parentElem.querySelectorAll("[data-element]");

    Array.from(elements).forEach((subElement) => {
      result[subElement.dataset.element] = subElement;
    });

    return result;
  }

  parseRange(rangeDate) {
    return rangeDate.toISOString().split("T")[0];
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
