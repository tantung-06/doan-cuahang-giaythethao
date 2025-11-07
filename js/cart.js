// ================== GIỎ HÀNG HEADER ==================
const cartIcon = document.querySelector('.fa-cart-shopping');
const cartBox = document.querySelector('.header-cart-list');
const cartIconNotice = document.querySelector('.icon-notice');
const cartText = document.querySelector('#action-btn');
const totalLabel = document.querySelector('.cart-total label');
const noCartImg = document.querySelector('.header-no-cart-img');
const noCartMsg = document.querySelector('.header-no-cart-msg');

// Toggle giỏ hàng
const cartToggleElements = [cartIcon, cartIconNotice, cartText];
cartToggleElements.forEach(el => {
    if(el){
        el.addEventListener('click', e => {
            e.preventDefault(); // ngăn reload trang
            cartBox.style.display = cartBox.style.display === 'block' ? 'none' : 'block';
        });
    }
});

// Lấy và lưu giỏ
function getCart() { return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }

// Cập nhật giao diện giỏ
function updateCartDisplay() {
    const cart = getCart();
    cartBox.querySelectorAll('.header-cart-list-item').forEach(item => item.remove());

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

    cart.forEach((p,i) => {
        const div = document.createElement('div');
        div.className = 'header-cart-list-item';
        div.innerHTML = `
            <img src="${p.img}" class="header-cart-list-img">
            <div class="header-cart-info">
                <p class="header-cart-name">${p.name}</p>
                <p class="header-cart-size">Size: ${p.size}</p>
                <div class="header-cart-price">
                    <input type="text" value="${p.qty}" min="1" class="header-cart-qty" data-index="${i}">
                    <span class="header-cart-item-price">${(p.price*p.qty).toLocaleString()}₫</span>
                </div>
            </div>
            <span class="header-cart-remove" data-index="${i}">×</span>
        `;
        cartBox.insertBefore(div, cartBox.querySelector('.cart-total'));
        total += p.price * p.qty;
    });

    totalLabel.textContent = total.toLocaleString() + '₫';

    // Xóa sản phẩm
    cartBox.querySelectorAll('.header-cart-remove').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            const idx = btn.dataset.index;
            const c = getCart();
            c.splice(idx,1);
            saveCart(c);
            updateCartDisplay();
        }
    });

    // Cập nhật số lượng
    cartBox.querySelectorAll('.header-cart-qty').forEach(input => {
        input.onchange = e => {
            const idx = input.dataset.index;
            const val = parseInt(input.value);
            if(val>0){
                const c = getCart();
                c[idx].qty = val;
                saveCart(c);
                updateCartDisplay();
            }
        }
    });
}

// Thêm vào giỏ hàng (Event Delegation)
document.addEventListener('click', e => {
    if(e.target.classList.contains('add-cart')){
        e.preventDefault();
        const container = e.target.closest('.product-detail');
        const name = container.querySelector('.product-name').textContent.trim();
        const img = container.querySelector('img').src;
        const size = container.querySelector('.size').value;
        const qty = parseInt(container.querySelector('.quantity').value);
        const price = parseInt(container.querySelector('.price-current').textContent.replace(/[^\d]/g,''));

        const cart = getCart();
        const existing = cart.find(p => p.name===name && p.size===size);
        if(existing) existing.qty += qty;
        else cart.push({name,img,size,qty,price});
        saveCart(cart);
        updateCartDisplay();
        alert('Đã thêm vào giỏ hàng!');
    }
});

// Ẩn giỏ khi click ra ngoài (không ẩn khi click vào nút xóa)
document.addEventListener('click', e => {
    if(!e.target.closest('.header-cart') && 
       !e.target.closest('.fa-cart-shopping') && 
       !e.target.closest('.icon-notice') &&
       !e.target.closest('#action-btn') &&
       !e.target.classList.contains('header-cart-remove')){  // loại trừ nút xóa
        cartBox.style.display = 'none';
    }
});

// Hiển thị giỏ khi load
document.addEventListener('DOMContentLoaded', updateCartDisplay);