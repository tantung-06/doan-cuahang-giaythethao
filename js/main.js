// Lấy các phần tử
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const loginBtn = document.querySelectorAll('.action .btn')[0]; // Nút "Đăng nhập" ở header
const userIcon = document.querySelector('.action .icon'); // Icon user
const containerLoginRegister = document.querySelectorAll('.container-login-register');

// Hàm hiện form đăng nhập
function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

// Hàm hiện form đăng ký
function showRegisterForm() {
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
}

// Hàm ẩn tất cả form
function hideAllForms() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
}

// Khi click vào nút "Đăng nhập" ở header hoặc icon user
loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginForm();
});

userIcon.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginForm();
});

// Khi click vào link "Đăng ký" trong form đăng nhập
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

// Khi click ra ngoài form (vào nền đen) thì đóng form
containerLoginRegister.forEach(function(container) {
    container.addEventListener('click', function(e) {
        if (e.target === container) {
            hideAllForms();
        }
    });
});

// Xử lý submit form đăng nhập
const formLogin = document.getElementById('form-1');
formLogin.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        alert('Đăng nhập thành công!\nEmail: ' + email);
        hideAllForms();
        formLogin.reset();
    } else {
        alert('Vui lòng điền đầy đủ thông tin!');
    }
});

// Xử lý submit form đăng ký
const formRegister = document.getElementById('form-2');
formRegister.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = formRegister.querySelector('input[name="username"]').value;
    const email = formRegister.querySelector('input[name="email"]').value;
    const password = formRegister.querySelector('input[name="password"]').value;
    
    if (username && email && password) {
        alert('Đăng ký thành công!\nHọ và tên: ' + username + '\nEmail: ' + email);
        hideAllForms();
        formRegister.reset();
    } else {
        alert('Vui lòng điền đầy đủ thông tin!');
    }
});

// Xử lý menu mobile (bonus)
const navBars = document.querySelector('.nav_bars a');
const nav = document.querySelector('.nav');

navBars.addEventListener('click', function(e) {
    e.preventDefault();
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
});