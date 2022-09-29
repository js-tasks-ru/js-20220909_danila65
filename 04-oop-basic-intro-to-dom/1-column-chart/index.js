export default class ColumnChart {
  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = data => data,
  } = {}) {
    this.data = data || [];
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;

    this.id = Math.random().toString(36).substring(2, 7);

    this.render();
  }

  render() {
    const chartRoot = document.createElement("div");
    chartRoot.id = this.id;
    chartRoot.classList.add("column-chart");
    chartRoot.style = "--chart-height: 50";

    if (this.data.length === 0) {
      chartRoot.classList.add("column-chart_loading");
    }

    const titleDiv = this.createChartTitle();
    const chartContainer = this.createChartContainer();

    chartRoot.append(titleDiv);
    chartRoot.append(chartContainer);

    this.element = chartRoot;
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

  createChartContainer() {
    const maxBarValue = Math.max(...this.data);
    const measureUnit = this.chartHeight / maxBarValue;

    const chartContainer = document.createElement("div");
    chartContainer.classList.add("column-chart__container");

    const header = document.createElement("div");
    header.classList.add("column-chart__header");
    header.dataset.element = "header";
    header.textContent = this.formatHeading
      ? this.formatHeading(this.value)
      : this.value;

    const body = document.createElement("div");
    body.classList.add("column-chart__chart");
    body.dataset.element = "body";

    this.data.forEach(value => {
      const barEl = this.createBar({value, measureUnit, maxBarValue});
      body.append(barEl);
    });

    chartContainer.append(header);
    chartContainer.append(body);

    return chartContainer;
  }

  createBar({value, measureUnit, maxBarValue}) {
    const barDiv = document.createElement('div');
    barDiv.style = `--value: ${Math.floor(value * measureUnit)}`;
    barDiv.dataset.tooltip = `${(value / maxBarValue * 100).toFixed(0)}%`;

    return barDiv;
  }

  update(newData) {
    this.data = newData;

    this.render();
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove() {
    this.element.remove();
  }
}

