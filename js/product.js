document.addEventListener("DOMContentLoaded", () => {
  fetch("./json/product.json")
    .then(response => response.json())
    .then(products => {
      const productContainer = document.querySelector(".product");
      productContainer.innerHTML = ""; // Xóa HTML cứng cũ

      products.forEach(p => {
        const categories = p.category.join(" ");
        const productHTML = `
          <div class="product-list" data-category="${categories}">
            <div class="product-item" data-id="${p.id}">
              <img class="product-img" src="${p.img}" alt="${p.name}">
              <h4 class="product-name">${p.name}</h4>
              <p class="product-company">${p.company}</p>
              <div class="price">
                <span class="price-old">${p.priceOld}</span>
                <span class="price-current">${p.priceCurrent}</span>
              </div>
            </div>
          </div>
        `;
        productContainer.innerHTML += productHTML;
      });
    })
    .catch(err => console.error("Lỗi load dữ liệu:", err));
});