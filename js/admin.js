// ==============================
// 📁 ADMIN.JS HOÀN CHỈNH
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sidebar li[data-section]");
  const contentArea = document.getElementById("content-area");

  // ==============================
  // 🔹 1. DỮ LIỆU MẪU
  // ==============================
  const categories = [];
  const products = [];
  const orders = [];
  const stock = [];

  // ==============================
  // 🔹 2. HÀM HỖ TRỢ
  // ==============================
  function formatMoney(v) {
    return Number(v).toLocaleString("vi-VN") + "₫";
  }

  // ==============================
  // 🔹 3. QUẢN LÝ NGƯỜI DÙNG
  // ==============================
  function renderUsers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const contentArea = document.getElementById("content-area");

    contentArea.innerHTML = `
      <h3>👥 Quản lý người dùng</h3>
      <div class="user-info-box">
        ${
          currentUser
            ? `<p><b>Đang đăng nhập:</b> ${currentUser.username} (${currentUser.email})</p>
               <button id="logoutCurrentUser">Đăng xuất tài khoản này</button>`
            : `<p><i>Không có người dùng nào đang đăng nhập.</i></p>`
        }
      </div>
      <hr>
      <table border="1" cellspacing="0" cellpadding="8" width="100%">
        <tr style="background:#2f3e46;color:white;">
          <th>#</th>
          <th>Tên đăng nhập</th>
          <th>Email</th>
          <th>Mật khẩu</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
        ${
          users.length > 0
            ? users.map(
                (u, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${u.username || "(trống)"}</td>
                <td>${u.email || "(trống)"}</td>
                <td>${u.password || "(trống)"}</td>
                <td>${u.banned ? "🔒 Bị khóa" : "✅ Hoạt động"}</td>
                <td>
                  <button class="banUserBtn" data-email="${u.email}">Khóa</button>
                  <button class="unbanUserBtn" data-email="${u.email}">Mở khóa</button>
                  <button class="deleteUserBtn" data-index="${i}">Xóa</button>
                </td>
              </tr>`
              ).join("")
            : `<tr><td colspan="6" style="text-align:center;">Chưa có người dùng nào.</td></tr>`
        }
      </table>
    `;

    // --- Đăng xuất người dùng hiện tại ---
    const logoutCurrentUser = document.getElementById("logoutCurrentUser");
    if (logoutCurrentUser) {
      logoutCurrentUser.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        alert("Đã đăng xuất tài khoản hiện tại!");
        renderUsers();
      });
    }

    // --- Khóa người dùng ---
    document.querySelectorAll(".banUserBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const u = users.find((x) => x.email === email);
        if (u) {
          u.banned = true;
          localStorage.setItem("users", JSON.stringify(users));
          alert(`Đã khóa tài khoản ${email}`);
          renderUsers();
        }
      });
    });

    // --- Mở khóa người dùng ---
    document.querySelectorAll(".unbanUserBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const u = users.find((x) => x.email === email);
        if (u) {
          u.banned = false;
          localStorage.setItem("users", JSON.stringify(users));
          alert(`Đã mở khóa tài khoản ${email}`);
          renderUsers();
        }
      });
    });

    // --- Xóa người dùng ---
    document.querySelectorAll(".deleteUserBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = btn.dataset.index;
        const users = JSON.parse(localStorage.getItem("users")) || [];
        if (confirm("Bạn có chắc muốn xóa người dùng này không?")) {
          users.splice(i, 1);
          localStorage.setItem("users", JSON.stringify(users));
          alert("Đã xóa người dùng!");
          renderUsers();
        }
      });
    });
  }

  // ==============================
  // 🔹 4. QUẢN LÝ LOẠI SẢN PHẨM
  // ==============================
  function renderCategories() {
    contentArea.innerHTML = `
      <h3>📦 Loại sản phẩm</h3>
      <div class="stock-inputs">
        <input id="cat" placeholder="Tên loại sản phẩm">
        <button id="addCat">Thêm loại</button>
      </div>
      <ul>${categories.map(c => `<li>${c}</li>`).join("")}</ul>
    `;
    document.getElementById("addCat").onclick = () => {
      const cat = document.getElementById("cat").value.trim();
      if (cat) {
        categories.push(cat);
        renderCategories();
      } else alert("Nhập tên loại!");
    };
  }

  // ==============================
  // 🔹 5. QUẢN LÝ SẢN PHẨM
  // ==============================
  function renderProducts() {
    contentArea.innerHTML = `
      <h3>🛒 Danh sách sản phẩm</h3>
      <div class="stock-inputs">
        <input id="pid" placeholder="Mã SP">
        <input id="pname" placeholder="Tên SP">
        <input id="pprice" placeholder="Giá">
        <input id="pstock" placeholder="Tồn kho">
        <button id="addProduct">Thêm sản phẩm</button>
      </div>
      <table>
        <tr><th>Mã</th><th>Tên</th><th>Giá</th><th>Tồn kho</th></tr>
        ${products.map(p =>
          `<tr><td>${p.id}</td><td>${p.name}</td><td>${formatMoney(p.price)}</td><td>${p.stock}</td></tr>`
        ).join("")}
      </table>`;
    document.getElementById("addProduct").onclick = () => {
      const id = pid.value.trim();
      const name = pname.value.trim();
      const price = pprice.value.trim();
      const stockQty = pstock.value.trim();
      if (id && name && price && stockQty) {
        products.push({ id, name, price: Number(price), stock: Number(stockQty) });
        renderProducts();
      } else alert("Nhập đầy đủ thông tin!");
    };
  }

    // --- NHẬP HÀNG ---
  function renderImport() {
    contentArea.innerHTML = `
     <h3>Trang Admin – Nhập sản phẩm</h3>
