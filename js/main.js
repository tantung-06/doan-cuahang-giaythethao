// === QUẢN LÝ TÀI KHOẢN ===
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const customerInfo = document.getElementById('customer-info');
const loginBtn = document.querySelectorAll('.action .btn')[0];
const registerBtn = document.querySelectorAll('.action .btn')[1];
const userIcon = document.querySelector('.action .icon');
const userNameDisplay = document.getElementById('user-name');
const containerLoginRegister = document.querySelectorAll('.container-login-register');

// --- Hiển thị / Ẩn form ---
function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    customerInfo.style.display = 'none';
}
function showRegisterForm() {
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    customerInfo.style.display = 'none';
}
function hideAllForms() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    customerInfo.style.display = 'none';
}

// --- Sự kiện click ---
loginBtn.onclick = e => { e.preventDefault(); showLoginForm(); };
registerBtn.onclick = e => { e.preventDefault(); showRegisterForm(); };

userIcon.onclick = e => {
    e.preventDefault();
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'null' || storedUser === 'undefined') return showLoginForm();
    const user = JSON.parse(storedUser);
    user && user.username ? showCustomerInfo(user) : showLoginForm();
};

// --- Link chuyển form ---
document.querySelector('#login-form p a').onclick = e => { e.preventDefault(); showRegisterForm(); };
document.querySelector('#register-form p a').onclick = e => { e.preventDefault(); showLoginForm(); };

// --- Click ra ngoài form ---
containerLoginRegister.forEach(c => {
    c.onclick = e => { if (e.target === c) hideAllForms(); };
});

// --- Đăng ký ---
const formRegister = document.getElementById('form-2');
formRegister.onsubmit = e => {
    e.preventDefault();
    const username = formRegister.username.value.trim();
    const email = formRegister.email.value.trim();
    const password = formRegister.password.value.trim();

    if (!username || !email || !password) return alert('Vui lòng điền đầy đủ thông tin!');

    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    if (customers.some(c => c.email === email)) return alert('Email này đã được sử dụng!');

    customers.push({ username, email, password });
    localStorage.setItem('customers', JSON.stringify(customers));
    alert('Đăng ký thành công!');
    formRegister.reset();
    showLoginForm();
};

// --- Đăng nhập ---
const formLogin = document.getElementById('form-1');
formLogin.onsubmit = e => {
    e.preventDefault();
    const email = formLogin.email.value.trim();
    const password = formLogin.password.value.trim();
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const user = customers.find(c => c.email === email && c.password === password);

    if (!user) return alert('Email hoặc mật khẩu không chính xác!');

    localStorage.setItem('user', JSON.stringify(user));
    alert('Đăng nhập thành công!');
    hideAllForms();
    showUserName(user.username);
    formLogin.reset();
};

// --- Hiển thị tên người dùng ---
function showUserName(name) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    userIcon.style.display = 'inline-block';
    userNameDisplay.textContent = name;
    userNameDisplay.style.display = 'inline-block';
}

// --- Thông tin người dùng ---
userNameDisplay.onclick = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) showCustomerInfo(storedUser);
};
function showCustomerInfo(user) {
    document.getElementById('info-name').value = user.username;
    document.getElementById('info-email').value = user.email;
    document.getElementById('info-password').value = user.password;
    customerInfo.style.display = 'block';
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
}

// --- Nút Sửa / Lưu / Đăng xuất ---
document.getElementById('edit-btn').onclick = () => {
    ['info-name', 'info-email', 'info-password'].forEach(id => {
        document.getElementById(id).disabled = false;
    });
};

document.getElementById('save-btn').onclick = () => {
    const updatedUser = {
        username: document.getElementById('info-name').value,
        email: document.getElementById('info-email').value,
        password: document.getElementById('info-password').value
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Cập nhật thông tin thành công!');
    ['info-name', 'info-email', 'info-password'].forEach(id => {
        document.getElementById(id).disabled = true;
    });
    showUserName(updatedUser.username);
};

document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('user');
    hideAllForms();
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    userIcon.style.display = 'inline-block';
    userNameDisplay.style.display = 'none';
    alert('Bạn đã đăng xuất!');
};

