// === QUẢN LÝ TÀI KHOẢN ===

// Lấy các phần tử
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const customerInfo = document.getElementById('customer-info');
const loginBtn = document.querySelectorAll('.action .btn')[0];
const userIcon = document.querySelector('.action .icon');
const userNameDisplay = document.getElementById('user-name');
const containerLoginRegister = document.querySelectorAll('.container-login-register');

// Hiển thị form đăng nhập
function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    customerInfo.style.display = 'none';
}

// Hiển thị form đăng ký
function showRegisterForm() {
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    customerInfo.style.display = 'none';
}

// Ẩn tất cả form
function hideAllForms() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    customerInfo.style.display = 'none';
}

// Khi click vào nút "Đăng nhập" hoặc icon user
loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginForm();
});

userIcon.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginForm();
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

// Xử lý Đăng ký
const formRegister = document.getElementById('form-2');
formRegister.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = formRegister.querySelector('input[name="username"]').value;
    const email = formRegister.querySelector('input[name="email"]').value;
    const password = formRegister.querySelector('input[name="password"]').value;

    if (username && email && password) {
        const user = { username, email, password };
        localStorage.setItem('user', JSON.stringify(user));
        alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        hideAllForms();
        formRegister.reset();
    } else {
        alert('Vui lòng điền đầy đủ thông tin!');
    }
});

// Xử lý Đăng nhập
const formLogin = document.getElementById('form-1');
formLogin.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
        alert('Bạn chưa có tài khoản! Vui lòng đăng ký.');
        showRegisterForm();
        return;
    }

    if (email === storedUser.email && password === storedUser.password) {
        alert('Đăng nhập thành công!');
        hideAllForms();
        showUserName(storedUser.username);
        formLogin.reset();
    } else {
        alert('Email hoặc mật khẩu không chính xác!');
    }
});

// Hiển thị tên người dùng trên header
function showUserName(name) {
    loginBtn.style.display = 'none';
    userIcon.style.display = 'block';
    userNameDisplay.textContent = name;
    userNameDisplay.style.display = 'inline-block';
}

// Khi click vào icon user và tên khách hàng => mở form thông tin
userIcon.addEventListener('click', function() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) showCustomerInfo(storedUser);
});

userNameDisplay.addEventListener('click', function() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) showCustomerInfo(storedUser);
});

// Hiển thị thông tin khách hàng
function showCustomerInfo(user) {
    document.getElementById('info-name').value = user.username;
    document.getElementById('info-email').value = user.email;
    document.getElementById('info-password').value = user.password;

    customerInfo.style.display = 'block';
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
}

// Nút Sửa / Lưu / Đăng xuất
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
    hideAllForms();
    loginBtn.style.display = 'inline-block';
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

// === QUẢN LÝ SẢN PHẨM ===

// Xem danh danh sách theo loại (phân trang) 

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

// Xem chi tiết sản phẩm

// Lấy phần chi tiết sản phẩm và nút đóng
const productDetail = document.querySelector('.product-detail');
const closeBtn = document.getElementById('close');

// Lấy tất cả sản phẩm
const productItems = document.querySelectorAll('.product-item');

// Khi click vào sản phẩm thì hiện chi tiết
productItems.forEach(item => {
    item.addEventListener('click', () => {
        productDetail.style.display = 'flex';
    });
});

// Khi click vào nút X thì ẩn chi tiết
closeBtn.addEventListener('click', () => {
    productDetail.style.display = 'none';
});
