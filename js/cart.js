    // ================== GIỎ HÀNG ==================
    const cartIcon = document.querySelector('.fa-cart-shopping');
    const cartBox = document.querySelector('.header-cart-list');
    const cartIconNotice = document.querySelector('.icon-notice');
    const cartText = document.querySelector('#action-btn');
    const totalLabel = document.querySelector('.cart-total label');
    const noCartImg = document.querySelector('.header-no-cart-img');
    const noCartMsg = document.querySelector('.header-no-cart-msg');

    const cartDetail = document.querySelector('.cart-detail');
    const cartDetailTableBody = document.querySelector('.cart-detail-table tbody');
    const cartDetailTotalPrice = document.querySelector('.cart-detail-total-price');
    const btnViewCart = document.querySelector('.btn-view');
    const btnBackCart = document.querySelector('.back-btn');

    // --- LẤY / LƯU GIỎ HÀNG THEO USER ---
    function getCart() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return [];
        return JSON.parse(localStorage.getItem('cart_' + user.email)) || [];
    }

    function saveCart(cart) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        localStorage.setItem('cart_' + user.email, JSON.stringify(cart));
    }

    // ================== CẬP NHẬT MINI CART ==================
    function updateMiniCart() {
        const cart = getCart();
        cartBox.querySelectorAll('.header-cart-list-item').forEach(e => e.remove());

        if(cart.length === 0){
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

        cart.forEach((item, idx) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'header-cart-list-item';
            div.innerHTML = `
                <img src="${item.img}" class="header-cart-list-img">
                <div class="header-cart-info">
                    <p class="header-cart-name">${item.name}</p>
                    <p class="header-cart-size">Size: ${item.size}</p>
                    <div class="header-cart-price">
                        <input type="text" value="${item.qty}" min="1" class="header-cart-qty" data-index="${idx}">
                        <span class="header-cart-item-price" data-price="${itemTotal}">${itemTotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                </div>
                <span class="header-cart-remove" data-index="${idx}">×</span>
            `;
            cartBox.insertBefore(div, cartBox.querySelector('.cart-total'));
        });

        totalLabel.textContent = total.toLocaleString('vi-VN') + '₫';
        bindMiniCartEvents();
    }

    // ================== CẬP NHẬT CART DETAIL ==================
    function updateCartDetail() {
        const cart = getCart();
        cartDetailTableBody.innerHTML = '';
        let total = 0;

        cart.forEach((item, idx) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><button class="cart-detail-remove-btn" data-index="${idx}">×</button></td>
                <td><img src="${item.img}" alt="${item.name}" class="cart-detail-product-img"></td>
                <td><div class="cart-detail-product-name">${item.name}</div></td>
                <td class="cart-detail-price" data-price="${item.price}">${item.price.toLocaleString('vi-VN')}₫</td>
                <td class="cart-detail-quantity"><input type="text" min="1" value="${item.qty}" data-index="${idx}"></td>
                <td class="cart-detail-price" data-price="${itemTotal}">${itemTotal.toLocaleString('vi-VN')}₫</td>
            `;
            cartDetailTableBody.appendChild(tr);
        });

        cartDetailTotalPrice.textContent = total.toLocaleString('vi-VN') + '₫';
        bindCartDetailEvents();
    }

    // ================== MINI CART EVENTS ==================
    function bindMiniCartEvents() {
        document.querySelectorAll('.header-cart-remove').forEach(btn => {
            btn.onclick = () => {
                const cart = getCart();
                cart.splice(btn.dataset.index, 1);
                saveCart(cart);
                updateMiniCart();
                updateCartDetail();
            }
        });

        document.querySelectorAll('.header-cart-qty').forEach(input => {
            input.onchange = () => {
                const cart = getCart();
                const idx = input.dataset.index;
                const val = parseInt(input.value);
                if(val > 0){
                    cart[idx].qty = val;
                    saveCart(cart);
                    updateMiniCart();
                    updateCartDetail();
                }
            }
        });
    }

    // ================== CART DETAIL EVENTS ==================
    function bindCartDetailEvents() {
        document.querySelectorAll('.cart-detail-remove-btn').forEach(btn => {
            btn.onclick = () => {
                const cart = getCart();
                const idx = btn.dataset.index;

                if(confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                    cart.splice(idx, 1);
                    saveCart(cart);
                    updateMiniCart();
                    updateCartDetail();
                }
            }
        });

        document.querySelectorAll('.cart-detail-quantity input').forEach(input => {
            input.onchange = () => {
                const cart = getCart();
                const idx = input.dataset.index;
                const val = parseInt(input.value);
                if(val > 0){
                    cart[idx].qty = val;
                    saveCart(cart);
                    updateMiniCart();
                    updateCartDetail();
                }
            }
        });
    }

    // ================== THÊM SẢN PHẨM VÀO GIỎ ==================
    document.addEventListener('click', e => {
        if(e.target.classList.contains('add-cart')){
            const user = JSON.parse(localStorage.getItem('user'));
            if(!user) return alert('Vui lòng đăng nhập trước khi thêm sản phẩm!');

            const container = e.target.closest('.product-detail');
            const name = container.querySelector('.product-name').textContent.trim();
            const img = container.querySelector('img').src;
            const size = container.querySelector('.size').value;
            const qty = parseInt(container.querySelector('.quantity').value);
            const price = parseInt(container.querySelector('.price-current').textContent.replace(/[^\d]/g,''));

            const cart = getCart();
            const existing = cart.find(p => p.name === name && p.size === size);
            if(existing) existing.qty += qty;
            else cart.push({name, img, size, qty, price});

            saveCart(cart);
            updateMiniCart();
            updateCartDetail();
            alert('Đã thêm vào giỏ hàng!');
        }
    });

    // ================== HIỂN THỊ / ẨN GIỎ HÀNG MINI ==================
    [cartIcon, cartIconNotice, cartText].forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            cartBox.style.display = cartBox.style.display==='block'?'none':'block';
        });
    });

    // ================== HIỂN THỊ / ẨN CART DETAIL ==================
    btnViewCart.addEventListener('click', () => {
        cartDetail.style.display='block';
        document.body.classList.add('no-scroll');
    });
    btnBackCart.addEventListener('click', () => {
        cartDetail.style.display='none';
        document.body.classList.remove('no-scroll');
    });

    // Ẩn mini cart khi click ra ngoài
    document.addEventListener('click', e => {
        if(!e.target.closest('.header-cart') &&
        !e.target.closest('.fa-cart-shopping') &&
        !e.target.closest('.icon-notice') &&
        !e.target.closest('#action-btn') &&
        !e.target.classList.contains('header-cart-remove')){
            cartBox.style.display='none';
        }
    });

    // ================== LOAD TRANG ==================
    document.addEventListener('DOMContentLoaded', () => {
        updateMiniCart();
        updateCartDetail();
    });

// ========================= XEM LẠI ĐƠN HÀNG =====================
const viewOrdersBtn = document.getElementById('view-orders-btn');
if (viewOrdersBtn) {
    viewOrdersBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Ẩn form thông tin khách hàng
        const customerInfo = document.getElementById('customer-info');
        customerInfo.classList.remove('active');
        customerInfo.style.display = 'none';

        // Hiển thị form đơn hàng
        const orderHistory = document.getElementById('order-history');
        orderHistory.style.display = 'block';
        orderHistory.classList.add('active');

        document.body.classList.add('no-scroll');

        // Load đơn hàng từ localStorage
        loadOrders();
    });
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    const orderEmpty = document.getElementById('order-empty');
    const orderList = document.getElementById('order-list');

    orderList.innerHTML = '';

    if (orders.length === 0) {
        orderEmpty.style.display = 'block';
        orderList.style.display = 'none';
        return;
    } else {
        orderEmpty.style.display = 'none';
        orderList.style.display = 'block';
    }

    const statusMap = {
        'new': 'Mới',
        'processing': 'Đang xử lý',
        'done': 'Đã giao',
        'cancel': 'Hủy'
    };

    orders.forEach((order, orderIndex) => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        let orderTotal = 0;
        order.items.forEach(item => {
            orderTotal += item.price * item.qty;
        });

        let tableHTML = `
            <table class="order-detail-table">
                <thead>
                    <tr>
                        <th style="width: 150px;">Mã</th>
                        <th style="width: 350px;">Sản phẩm</th>
                        <th style="width: 150px;">Giá</th>
                        <th style="width: 100px;">Số lượng</th>
                        <th style="width: 150px;">Thành tiền</th>
                        <th style="width: 130px;">Trạng thái</th>
                        <th style="width: 150px;">Hành động</th>
                    </tr>
                </thead>
                <tbody>
        `;

        order.items.forEach(item => {
            const itemTotal = item.price * item.qty;
            tableHTML += `
                <tr>
                    <td class="order-info-cell">${order.id}</td>
                    <td>
                        <div class="order-product-name">${item.name}</div>
                        <div class="order-product-details">Size: ${item.size}</div>
                    </td>
                    <td class="order-product-price">${item.price.toLocaleString('vi-VN')}₫</td>
                    <td class="order-product-quantity">${item.qty}</td>
                    <td class="order-product-price">${itemTotal.toLocaleString('vi-VN')}₫</td>
                    <td>
                        <span class="order-status ${order.status.toLowerCase()}">${statusMap[order.status]}</span>
                    </td>
                    <td>
                        <div class="order-actions">
                            <button class="order-btn order-btn-cancel" data-index="${orderIndex}">Hủy đơn</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" style="text-align: right; font-weight: bold;">Tổng đơn:</td>
                        <td colspan="3" style="font-weight: bold;">${orderTotal.toLocaleString('vi-VN')}₫</td>
                    </tr>
                </tfoot>
            </table>
        `;

        orderItem.innerHTML = tableHTML;
        orderList.appendChild(orderItem);
    });

    // --- Thêm sự kiện cho nút Hủy đơn ---
    const cancelBtns = document.querySelectorAll('.order-btn-cancel');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            orders[index].status = 'cancel'; 
            localStorage.setItem('orders', JSON.stringify(orders));
            loadOrders(); 
        });
    });
}

const orderBackBtn = document.querySelector('#order-history .back-btn');
orderBackBtn.addEventListener('click', () => {
    document.getElementById('order-history').style.display = 'none';
    document.body.classList.remove('no-scroll');
});