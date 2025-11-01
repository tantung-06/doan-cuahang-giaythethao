// === QUẢN LÝ TÀI KHOẢN ===

// Lấy các phần tử
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const customerInfo = document.getElementById('customer-info');
const loginBtn = document.querySelectorAll('.action .btn')[0];
const registerBtn = document.querySelectorAll('.action .btn')[1];
const userIcon = document.querySelector('.action .icon');
const userNameDisplay = document.getElementById('user-name');
const containerLoginRegister = document.querySelectorAll('.container-login-register');

// === Hiển thị / Ẩn form ===
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

// === Xử lý sự kiện click ===
loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginForm();
});

registerBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showRegisterForm();
});

// Khi click vào icon user
userIcon.addEventListener('click', function(e) {
    e.preventDefault();
    const storedUser = localStorage.getItem('user');

    // Nếu chưa có user hoặc đã bị xóa => mở form đăng nhập
    if (!storedUser || storedUser === 'null' || storedUser === 'undefined') {
        showLoginForm();
        return;
    }

    // Nếu có user thật => mở thông tin khách hàng
    const user = JSON.parse(storedUser);
    if (user && user.username) {
        showCustomerInfo(user);
    } else {
        showLoginForm();
    }
});

// Khi click vào link "Đăng ký"
const registerLink = document.querySelector('#login-form p a');
registerLink.addEventListener('click', function(e) {
    e.preventDefault();
    showRegisterForm();
});

// Khi click vào link "Đăng nhập" trong form đăng ký
const loginLink = document.querySelector('#register-form p a');
loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginForm();
});

// Khi click ra ngoài form thì ẩn
containerLoginRegister.forEach(function(container) {
    container.addEventListener('click', function(e) {
        if (e.target === container) hideAllForms();
    });
});

// === Đăng ký ===
const formRegister = document.getElementById('form-2');
formRegister.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = formRegister.querySelector('input[name="username"]').value;
    const email = formRegister.querySelector('input[name="email"]').value;
    const password = formRegister.querySelector('input[name="password"]').value;

    if (username && email && password) {
        // Lấy danh sách khách hàng từ localStorage (nếu chưa có thì tạo mảng rỗng)
        let customers = JSON.parse(localStorage.getItem('customers')) || [];

        // Kiểm tra trùng email
        const exists = customers.some(c => c.email === email);
        if (exists) {
            alert('Email này đã được sử dụng! Vui lòng chọn email khác.');
            return;
        }

        // Thêm khách hàng mới
        const newUser = { username, email, password };
        customers.push(newUser);
        localStorage.setItem('customers', JSON.stringify(customers));

        alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        formRegister.reset();

        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    } else {
        alert('Vui lòng điền đầy đủ thông tin!');
    }
});

// === Đăng nhập ===
const formLogin = document.getElementById('form-1');
formLogin.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Lấy danh sách khách hàng
    const customers = JSON.parse(localStorage.getItem('customers')) || [];

    // Tìm khách hàng khớp email và mật khẩu
    const user = customers.find(c => c.email === email && c.password === password);

    if (user) {
        // Lưu thông tin người đăng nhập hiện tại
        localStorage.setItem('user', JSON.stringify(user));
        alert('Đăng nhập thành công!');
        hideAllForms();
        showUserName(user.username);
        formLogin.reset();
    } else {
        alert('Email hoặc mật khẩu không chính xác!');
    }
});

// === Hiển thị tên người dùng trên header ===
function showUserName(name) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    userIcon.style.display = 'inline-block';
    userNameDisplay.textContent = name;
    userNameDisplay.style.display = 'inline-block';
}

// === Khi click vào tên người dùng => mở thông tin khách hàng ===
userNameDisplay.addEventListener('click', function() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) showCustomerInfo(storedUser);
});

// === Hiển thị thông tin khách hàng ===
function showCustomerInfo(user) {
    document.getElementById('info-name').value = user.username;
    document.getElementById('info-email').value = user.email;
    document.getElementById('info-password').value = user.password;

    customerInfo.style.display = 'block';
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
}

// === Nút Sửa / Lưu / Đăng xuất ===
const editBtn = document.getElementById('edit-btn');
const saveBtn = document.getElementById('save-btn');
const logoutBtn = document.getElementById('logout-btn');

// Khi bấm Sửa
editBtn.addEventListener('click', function() {
    document.getElementById('info-name').disabled = false;
    document.getElementById('info-email').disabled = false;
    document.getElementById('info-password').disabled = false;
});

