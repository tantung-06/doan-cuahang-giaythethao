// === CHI TIẾT SẢN PHẨM ===
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
    detail.onclick = e => { if (!container.contains(e.target)) detail.style.display = 'none'; };
});
document.querySelectorAll('.close').forEach(btn => {
    btn.onclick = () => {
        const pd = btn.closest('.product-detail');
        const lr = btn.closest('.login-register');
        if (pd) pd.style.display = 'none';
        if (lr) lr.style.display = 'none';
    };
});

const productContainer = document.getElementById('product-container');

// Fetch sản phẩm từ JSON
fetch('./json/product.json')
  .then(res => res.json())
  .then(products => {
    products.forEach(product => {
      // === Tạo product-item ===
      const productItem = document.createElement('div');
      productItem.className = 'product-list';
      productItem.dataset.category = product.category.join(' ');
      productItem.innerHTML = `
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
      productContainer.appendChild(productItem);

      // === Tạo product-detail ===
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
              <label for="size">Kích thước:</label>
              <select class="size">
                <option value="38">38</option>
                <option value="39">39</option>
                <option value="40">40</option>
                <option value="41">41</option>
                <option value="42">42</option>
              </select>
            </div>
            <div class="product-quantity">
              <label for="quantity">Số lượng:</label>
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

    // === Khởi tạo chi tiết sản phẩm ===
    initProductDetail();
  })
  .catch(err => console.error('Lỗi load sản phẩm:', err));

// === Hàm xử lý chi tiết sản phẩm ===
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
      if (pd) pd.style.display = 'none';
    };
  });
}

// === LỌC SẢN PHẨM ===
function filterProducts() {
    const products = document.querySelectorAll('.product-list'); // Lấy mới mỗi lần lọc
    const selectedCategories = [...document.querySelectorAll('.category:nth-child(1) input:checked')].map(cb => cb.id);
    const selectedBrands = [...document.querySelectorAll('.category:nth-child(2) input:checked')].map(cb => cb.id);
    const selectedPrices = [...document.querySelectorAll('.category:nth-child(3) input:checked')].map(cb => cb.labels[0].innerText);

    let visibleCount = 0; // đếm sản phẩm hiển thị

    products.forEach(product => {
        const categories = product.dataset.category.split(' ');
        const brand = product.querySelector('.product-company')
            .innerText.trim().toLowerCase().replace(/\s+/g, '-');
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
        if (show) visibleCount++;
    });

    // === Hiển thị dòng "Không có sản phẩm" nếu không có sản phẩm nào ===
    const noProductDiv = document.querySelector('.container-right .no-product');
    if (noProductDiv) {
        noProductDiv.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// Gắn event
document.querySelectorAll('.search-filter-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', filterProducts);
});