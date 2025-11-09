// === LẤY PHẦN TỬ CHÍNH ===
const productContainer = document.getElementById('product-container');

// === FETCH SẢN PHẨM TỪ JSON ===
fetch('./json/product.json')
  .then(res => res.json())
  .then(products => {
    if (!Array.isArray(products)) throw new Error('Dữ liệu sản phẩm không hợp lệ');

    products.forEach(product => {
      // --- Tạo sản phẩm ---
      const item = document.createElement('div');
      item.className = 'product-list';
      item.dataset.category = product.category.join(' ');
      item.setAttribute('data-filtered', 'visible');
      item.innerHTML = `
        <div class="product-item" data-id="${product.id}">
          <img class="product-img" src="${product.img}" alt="${product.name}">
          <h4 class="product-name">${product.name}</h4>
          <p class="product-company">${product.company}</p>
          <div class="price">
            <span class="price-old">${product.priceOld}</span>
            <span class="price-current">${product.priceCurrent}</span>
          </div>
        </div>
      `;
      productContainer.appendChild(item);

      // --- Tạo chi tiết sản phẩm ---
      const detail = document.createElement('div');
      detail.className = 'product-detail';
      detail.dataset.id = product.id;
      detail.style.display = 'none';
      detail.innerHTML = `
        <div class="product-detail-container">
          <div class="close"><i class="fa-solid fa-xmark"></i></div>
          <img src="${product.img}" alt="${product.name}">
          <div class="product-info">
            <p class="product-company">${product.company}</p>
            <h4 class="product-name">${product.name}</h4>
            <div class="price">
              <span class="price-current">${product.priceCurrent}</span>
              <span class="price-old">${product.priceOld}</span>
            </div>
            <div class="product-size">
              <label>Kích thước:</label>
              <select class="size">
                <option>38</option><option>39</option><option>40</option>
                <option>41</option><option>42</option>
              </select>
            </div>
            <div class="product-quantity">
              <label>Số lượng:</label>
              <input type="text" class="quantity" value="1" min="1">
            </div>
            <div class="product-buttons">
              <button class="buy-now">MUA NGAY</button>
              <button class="add-cart">THÊM VÀO GIỎ HÀNG</button>
            </div>
          </div>
        </div>
      `;
      productContainer.appendChild(detail);
    });

    initProductDetail();
    filterProducts();
  })
  .catch(err => { /* Xử lý lỗi nếu cần */ });

// === HÀM KHỞI TẠO CHI TIẾT SẢN PHẨM ===
function initProductDetail() {
  document.querySelectorAll('.product-item').forEach(item => {
    item.onclick = () => {
      const id = item.dataset.id;
      document.querySelectorAll('.product-detail').forEach(d => d.style.display = 'none');
      const target = document.querySelector(`.product-detail[data-id="${id}"]`);
      if (target) target.style.display = 'flex';
    };
  });

  document.querySelectorAll('.product-detail').forEach(detail => {
    const container = detail.querySelector('.product-detail-container');
    detail.onclick = e => {
      if (!container.contains(e.target)) detail.style.display = 'none';
    };
  });

  document.querySelectorAll('.close').forEach(btn => {
    btn.onclick = () => {
      const pd = btn.closest('.product-detail');
      const lr = btn.closest('.login-register');
      if (pd) pd.style.display = 'none';
      if (lr) lr.style.display = 'none';
    };
  });
}

// === HÀM LỌC SẢN PHẨM ===
function filterProducts() {
  const products = document.querySelectorAll('.product-list');
  const selectedCategories = [...document.querySelectorAll('.category:nth-child(1) input:checked')].map(cb => cb.id);
  const selectedBrands = [...document.querySelectorAll('.category:nth-child(2) input:checked')].map(cb => cb.id);
  const selectedPrices = [...document.querySelectorAll('.category:nth-child(3) input:checked')].map(cb => cb.nextElementSibling.innerText);

  let visibleCount = 0;

  products.forEach(product => {
    const categories = product.dataset.category.split(' ');
    const brand = product.querySelector('.product-company').innerText.trim().toLowerCase().replace(/\s+/g, '-');
    const price = parseInt(product.querySelector('.price-current').innerText.replace(/[^\d]/g, ''));
    let show = true;

    if (selectedCategories.length && !selectedCategories.some(cat => categories.includes(cat))) show = false;
    if (selectedBrands.length && !selectedBrands.includes(brand)) show = false;

    if (selectedPrices.length) {
      const match = selectedPrices.some(range => {
        if (range.includes('Dưới')) return price < 500000;
        if (range.includes('500.000₫ - 1.000.000₫')) return price >= 500000 && price <= 1000000;
        if (range.includes('1.000.000₫ - 2.000.000₫')) return price >= 1000000 && price <= 2000000;
        if (range.includes('2.000.000₫ - 3.000.000₫')) return price >= 2000000 && price <= 3000000;
        if (range.includes('3.000.000₫ - 4.000.000₫')) return price >= 3000000 && price <= 4000000;
        if (range.includes('4.000.000₫ - 5.000.000₫')) return price >= 4000000 && price <= 5000000;
        if (range.includes('Trên')) return price > 5000000;
      });
      if (!match) show = false;
    }

    product.style.display = show ? 'block' : 'none';
    product.setAttribute('data-filtered', show ? 'visible' : 'hidden');
    if (show) visibleCount++;
  });

  const noProductDiv = document.querySelector('.container-right .no-product');
  if (noProductDiv) noProductDiv.style.display = visibleCount === 0 ? 'block' : 'none';

  // Reset phân trang
  if (typeof window.resetPagination === 'function') {
    setTimeout(() => { window.resetPagination(); }, 50);
  }
}

// === GẮN SỰ KIỆN LỌC ===
document.querySelectorAll('.search-filter-item input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', filterProducts);
});

// Export để dùng ở file khác
window.filterProducts = filterProducts;