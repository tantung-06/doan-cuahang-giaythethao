document.addEventListener('DOMContentLoaded', () => {
  // ===== SELECTOR =====
  const paymentPage = document.querySelector('.payment');
  const paymentBackBtn = paymentPage?.querySelector('.back-btn');
  const payBtn = paymentPage?.querySelector('.submit-btn');
  const savedInfo = document.getElementById('saved-address-info');
  const newForm = document.getElementById('new-address-form');
  const termsCheckbox = document.getElementById('terms');

  // ===== MỞ / ĐÓNG THANH TOÁN =====
  const openPayment = () => {
    if (!paymentPage) return;
    paymentPage.style.display = 'block';
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const closePayment = () => {
    paymentPage.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    if (typeof updateMiniCart === 'function') updateMiniCart();
    if (typeof updateCartDetail === 'function') updateCartDetail();
  };

  paymentBackBtn?.addEventListener('click', closePayment);

  // ===== TOGGLE FORM ĐỊA CHỈ =====
  const toggleAddressForm = () => {
    const savedRadio = document.getElementById('saved-address');
    if (!savedRadio) return;
    if (savedRadio.checked) {
      savedInfo.style.display = 'block';
      newForm.style.display = 'none';
    } else {
      savedInfo.style.display = 'none';
      newForm.style.display = 'block';
    }
  };
  window.toggleAddressForm = toggleAddressForm;

  // ===== GIỎ HÀNG THEO USER =====
  const loadCart = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return [];
    return JSON.parse(localStorage.getItem('cart_' + user.email)) || [];
  };
  const saveCart = cart => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    localStorage.setItem('cart_' + user.email, JSON.stringify(cart));
  };

  // ===== CẬP NHẬT TỔNG TIỀN =====
  const updateTotal = () => {
    const items = document.querySelectorAll('.payment-item');
    let total = 0;
    items.forEach(item => {
      const price = parseInt(item.querySelector('.item-price')?.textContent.replace(/[^\d]/g, '') || '0');
      const qty = parseInt(item.querySelector('.qty-input')?.value) || 1;
      total += price * qty;
    });
    const totalAmount = document.querySelector('.total-amount');
    if (totalAmount) totalAmount.textContent = total.toLocaleString('vi-VN') + '₫';
  };

  // ===== HIỂN THỊ SẢN PHẨM THANH TOÁN =====
  const displayPaymentItems = items => {
    const table = document.querySelector('.payment-table');
    if (!table) return;

    table.querySelectorAll('.payment-item').forEach(el => el.remove());

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'payment-item';
      div.dataset.id = item.id || (item.name + '-' + item.size);
      div.innerHTML = `
        <div class="item-image"><img src="${item.img}" alt="${item.name}"></div>
        <div class="item-info">
          <h3>${item.name}</h3>
          <p class="item-size">Kích thước: <strong>${item.size || ''}</strong></p>
        </div>
        <div class="quantity-control">
          <input type="text" class="qty-input" value="${item.qty}" min="1">
        </div>
        <div class="item-price">${item.price}</div>
        <div class="item-close"><button class="close-btn">Xóa</button></div>
      `;
      table.insertBefore(div, table.querySelector('.payment-total'));
    });

    updateTotal();
  };

  // ===== MỞ THANH TOÁN TỪ CART =====
  const bindPaymentButtons = () => {
    document.querySelectorAll('.btn-pay, .checkout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cartItems = loadCart();
        if (!cartItems.length) return alert('Giỏ hàng trống!');
        displayPaymentItems(cartItems);
        toggleAddressForm();
        openPayment();
      });
    });
  };
  bindPaymentButtons();

  // ===== MUA NGAY - SỬ DỤNG EVENT DELEGATION =====
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('buy-now')) return;
    
    const product = e.target.closest('.product-detail');
    if (!product) return;
    
    const priceText = product.querySelector('.price-current')?.textContent || '0';
    const item = [{
      id: Date.now(),
      name: product.querySelector('.product-name')?.textContent || '',
      price: priceText,
      img: product.querySelector('img')?.src || '',
      qty: parseInt(product.querySelector('.quantity')?.value) || 1,
      size: product.querySelector('.size')?.value || ''
    }];
    
    displayPaymentItems(item);
    toggleAddressForm();
    
    // Đóng popup chi tiết sản phẩm
    product.style.display = 'none';
    
    openPayment();
  });

  // ===== XOÁ SẢN PHẨM =====
  document.addEventListener('click', e => {
    if (!e.target.classList.contains('close-btn')) return;
    const itemDiv = e.target.closest('.payment-item');
    const id = itemDiv.dataset.id;
    let cart = loadCart();
    cart = cart.filter(item => (item.id || (item.name + '-' + item.size)) != id);
    saveCart(cart);
    itemDiv.remove();
    updateTotal();
  });

  // ===== CẬP NHẬT SỐ LƯỢNG =====
  document.addEventListener('input', e => {
    if (e.target.classList.contains('qty-input')) updateTotal();
  });

  // ===== THANH TOÁN =====
  payBtn?.addEventListener('click', () => {
    if (!termsCheckbox.checked) return alert('Vui lòng đồng ý điều kiện giao dịch.');
    const items = document.querySelectorAll('.payment-item');
    if (!items.length) return alert('Không có sản phẩm để thanh toán.');
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert('Vui lòng đăng nhập để thanh toán!');

    // Nếu chọn địa chỉ mới, lưu vào localStorage
    const newRadio = document.getElementById('new-address');
    if (newRadio && newRadio.checked) {
      const address = {};
      const addressInputs = newForm?.querySelectorAll('input, textarea, select');
      addressInputs.forEach(input => {
        if (input.name) address[input.name] = input.value.trim();
      });
      if (!address.name || !address.phone) {
        return alert('Vui lòng điền đầy đủ thông tin địa chỉ!');
      }
      saveAddress(address);
    }
    
    saveCart([]); // xóa giỏ hàng user hiện tại
    if (typeof updateMiniCart === 'function') updateMiniCart();
    if (typeof updateCartDetail === 'function') updateCartDetail();
    
    alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng tại StepLab');
    closePayment();
    updateTotal();
  });

  // ===== HIỂN THỊ FORM ĐỊA CHỈ KHI LOAD =====
  const cart = loadCart();
  if (!cart.length) {
    savedInfo.style.display = 'none';
    newForm.style.display = 'block';
  } else {
    toggleAddressForm();
  }
});