// Khi bấm Lưu
saveBtn.addEventListener('click', function() {
    const updatedUser = {
        username: document.getElementById('info-name').value,
        email: document.getElementById('info-email').value,
        password: document.getElementById('info-password').value
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Cập nhật thông tin thành công!');
    document.getElementById('info-name').disabled = true;
    document.getElementById('info-email').disabled = true;
    document.getElementById('info-password').disabled = true;
    showUserName(updatedUser.username);
});

// Khi bấm Đăng xuất
logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('user');
    hideAllForms();
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    userIcon.style.display = 'inline-block';
    userNameDisplay.style.display = 'none';
    alert('Bạn đã đăng xuất!');
});

// Khi reload trang mà user vẫn trong localStorage => tự hiển thị tên
window.addEventListener('load', function() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) showUserName(storedUser.username);
});

// Menu mobile
const navBars = document.querySelector('.nav_bars a');
const nav = document.querySelector('.nav');
navBars.addEventListener('click', function(e) {
    e.preventDefault();
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
});
// === HEADER NAV ===
const homeLink = document.getElementById('home-link');
const productLink = document.getElementById('product-link');
const containerLeft = document.querySelector('.container-left');
const containerRight = document.querySelector('.container-right');
const slider = document.querySelector('.slider');

// Khi bấm Trang Chủ => ẩn phần bên trái và canh giữa phần bên phải
homeLink.addEventListener('click', function(e) {
    e.preventDefault();
    containerLeft.style.display = 'none';
    slider.style.display = 'block';

    // Thêm màu cho Trang Chủ, bỏ màu ở Sản Phẩm
    homeLink.classList.add('active');
    productLink.classList.remove('active');
});

// Khi bấm Sản Phẩm => hiện lại phần bên trái, bỏ canh giữa
productLink.addEventListener('click', function(e) {
    e.preventDefault();
    containerLeft.style.display = 'block';
    slider.style.display = 'none';


    // Thêm màu cho Sản Phẩm, bỏ màu ở Trang Chủ
    productLink.classList.add('active');
    homeLink.classList.remove('active');
});

// Khi vừa vào trang => hiển thị Trang Chủ trước
window.addEventListener('load', function() {
    containerLeft.style.display = 'none';
});

// === SLIDER ===
const sliderContent = document.querySelector('.slider-content');
const slides = document.querySelectorAll('.slider-item');
const prev = document.querySelector('.fa-chevron-left');
const next = document.querySelector('.fa-chevron-right');

let index = 0;
let interval;

// Clone slide đầu và cuối để tạo vòng lặp mượt
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

sliderContent.appendChild(firstClone);
sliderContent.prepend(lastClone);

const allSlides = document.querySelectorAll('.slider-item');
let slideCount = allSlides.length;
sliderContent.style.transform = `translateX(-100%)`; // bắt đầu từ slide đầu thật

// Hiển thị slide dựa trên index
function showSlide(i) {
    sliderContent.style.transition = 'transform 0.5s ease-in-out';
    sliderContent.style.transform = `translateX(${-100 * (i + 1)}%)`;
}

// Khi chuyển tiếp slide
next.addEventListener('click', () => {
    index++;
    showSlide(index);
    resetInterval();
});

// Khi chuyển lùi slide
prev.addEventListener('click', () => {
    index--;
    showSlide(index);
    resetInterval();
});

// Khi transition kết thúc, reset vị trí nếu tới clone
sliderContent.addEventListener('transitionend', () => {
    if(index >= slides.length) { // đi tới clone đầu
        sliderContent.style.transition = 'none';
        index = 0;
        sliderContent.style.transform = `translateX(-100%)`;
    }
    if(index < 0) { // đi tới clone cuối
        sliderContent.style.transition = 'none';
        index = slides.length - 1;
        sliderContent.style.transform = `translateX(${-100 * slides.length}%)`;
    }
});

// Tự động chạy slider
function startInterval() {
    interval = setInterval(() => {
        index++;
        showSlide(index);
    }, 5000);
}

// Dừng khi hover
document.querySelector('.slider-container').addEventListener('mouseenter', () => clearInterval(interval));
document.querySelector('.slider-container').addEventListener('mouseleave', startInterval);

// Reset interval khi bấm nút
function resetInterval() {
    clearInterval(interval);
    startInterval();
}

// Khởi tạo
showSlide(index);
startInterval();

// === QUẢN LÝ SẢN PHẨM ===

// - Xem danh danh sách theo loại

// lấy tất cả các thẻ a trong danh mục và các sản phẩm
const categoryItems = document.querySelectorAll(".category-list");
const products = document.querySelectorAll(".product-list");

// lặp qua từng danh mục
categoryItems.forEach(item => {
    item.addEventListener("click", e => {
        e.preventDefault(); // trách load lại trang khi click <a>
        
        // bỏ im đậm
        categoryItems.forEach(i => i.classList.remove("active"));

        // thêm in đậm khi click vào danh mục bất kì
        item.classList.add("active");

        const filter = item.getAttribute("data-filter");

        products.forEach(product => {
            const category = product.getAttribute("data-category").split(" "); //tách thành mảng
            if (filter === "tat-ca" || category.includes(filter)) { //ktr mảng có chứa loại đc chọn không
                product.style.display = "block";
            } else {
                product.style.display = "none";
            }
        })
    })
})

