// ================== GIỎ HÀNG HEADER ==================

// Lấy phần tử
const cartIcon = document.querySelector('.fa-cart-shopping');
const cartBox = document.querySelector('.header-cart-list');
const cartIconNotice = document.querySelector('.icon-notice');
const totalLabel = document.querySelector('.cart-total label');
const noCartImg = document.querySelector('.header-no-cart-img');
const noCartMsg = document.querySelector('.header-no-cart-msg');
const cartText = document.querySelector('#action-btn');

// ===== Toggle giỏ hàng =====
function toggleCart(e) {
    e.preventDefault();
    cartBox.style.display = cartBox.style.display === 'block' ? 'none' : 'block';
}

cartIcon.addEventListener('click', toggleCart);
cartIconNotice.addEventListener('click', toggleCart);
if (cartText) cartText.addEventListener('click', toggleCart);

// Đóng khi click ngoài giỏ
document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-cart') && !e.target.closest('.fa-cart-shopping') && !e.target.closest('.icon-notice') && !e.target.closest('#action-btn')) {
        cartBox.style.display = 'none';
    }
});

// ===== Lấy giỏ từ localStorage =====
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// ===== Lưu giỏ vào localStorage =====
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ===== Cập nhật giao diện giỏ =====
function updateCartDisplay() {
    const cart = getCart();
    const container = document.querySelector('.header-cart-list');

    // Xóa sản phẩm cũ
    container.querySelectorAll('.header-cart-list-item').forEach(item => item.remove());

    if (cart.length === 0) {
        cartIconNotice.textContent = 0;
        noCartImg.style.display = 'block';
        noCartMsg.style.display = 'block';
        totalLabel.textContent = '0₫';
        return;
    }

    let total = 0;
    cartIconNotice.textContent = cart.length;
    noCartImg.style.display = 'none';
    noCartMsg.style.display = 'none';

    cart.forEach((product, index) => {
        const div = document.createElement('div');
        div.className = 'header-cart-list-item';
        div.innerHTML = `
            <img src="${product.img}" alt="${product.name}" class="header-cart-list-img">
            <div class="header-cart-info">
                <p class="header-cart-name">${product.name}</p>
                <p class="header-cart-size">Size: ${product.size}</p>
                <div class="header-cart-price">
                    <input type="text" value="${product.qty}" min="1" class="header-cart-qty" data-index="${index}">
                    <span class="header-cart-item-price">${(product.price * product.qty).toLocaleString()}₫</span>
                </div>
            </div>
            <span class="header-cart-remove" data-index="${index}">×</span>
        `;
        container.insertBefore(div, container.querySelector('.cart-total'));
        total += product.price * product.qty;
    });

    totalLabel.textContent = total.toLocaleString() + '₫';

    // Sự kiện xóa
    container.querySelectorAll('.header-cart-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.index));
    });

    // Sự kiện cập nhật số lượng
    container.querySelectorAll('.header-cart-qty').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = e.target.dataset.index;
            const val = parseInt(e.target.value);
            if (val > 0) {
                const cart = getCart();
                cart[idx].qty = val;
                saveCart(cart);
                updateCartDisplay();
            }
        });
    });
}

// ===== Thêm sản phẩm =====
function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.name === product.name && item.size === product.size);
    if (existing) existing.qty += product.qty;
    else cart.push(product);
    saveCart(cart);
    updateCartDisplay();
}

// ===== Xóa sản phẩm =====
function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartDisplay();
}

// ===== Thêm sự kiện “THÊM VÀO GIỎ HÀNG” =====
document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const container = e.target.closest('.product-detail');
        const product = {
            name: container.querySelector('.product-name').textContent.trim(),
            img: container.querySelector('img').src,
            size: container.querySelector('.size').value,
            qty: parseInt(container.querySelector('.quantity').value),
            price: parseInt(container.querySelector('.price-current').textContent.replace(/[^\d]/g, ''))
        };
        addToCart(product);
        alert('Đã thêm vào giỏ hàng!');
    });
});

// ===== Hiển thị giỏ khi tải trang =====
document.addEventListener('DOMContentLoaded', updateCartDisplay);

