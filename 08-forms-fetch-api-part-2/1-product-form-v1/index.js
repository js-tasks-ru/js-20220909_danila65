/* eslint-disable indent */
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  name;
  description;
  images = [];
  category;
  price;
  discount;
  count;
  status;
  subElements;

  constructor(productId) {
    this.productId = productId;

    this.mode = this.productId ? "edit" : "create";
    this.event = new CustomEvent(
      this.mode === "edit" ? "product-updated" : "product-saved",
      { bubbles: true, detail: this.mode }
    );
  }

  async render() {
    const categories = await this.fetchCategories();
    const product = await this.fetchProduct(this.productId);

    const formWrap = document.createElement("div");
    formWrap.classList.add("product-form");
    formWrap.innerHTML = this.getForm({ categories, product });

    this.element = formWrap;
    this.subElements = this.getSubElements(this.element);

    this.initListeners();
  }

  getNameSection(title) {
    return `<div class="form-group form-group__half_left">
    <fieldset>
      <label class="form-label" for="title">Название товара</label>
      <input
        required=""
        type="text"
        name="title"
        id="title"
        class="form-control"
        placeholder="Название товара"
        value='${title}'
      />
    </fieldset>
  </div>`;
  }

  getDescriptionSection(description) {
    return `
    <div class="form-group form-group__wide">
    <label class="form-label" for="description">Описание</label>
    <textarea
      required=""
      id="description"
      class="form-control"
      name="description"
      data-element="productDescription"
      placeholder="Описание товара"
    >${description}</textarea>
  </div>`;
  }

  getImageSection(images) {
    return `
    <div
    class="form-group form-group__wide"
    data-element="sortable-list-container"
  >
    <label class="form-label">Фото</label>
    <div data-element="imageListContainer">
      <ul class="sortable-list">
        ${images.map((photo) => this.getPhotoCard(photo)).join("")}
      </ul>
    </div>
    <button
    type="button"
    name="uploadImage"
    class="button-primary-outline"
    data-element="uploadImage"
    >
    <span>Загрузить</span>
    </button>

  </div>`;
  }

  getPhotoCard({ source, url }) {
    return `
    <li
      class="products-edit__imagelist-item sortable-list__item"
      style=""
      data-url="${url}"
      data-source="${source}"
    >
      <input
        type="hidden"
        name="url"
        value="${url}"
      />
      <input
        type="hidden"
        name="source"
        value="${source}"
      />
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab" />
        <img
          class="sortable-table__cell-img"
          alt="Image"
          src="${url}"
        />
        <span
          >${source}</span
        >
      </span>
      <button type="button">
        <img
          src="icon-trash.svg"
          data-delete-handle=""
          alt="delete"
        />
      </button>
    </li>`;
  }

  getCategorySection(categories) {
    return `
    <div class="form-group form-group__half_left">
    <label class="form-label">Категория</label>
    <select class="form-control" name="subcategory" id="category">
      ${categories
        .map((category) =>
          category.subcategories
            .map((subcategory) => this.getCategory(category, subcategory))
            .join("")
        )
        .join("")}
    </select>
  </div>
    `;
  }

  getCategory(category, subcategory) {
    return `
    <option value="${subcategory.id}">
      ${category.title} &gt; ${subcategory.title}
    </option>`;
  }

  getPriceSection({ price, discount }) {
    return `
    <div class="form-group form-group__half_left form-group__two-col">
    <fieldset>
      <label class="form-label" for="price">Цена ($)</label>
      <input
        required=""
        type="number"
        name="price"
        class="form-control"
        placeholder="100"
        id="price"
        value='${price}'
      />
    </fieldset>
    <fieldset>
      <label class="form-label" for="discount">Скидка ($)</label>
      <input
        required=""
        type="number"
        name="discount"
        id="discount"
        class="form-control"
        placeholder="0"
        value='${discount}'
      />
    </fieldset>
  </div>
    `;
  }

  getCountSection(quantity) {
    return `
    <div class="form-group form-group__part-half">
      <label class="form-label" for="count">Количество</label>
      <input
        id="count"
        required=""
        type="number"
        class="form-control"
        name="quantity"
        placeholder="1"
        value='${quantity}'
      />
    </div>
    `;
  }

  getStatusSection(status) {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label" for="status">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1" ${status === 1 ? "selected" : ""}>Активен</option>
          <option value="0" ${status === 0 ? "selected" : ""}>Неактивен</option>
        </select>
      </div>`;
  }

  getButtonSection() {
    return `
    <div class="form-buttons">
      <button type="submit" name="save" class="button-primary-outline">
        Сохранить товар
      </button>
    </div>`;
  }

  getForm({ categories, product }) {
    const { title, description, price, discount, quantity, status, images } =
      product[0];
    return `<form data-element="productForm" class="form-grid">
      ${this.getNameSection(title)}
      ${this.getDescriptionSection(description)}
      ${this.getImageSection(images)}
      ${this.getCategorySection(categories)}
      ${this.getPriceSection({ price, discount })}
      ${this.getCountSection(quantity)}
      ${this.getStatusSection(status)}
      ${this.getButtonSection()}
    </form>`;
  }

  async fetchCategories() {
    const url = new URL(BACKEND_URL);
    url.pathname = "/api/rest/categories";
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");
    const { href } = url;

    const response = await fetchJson(href);
    return response;
  }

  async fetchProduct(id) {
    const url = new URL(BACKEND_URL);
    url.pathname = "/api/rest/products";
    url.searchParams.set("id", id);

    const { href } = url;

    const response = await fetchJson(href);
    return response;
  }

  initListeners() {
    const { productForm, imageListContainer, uploadImage } = this.subElements;

    const titleInput = productForm.querySelector("#title");
    const descriptionText = productForm.querySelector("#description");
    const categorySelect = productForm.querySelector("#description");

    const statusSelect = productForm.querySelector("#status");
    const priceInput = productForm.querySelector("#price");
    const discountInput = productForm.querySelector("#discount");
    const countInput = productForm.querySelector("#count");

    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.title = titleInput.value;
      this.description = descriptionText.textContent;
      this.category = categorySelect.value;

      this.price = priceInput.value;
      this.discount = discountInput.value;
      this.count = countInput.value;
      this.status = statusSelect.value;

      Array.from(imageListContainer.firstElementChild.children).forEach(
        (el) => {
          this.images.push({ url: el.dataset.url, source: el.dataset.source });
        }
      );

      const data = {
        title: this.title,
        description: this.description,
        subcategory: this.category,
        price: +this.price,
        discount: +this.discount,
        quantity: +this.count,
        status: +this.status,
        images: this.images,
        id: this.productId,
      };

      await this.save(data);
      e.target.dispatchEvent(this.event);
    });

    uploadImage.addEventListener("click", this.uploadImage);

    imageListContainer.addEventListener("click", (e) => {
      if ("deleteHandle" in e.target.dataset) {
        e.target.closest("li").remove();
      }
    });
  }

  save = async (data) => {
    try {
      const response = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

    } catch (e) {
      console.error(e);
    }
  };

  getSubElements(parentElem) {
    const result = {};
    const elements = parentElem.querySelectorAll("[data-element]");

    Array.from(elements).forEach((subElement) => {
      result[subElement.dataset.element] = subElement;
    });

    return result;
  }

  uploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
      try {
        const [file] = input.files;

        const result = await this.upload(file);

        const url = result.data.link;
        const source = url.split("/").at(-1);

        const newPhotoItem = this.getPhotoCard({ source, url });
        const wrap = document.createElement("div");
        wrap.innerHTML = newPhotoItem;
        this.subElements.imageListContainer.firstElementChild.append(
          wrap.firstElementChild
        );
      } catch (e) {
        console.error("Error", e);
      } finally {
        console.log("completed");
      }
    };
    input.click();
  };

  upload = async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    try {
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: "",
      });

      return await response.json();
    } catch (e) {
      return Promise.reject(e);
    }
  };

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