// - Xem chi tiết sản phẩm

const productItems = document.querySelectorAll('.product-item');
const productDetails = document.querySelectorAll('.product-detail');
// Bắt sự kiện click vào từng sản phẩm
productItems.forEach(item => {
    item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        
        // Ẩn tất cả chi tiết
        productDetails.forEach(detail => {
            detail.style.display = 'none';
        });

        // Hiện đúng chi tiết có data-id trùng
        const targetDetail = document.querySelector(`.product-detail[data-id="${id}"]`);
        if (targetDetail) {
            targetDetail.style.display = 'flex';
        }
    });
});

// Đóng chi tiết sản phẩm khi click ra ngoài
const allProductDetails = document.querySelectorAll('.product-detail');

allProductDetails.forEach(detail => {
    const container = detail.querySelector('.product-detail-container');

    detail.addEventListener('click', (e) => {
        // nếu click không nằm trong container thì ẩn chi tiết
        if (!container.contains(e.target)) {
            detail.style.display = 'none';
        }
    });
});

// === Đóng khi bấm vào nút X ===
const closeBtns = document.querySelectorAll('.close');
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const productDetail = btn.closest('.product-detail');
        const loginRegister = btn.closest('.login-register');

        // nút close ở chi tiết sản phẩm
        if(productDetail) {
            productDetail.style.display = 'none';
        }

        // nút close ở đăng nhập, đăng ký, thông tin khách hàng
        if(loginRegister) {
            loginRegister.style.display = 'none';
        }
    });
});

// - Tìm kiếm cơ bản theo tên
const searchInput = document.getElementById('basic-search');
const searchBtn = document.querySelector('.basic-btn');
const productLists = document.querySelectorAll('.product-list');

// Hàm xóa dấu tiếng Việt
function removeVietnameseTones(str) {
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D");
}

// Hàm tìm kiếm
function searchProducts() {
    const keyword = removeVietnameseTones(searchInput.value.trim().toLowerCase());

    productLists.forEach(productList => {
        const name = removeVietnameseTones(productList.querySelector('.product-name').textContent.toLowerCase());
        const company = removeVietnameseTones(productList.querySelector('.product-company').textContent.toLowerCase());
        const match = name.includes(keyword) || company.includes(keyword);

        productList.style.display = match ? 'block' : 'none';
    });
}

// Nhấn nút tìm
searchBtn.addEventListener('click', searchProducts);

// Nhấn Enter cũng tìm
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// - Tìm kiếm nâng cao (bộ lọc tìm kiếm)
const checkboxes = document.querySelectorAll('.search-filter-item input[type="checkbox"]');
const applyBtn = document.querySelector('.search-filter-btn');
const productItemsFilter = document.querySelectorAll('.product-item');

// khi click áp dụng
applyBtn.addEventListener('click', () => {
    // mảng lưu các thương hiệu
    const selectedBrands = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedBrands.push(checkbox.id.toUpperCase().replace('-', ' '));
        }
    });

    // lấy khoảng giá từ 2 ô input
    const priceInputs = document.querySelectorAll('.search-filter-price input');
    const minPrice = priceInputs[0].value.trim() === "" ? 0 : parseInt(priceInputs[0].value.replace(/\D/g, ""));
    const maxPrice = priceInputs[1].value.trim() === "" ? Infinity : parseInt(priceInputs[1].value.replace(/\D/g, ""));

    // lọc sản phẩm
    productItemsFilter.forEach(product => {
        const brand = product.querySelector('.product-company').textContent.trim().toUpperCase();
        const priceText = product.querySelector('.price-current').textContent.trim().replace(/\./g, '').replace('đ', '');
        const price = parseInt(priceText);

        const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(brand);
        const matchPrice = price >= minPrice && price <= maxPrice;

        // hiện thị or ẩn sản phẩm
        product.style.display = matchBrand && matchPrice ? 'block' : 'none';
    });
    
    // Dồn sản phẩm lọc được lên trên
    const productContainer = document.querySelector(".product");
    const allProducts = Array.from(productContainer.querySelectorAll(".product-item"));

    const matched = [];
    const unmatched = [];

    allProducts.forEach(item => {
        if (item.style.display !== "none") {
            matched.push(item); // sản phẩm hiển thị
        } else {
            unmatched.push(item); // sản phẩm bị ẩn
        }
    });

    // thay đổi vị trí
    matched.reverse().forEach(item => {
        productContainer.prepend(item.closest('.product-list')); 
    });
});