<form id="productForm">
  <label>Mã sản phẩm:</label>
  <input type="number" id="ma" required><br><br>

  <label>Tên sản phẩm:</label>
  <input type="text" id="name" required><br><br>

  <label>Giá bán:</label>
  <input type="number" id="price" required><br><br>

  <label>Ảnh (URL):</label>
  <input type="text" id="image" placeholder="https://..."><br><br>

  <label>Size giày:</label>
  <input type="text" id="size" placeholder="Ví dụ: 38, 39, 40" required><br><br>

  <label>Thể loại:</label>
  <select id="category" required>
    <option value="">-- Chọn thể loại --</option>
    <option value="giay-cau-long">Giày cầu lông</option>
    <option value="giay-chay-bo">Giày chạy bộ</option>
    <option value="giay-da-bong">Giày đá bóng</option>
    <option value="giay-sneaker">Giày sneaker</option>
    <option value="giay-nam">Giày nam</option>
    <option value="giay-nu">Giày nữ</option>
  </select><br><br>
  <label>Thương hiệu:</label>
  <select id="brand" required>
    <option value="">-- Chọn thương hiệu --</option>
    <option value="nike">Nike</option>
    <option value="adidas">Adidas</option>
    <option value="puma">Puma</option>
  </select><br><br>

  <button type="submit">Thêm sản phẩm</button>
</form>

<hr>
<h3>Danh sách sản phẩm hiện có</h3>
<ul id="productList"></ul>

    `;

    const form = document.getElementById("productForm");
    const list = document.getElementById("productList");

    function loadProducts() {
      const products = JSON.parse(localStorage.getItem("products")) || [];
      list.innerHTML = "";
      products.forEach((p, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${p.ma}</strong> - ${p.name} - ${Number(p.price).toLocaleString()}₫ 
          <img src="${p.image || 'https://via.placeholder.com/50'}" 
               alt="ảnh" width="50" height="50" style="object-fit:cover;margin-left:10px;">
          <button data-index="${i}" class="delete-btn">Xóa</button>
        `;
        list.appendChild(li);
      });
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = e.target.dataset.index;
          const products = JSON.parse(localStorage.getItem("products")) || [];
          products.splice(idx, 1);
          localStorage.setItem("products", JSON.stringify(products));
          loadProducts();
        });
      });
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      const ma = document.getElementById("ma").value.trim();
      const name = document.getElementById("name").value.trim();
      const price = document.getElementById("price").value.trim();
      const image = document.getElementById("image").value.trim();
      const brand = document.getElementById("brand").value;

      if (!ma || !name || !price) {
        alert("Vui lòng nhập đủ MÃ, TÊN và GIÁ!");
        return;
      }

      const products = JSON.parse(localStorage.getItem("products")) || [];

      if (products.some(p => p.ma === ma)) {
        alert("Mã sản phẩm đã tồn tại!");
        return;
      }

      products.push({ ma, name, price, image,brand });
      localStorage.setItem("products", JSON.stringify(products));
      form.reset();
      loadProducts();
    });

    loadProducts();
  }

  // --- GIÁ (tạo hàm trống tránh lỗi) ---
  function renderPrices() {
    contentArea.innerHTML = `<p>Chức năng bảng giá đang phát triển...</p>`;
  }

  // ==============================
  // 🔹 7. ĐƠN HÀNG & TỒN KHO
  // ==============================
  function renderOrders() {
    contentArea.innerHTML = `<h3>📦 Quản lý đơn hàng</h3><p>Chức năng đang phát triển...</p>`;
  }

  function renderStock() {
    contentArea.innerHTML = `<h3>🏪 Tồn kho</h3><p>Chức năng đang phát triển...</p>`;
  }

  // ==============================
  // 🔹 8. MENU CLICK
  // ==============================
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const section = item.getAttribute("data-section");
      switch (section) {
        case "users": renderUsers(); break;
        case "categories": renderCategories(); break;
        case "products": renderProducts(); break;
        case "import": renderImport(); break;
        case "orders": renderOrders(); break;
        case "stock": renderStock(); break;
        default:
          contentArea.innerHTML = `<p>Bạn đang xem phần: <b>${section}</b></p>`;
      }
    });
  });

  // ==============================
  // 🔹 9. ĐĂNG XUẤT ADMIN
  // ==============================
  document.getElementById("logout").addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn đăng xuất không?")) {
      window.location.href = "login.html";
    }
  });
});