// ===== QUẢN LÝ ĐỊA CHỈ =====
const loadSavedAddress = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return null;
  return JSON.parse(localStorage.getItem('address_' + user.email)) || null;
};

const saveAddress = address => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;
  localStorage.setItem('address_' + user.email, JSON.stringify(address));
};

// Toggle hiển thị form địa chỉ
function toggleAddressForm() {
  const savedRadio = document.getElementById('saved-address');
  const newRadio = document.getElementById('new-address');
  const savedInfo = document.getElementById('saved-address-info');
  const newForm = document.getElementById('new-address-form');
  
  if (savedRadio && savedRadio.checked) {
    const address = loadSavedAddress();
    if (address && savedInfo) {
      const nameEl = savedInfo.querySelector('.saved-info-box p:nth-child(1) strong');
      const phoneEl = savedInfo.querySelector('.saved-info-box p:nth-child(2)');
      const addressEl = savedInfo.querySelector('.saved-info-box p:nth-child(4)');
      
      if (nameEl) nameEl.textContent = address.name || 'Chưa cập nhật';
      if (phoneEl) phoneEl.textContent = 'Số điện thoại: ' + (address.phone || 'Chưa cập nhật');
      if (addressEl) addressEl.textContent = 'Địa chỉ: ' + (address.address || address.detail || 'Chưa cập nhật');
    }
    if (savedInfo) savedInfo.style.display = 'block';
    if (newForm) newForm.style.display = 'none';
  } else {
    if (savedInfo) savedInfo.style.display = 'none';
    if (newForm) newForm.style.display = 'block';
  }
}

// Event radio
window.addEventListener('load', () => {
  const savedRadio = document.getElementById('saved-address');
  const newRadio = document.getElementById('new-address');
  
  savedRadio?.addEventListener('change', toggleAddressForm);
  newRadio?.addEventListener('change', toggleAddressForm);
  
  const address = loadSavedAddress();
  if (address && savedRadio) savedRadio.checked = true;
  else if (newRadio) newRadio.checked = true;
  toggleAddressForm();
});