// --- Giữ trạng thái khi reload ---
window.onload = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) showUserName(storedUser.username);
};

// === MENU MOBILE ===
const navBars = document.querySelector('.nav_bars a');
const nav = document.querySelector('.nav');
navBars.onclick = e => {
    e.preventDefault();
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
};

// === HEADER NAV ===
const homeLink = document.getElementById('home-link');
const productLink = document.getElementById('product-link');
const containerLeft = document.querySelector('.container-left');
const slider = document.querySelector('.slider');
const title = document.querySelector('.container-title');

function showHome(e) {
    if (e) e.preventDefault();
    containerLeft.style.display = 'none';
    slider.style.display = 'block';
    title.style.visibility = 'visible';
    title.style.height = 'auto';
    homeLink.classList.add('active');
    productLink.classList.remove('active');
}
function showProduct(e) {
    if (e) e.preventDefault();
    containerLeft.style.display = 'block';
    slider.style.display = 'none';
    title.style.visibility = 'hidden';
    title.style.height = '0';
    productLink.classList.add('active');
    homeLink.classList.remove('active');
}
homeLink.onclick = showHome;
productLink.onclick = showProduct;
window.addEventListener('load', showHome);

// === SLIDER ===
const sliderContent = document.querySelector('.slider-content');
const slides = document.querySelectorAll('.slider-item');
const prev = document.querySelector('.fa-chevron-left');
const next = document.querySelector('.fa-chevron-right');
let index = 0, interval;

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);
sliderContent.append(firstClone);
sliderContent.prepend(lastClone);
sliderContent.style.transform = 'translateX(-100%)';

function showSlide(i) {
    sliderContent.style.transition = 'transform 0.5s ease-in-out';
    sliderContent.style.transform = `translateX(${-100 * (i + 1)}%)`;
}
function startInterval() {
    interval = setInterval(() => { index++; showSlide(index); }, 5000);
}
function resetInterval() {
    clearInterval(interval);
    startInterval();
}

next.onclick = () => { index++; showSlide(index); resetInterval(); };
prev.onclick = () => { index--; showSlide(index); resetInterval(); };

sliderContent.addEventListener('transitionend', () => {
    if (index >= slides.length) { sliderContent.style.transition = 'none'; index = 0; sliderContent.style.transform = 'translateX(-100%)'; }
    if (index < 0) { sliderContent.style.transition = 'none'; index = slides.length - 1; sliderContent.style.transform = `translateX(${-100 * slides.length}%)`; }
});
document.querySelector('.slider-container').onmouseenter = () => clearInterval(interval);
document.querySelector('.slider-container').onmouseleave = startInterval;
showSlide(index);
startInterval();

// === TÌM KIẾM SẢN PHẨM ===
const searchInput = document.getElementById('basic-search');
const searchBtn = document.querySelector('.basic-btn');

function removeVietnameseTones(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

function searchProducts() {
    const keyword = removeVietnameseTones(searchInput.value.trim().toLowerCase());
    const productLists = document.querySelectorAll('.product-list'); // Lấy mới mỗi lần search
    let visibleCount = 0; // đếm sản phẩm hiển thị

    productLists.forEach(p => {
        const name = removeVietnameseTones(p.querySelector('.product-name').textContent.toLowerCase());
        const company = removeVietnameseTones(p.querySelector('.product-company').textContent.toLowerCase());
        const show = name.includes(keyword) || company.includes(keyword);
        p.style.display = show ? 'block' : 'none';
        if (show) visibleCount++;
    });

    // Hiển thị dòng "Không có sản phẩm" nếu không có sản phẩm nào
    const noProductDiv = document.querySelector('.container-right .no-product');
    if (noProductDiv) {
        noProductDiv.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

searchBtn.onclick = searchProducts;
searchInput.onkeypress = e => { if (e.key === 'Enter') searchProducts(); };