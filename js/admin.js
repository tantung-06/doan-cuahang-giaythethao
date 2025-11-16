// ====================== THÔNG TIN ĐĂNG NHẬP ADMIN ===================================
const ADMIN_CRED = { user: 'admin', pass: '123' };

// === Xử lý đăng nhập ===
const loginScreen = document.getElementById('login-screen')
const adminApp = document.getElementById('admin-app')
document.getElementById('login-btn').addEventListener('click', attemptLogin)
document.getElementById('admin-pass').addEventListener('keydown', e=>{ if(e.key==='Enter') attemptLogin() })

// Hàm thử đăng nhập
function attemptLogin(){
  const u = document.getElementById('admin-user').value.trim();
  const p = document.getElementById('admin-pass').value.trim();
  const msg = document.getElementById('login-msg');
  
  if(u===ADMIN_CRED.user && p===ADMIN_CRED.pass){
    loginScreen.style.display='none'
    adminApp.style.display='flex'
    ensureSample(); 
    renderAll(); 
    bindNav();
  } else {
    msg.textContent = 'Sai tài khoản hoặc mật khẩu'
  }
}

// Xử lý nút đăng xuất
document.getElementById('logout').addEventListener('click', ()=>{
  if(!confirm('Bạn có chắc chắn muốn đăng xuất?')) return;
  document.getElementById('admin-user').value='';
  document.getElementById('admin-pass').value='';
  document.getElementById('login-msg').textContent='';
  adminApp.style.display='none';
  loginScreen.style.display='flex';
})

// === Hàm hỗ trợ LocalStorage & dữ liệu mẫu ===
function uid(prefix='id'){return prefix+Math.random().toString(36).slice(2,9);}
function read(key){try{return JSON.parse(localStorage.getItem(key))||[]}catch(e){return[]}}
function write(key,val){localStorage.setItem(key,JSON.stringify(val))}

// --- Dữ liệu mẫu admin
function ensureSample(){
    // Mẫu người dùng
    if(!read('users').length){
        write('users',[
            {id:uid('u'),name:'Tan Tung',email:'tantung@gmail.com',password:'123',locked:false}
        ]);
    }

    // Mẫu danh mục & sản phẩm
    ensureSampleProducts();
    ensureSampleCategories();

    // Mẫu đơn hàng / phiếu nhập
    if(!read('orders').length) write('orders',[]);
    if(!read('imports').length) write('imports',[]);
}

// === Điều hướng (Navigation) ===
const sections = document.querySelectorAll('.section')
function bindNav(){
  document.querySelectorAll('.nav-admin button').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav-admin button').forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
    const s=btn.dataset.section
    document.getElementById('section-title').innerText = btn.innerText
    sections.forEach(sec=>sec.classList.add('hidden'))
    document.getElementById(s).classList.remove('hidden')
    renderAll()
  }))
}
// === Các hàm Render / CRUD ===
// Hiển thị thống kê tổng quan
function renderStats(){
  document.getElementById('stat-users').innerText = read('users').length
  document.getElementById('stat-products').innerText = read('products').length
  document.getElementById('stat-orders').innerText = read('orders').length
}

// =================================== QUẢN LÝ NGƯỜI DÙNG ========================================
// Hiển thị danh sách người dùng
function renderUsers(filter=''){
  const tbody=document.getElementById('users-table'); 
  tbody.innerHTML=''
  const users=read('users')
  
  // Lọc người dùng theo tên hoặc email
  users.filter(u=>!filter||u.name.toLowerCase().includes(filter)||u.email.toLowerCase().includes(filter))
    .forEach((u,i)=>{
      const tr=document.createElement('tr')
      tr.innerHTML=`
        <td>${i+1}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.locked?'<span style="color:red">Khóa</span>':'Hoạt động'}</td>
        <td>
          <button class="btn" onclick="editUser('${u.id}')">Sửa</button> 
          <button class="btn" onclick="toggleLockUser('${u.id}')">${u.locked?'Mở khoá':'Khoá'}</button> 
          <button class="btn" onclick="deleteUser('${u.id}')">Xóa</button>
        </td>`
      tbody.appendChild(tr)
    })
}

// Sửa thông tin người dùng
window.editUser = function(id){
  const users=read('users');
  const u=users.find(x=>x.id===id);
  const name=prompt('Tên',u.name); 
  if(name!=null){
    u.name=name;
    
    // Nếu đây là user đang đăng nhập, cập nhật luôn localStorage 'user'
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if(currentUser && currentUser.id === id){
      currentUser.name = name;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    write('users',users);
    renderUsers();
    renderStats()
  }
}

// Khóa/Mở khóa tài khoản người dùng
window.toggleLockUser=function(id){
  const users=read('users');
  const u=users.find(x=>x.id===id);
  u.locked=!u.locked;
  
  // Nếu khóa user đang đăng nhập, xóa session của họ
  if(u.locked){
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if(currentUser && currentUser.id === id){
      localStorage.removeItem('user');
      alert('User này đang đăng nhập và sẽ bị đăng xuất!');
    }
  }
  
  write('users',users);
  renderUsers()
}

// Xóa người dùng
window.deleteUser=function(id){
  if(!confirm('Xóa người dùng?'))return;
  let users=read('users');
  const user = users.find(x => x.id === id);
  
  // Xóa giỏ hàng và địa chỉ của user này
  if(user && user.email){
    localStorage.removeItem('cart_' + user.email);
    localStorage.removeItem('address_' + user.email);
  }
  
  users=users.filter(x=>x.id!==id);
  write('users',users);
  renderUsers();
  renderStats()
}

// Thêm người dùng mới
document.getElementById('add-user').addEventListener('click',()=>{
  const name=prompt('Tên người dùng');
  if(!name) return;
  const email=prompt('Email');
  if(!email)return;
  const pwd=prompt('Mật khẩu');
  const users=read('users');
  users.push({id:uid('u'),name,email,password:pwd||'123456',locked:false});
  write('users',users);
  renderUsers();
  renderStats()
})

// Tìm kiếm người dùng
document.getElementById('user-search').addEventListener('input',e=>renderUsers(e.target.value.toLowerCase()))

// ==================================== QUẢN LÝ DANH MỤC ===============================================
// Hiển thị danh sách danh mục
function renderCategories(){
    const list=document.getElementById('category-list');
    list.innerHTML='';
    const cats=read('categories');

    cats.forEach(c=>{
        const li=document.createElement('li');
        li.style.marginBottom='8px';
        li.innerHTML=`${c.name} 
            <button class="btn" onclick="editCategory('${c.id}')">Sửa</button> 
            <button class="btn" onclick="deleteCategory('${c.id}')">Xóa</button>`;
        list.appendChild(li);
    });

    // Dropdown lọc
    const filter=document.getElementById('filter-category');
    const profit=document.getElementById('profit-category');
    if(filter){filter.innerHTML='<option value="">Tất cả danh mục</option>'}
    if(profit){profit.innerHTML='<option value="">Chọn danh mục</option>'}
    cats.forEach(c=>{
        if(filter) filter.innerHTML+=`<option value="${c.name}">${c.name}</option>`;
        if(profit) profit.innerHTML+=`<option value="${c.id}">${c.name}</option>`;
    });
}

// Sửa danh mục
window.editCategory=function(id){
  const cats=read('categories');
  const c=cats.find(x=>x.id===id);
  const name=prompt('Tên danh mục',c.name);
  if(name!=null){
    c.name=name;
    write('categories',cats);
    renderCategories()
  }
}

// Xóa danh mục
window.deleteCategory=function(id){
  if(!confirm('Xóa danh mục?'))return;
  let cats=read('categories');
  cats=cats.filter(x=>x.id!==id);
  write('categories',cats);
  renderCategories()
}

// Thêm danh mục mới
document.getElementById('add-category').addEventListener('click',()=>{
  const name=document.getElementById('category-name').value.trim(); 
  if(!name){
    alert('Nhập tên');
    return;
  } 
  const cats=read('categories');
  cats.push({id:uid('cat'),name,profitPercent:0});
  write('categories',cats);
  document.getElementById('category-name').value='';
  renderCategories()
})

// ================================== QUẢN LÝ SẢN PHẨM ==========================================
let productsCache = [];

// --- Đọc / Ghi localStorage ---
function read(key){ return JSON.parse(localStorage.getItem(key)||'[]'); }
function write(key,data){ localStorage.setItem(key, JSON.stringify(data)); }

// --- Tạo UID ngẫu nhiên ---
function uid(prefix='id'){ return prefix+Math.random().toString(36).substr(2,6); }

// --- Khởi tạo sản phẩm mẫu ---
function ensureSampleProducts() {
    let prods = read('products');
    if(prods.length===0){
      const sampleProducts = [
        {id:"sp-gcb-1",sku:'SP001',name:'Giày Chạy Bộ Nam Nike Pegasus Plus - Đen',category:['Giày Chạy Bộ', 'Giày Nam'],priceCurrent:3485400,company:'NIKE',img:'./assest/img/Nike_Pegasus_Plus.jpg',stock:12,hidden:false},
        {id:"sp-gcb-2",sku:'SP002',name:'Giày Chạy Bộ Nam Nike React Infinity Run 4 - Đen',category:['Giày Chạy Bộ','Giày Nam'],priceCurrent:3000000,company:'NIKE',img:'./assest/img/Nike_Reactx_Infinity_Run4.jpg',stock:8,hidden:false},
        {id:"sp-gcb-3",sku:'SP003',name:'Giày Chạy Bộ Nữ Under Armour Halo Runner',category:['Giày Chạy Bộ','Giày Nữ'],priceCurrent:2000000,company:'UNDER ARMOUR',img:'./assest/img/Under_Armour_Halo_Runner.jpg',stock:10,hidden:false},
        {id:"sp-gcb-4",sku:'SP004',name:'Giày Chạy Bộ Nam Puma Deviate Nitro 3 - Xanh Lá',category:['Giày Chạy Bộ','Giày Nam'],priceCurrent:5000000,company:'PUMA',img:'./assest/img/Puma_Deviate_Nitro3.jpg',stock:7,hidden:false},
        {id:"sp-gcb-5",sku:'SP005',name:'Giày Chạy Bộ Nam HOKA Bondi 9 Wide - Nâu',category:['Giày Chạy Bộ','Giày Nam'],priceCurrent:4000000,company:'HOKA',img:'./assest/img/Hoka_Bondi_9_Wide.jpg',stock:5,hidden:false},
        {id:"sp-gcb-6",sku:'SP006',name:'Giày Chạy Bộ Nữ Asics Gel-Kayano 32 Lite-Show - Xanh Lá', category:['Giày Chạy Bộ','Giày Nữ'],priceCurrent:1000000,company:'ASICS', img:'./assest/img/Asics_Gel-Kayano_32_Lite-Show.jpg', stock:6,hidden:false},
        {id:"sp-gcb-7",sku:'SP007',name:'Giày Chạy Bộ Nữ On Running Cloudsurfer Max - Xanh Dương', category:['Giày Chạy Bộ','Giày Nữ'],  priceCurrent:2000000, company:'ON RUNNING', img:'./assest/img/On_Running_Cloudsurfer_Max.jpg', stock:8,hidden:false},
        {id:"sp-gcb-8",sku:'SP008',name:'Giày Chạy Bộ Nữ Nike Journey Run - Trắng', category:['Giày Chạy Bộ','Giày Nữ'],  priceCurrent:400000, company:'NIKE', img:'./assest/img/Nike_Journey_Run.jpg', stock:9,hidden:false},
        {id:"sp-gcb-9",sku:'SP009',name:'Giày Chạy Bộ Nữ Nike Structure 26 - Xanh Lá', category:['Giày Chạy Bộ','Giày Nữ'],  priceCurrent:4000000,company:'NIKE',  img:'./assest/img/Nike_Structure_26.jpg', stock:4,hidden:false},
        {id:"sp-gcb-10",sku:'SP010',name:'Giày Chạy Bộ Nam Nike Zoom Fly 6 - Cam', category:['Giày Chạy Bộ','Giày Nam'], priceCurrent:3000000,  company:'NIKE', img:'./assest/img/Nike_Zoom_Fly_6.jpg', stock:7,hidden:false},
        {id:"sp-gbd-1",sku:'SP011',name:'Giày Đá Bóng Nam Nike Legend 10 Academy - Xanh Dương', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:3000000,   company:'NIKE',img:'./assest/img/Nike_Legend_10_Academy.jpg', stock:10,hidden:false},
        {id:"sp-gbd-2",sku:'SP012',name:'Giày Đá Bóng Nam Nike Phantom Luna li Academy - Xanh Dương', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:3000000,  company:'NIKE',img:'./assest/img/Nike_Phantom_Lunali_Academy.jpg', stock:9,hidden:false},
        {id:"sp-gbd-3",sku:'SP013',name:'Giày Đá Bóng Nam Adidas Samba Messi - Trắng', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:4000000,   company:'ADIDAS',img:'./assest/img/Adidas_Samba_Messi.jpg', stock:8,hidden:false},
        {id:"sp-gbd-4",sku:'SP014',name:'Giày Đá Bóng Nam Adidas F50 Elite - Tím', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:4000000,  company:'ADIDAS',img:'./assest/img/Adidas_F50_Elite.jpg', stock:6,hidden:false},
        {id:"sp-gbd-5",sku:'SP015',name:'Giày Đá Bóng Nam Puma King Match Tt - Trắng', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:4000000,  company:'PUMA', img:'./assest/img/Puma_King_Match_Tt.jpg', stock:7,hidden:false},
        {id:"sp-gbd-6",sku:'SP016',name:'Giày Đá Bóng Nam Adidas Predator Club - Đen', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:1000000, company:'ADIDAS', img:'./assest/img/Adidas_Predator_Club.jpg', stock:6,hidden:false},
        {id:"sp-gbd-7",sku:'SP017',name:'Giày Đá Bóng Nam Adidas Samba Inter Milan - Trắng', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:1000000,  company:'ADIDAS', img:'./assest/img/Adidas_Samba_Inter_Milan.jpg', stock:5,hidden:false},
        {id:"sp-gbd-8",sku:'SP018',name:'Giày Đá Bóng Nam Nike Mercurial Vapor 16 Academy Kylian Mbappé - Vàng', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:1000000, company:'NIKE', img:'./assest/img/Nike_Mercurial_Vapol_16_Academy.jpg', stock:8,hidden:false},
        {id:"sp-gbd-9",sku:'SP019',name:'Giày Đá Bóng Nam Nike Zoom Vapor 16 Academy Tf - Đỏ', category:['Giày Đá Bóng','Giày Nam'],priceCurrent:1000000,  company:'NIKE',  img:'./assest/img/Nike_Zoom_Vapor_16_Academy_Tf.jpg', stock:9,hidden:false},
        {id:"sp-gbd-10",sku:'SP020',name:'Giày Đá Bóng Nam Puma Ultra 6 Play Tt - Cam', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:4000000, company:'PUMA', img:'./assest/img/Puma_Ultra_6_Play_Tt.jpg', stock:7,hidden:false},
        {id:"sp-gsnk-1",sku:'SP021',name:'Giày Sneaker Nữ On Running Cloudtilt - Xám', category:['Giày Sneaker','Giày Nữ'], priceCurrent:4000000, company:'ON RUNNING',  img:'./assest/img/On_Running_Cloudtilt.jpg', stock:8,hidden:false},
        {id:"sp-gsnk-2",sku:'SP022',name:'Giày Sneaker Nữ Adidas Tekwen - Đen', category:['Giày Sneaker','Giày Nữ'],priceCurrent:500000,   company:'ADIDAS', img:'./assest/img/Adidas_Tekwen.jpg', stock:6,hidden:false},
        {id:"sp-gsnk-3",sku:'SP023',name:'Giày Sneaker Nữ Under Armour Shift', category:['Giày Sneaker','Giày Nữ'], priceCurrent:500000,   company:'UNDER ARMOUR',img:'./assest/img/Under_Armour_Shift.jpg', stock:5,hidden:false},
        {id:"sp-gsnk-4",sku:'SP024',name:'Giày Sneaker Nữ Asics Gel-1130 - Be', category:['Giày Sneaker','Giày Nữ'], priceCurrent:500000,  company:'ASICS', img:'./assest/img/Asics_Gel-1130.jpg', stock:7,hidden:false},
        {id:"sp-gsnk-5",sku:'SP025',name:'Giày Sneaker Nữ Nike Air Force 1 07 - Trắng', category:['Giày Sneaker','Giày Nữ'],  priceCurrent:500000, company:'NIKE', img:'./assest/img/Nike_Air_Force.jpg', stock:8,hidden:false},
        {id:"sp-gsnk-6",sku:'SP026',name:'Giày Sneaker Nam Asics Jog 100S - Đen', category:['Giày Sneaker','Giày Nam'], priceCurrent:6000000,  company:'ASICS', img:'./assest/img/Asics_Jog_100S.jpg', stock:6,hidden:false},
        {id:"sp-gsnk-7",sku:'SP027',name:'Giày Sneaker Nam Asics Japan S - Trắng', category:['Giày Sneaker','Giày Nam'],priceCurrent:4000000,   company:'ASICS', img:'./assest/img/Asics_Japan_S.jpg', stock:5,hidden:false},
        {id:"sp-gsnk-8",sku:'SP028',name:'Giày Sneaker Nam Nike V2K Run - Đen', category:['Giày Sneaker','Giày Nam'], priceCurrent:3400000,  company:'NIKE', img:'./assest/img/Nike_V2K_Run.jpg', stock:7,hidden:false},
        {id:"sp-gsnk-9",sku:'SP029',name:'Giày Sneaker Nam Nike Big Low - Trắng', category:['Giày Sneaker','Giày Nam'],priceCurrent:3400000,   company:'NIKE', img:'./assest/img/Nike_Big_Low.jpg', stock:8,hidden:false},
        {id:"sp-gsnk-10",sku:'SP030',name:'Giày Sneaker Nam Adidas Grand Court 2.0 - Be', category:['Giày Sneaker','Giày Nam'], priceCurrent:3400000,   company:'ADIDAS',img:'./assest/img/Adidas_Grand_Court_2.jpg', stock:6,hidden:false}
      ];

      write('products', sampleProducts);
      productsCache = sampleProducts;
    } else {
        productsCache = prods.map(p=>({...p, hidden: p.hidden || false})); // đảm bảo có hidden
    }
}

// --- Khởi tạo danh mục ---
function ensureSampleCategories() {
    const cats = new Set();
    productsCache.forEach(p => {
        if(Array.isArray(p.category)) p.category.forEach(c => cats.add(c));
        else cats.add(p.category);
    });
    const sampleCats = Array.from(cats).map(name => ({id:uid('cat'),name, profitPercent:0}));
    write('categories', sampleCats);

    const categorySelect = document.getElementById('filter-category');
    if(categorySelect){
        categorySelect.innerHTML = '<option value="">--Tất cả danh mục--</option>';
        sampleCats.forEach(c=>{
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            categorySelect.appendChild(opt);
        });
    }
}

// --- Định dạng tiền ---
function formatVND(n){ return new Intl.NumberFormat('vi-VN').format(n)+'₫'; }

// --- Hiển thị sản phẩm ---
function renderProducts(filter='', catFilter='', showHidden=true){
    const tbody = document.getElementById('products-table');
    if(!tbody) return;
    tbody.innerHTML = '';

    const filtered = productsCache.filter(p =>
        (showHidden || !p.hidden) &&
        (!filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.sku.toLowerCase().includes(filter.toLowerCase())) &&
        (!catFilter || (Array.isArray(p.category)?p.category.includes(catFilter):p.category===catFilter))
    );

    if(filtered.length===0){
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#888;">Không có sản phẩm nào</td></tr>';
        return;
    }

    filtered.forEach((p,i)=>{
        const tr = document.createElement('tr');
        tr.innerHTML=`
            <td>${i+1}</td>
            <td><img src="${p.img}" width="60" height="60" style="object-fit:cover;border-radius:6px"></td>
            <td>${p.name}</td>
            <td>${p.sku}</td>
            <td>${Array.isArray(p.category)?p.category.join(', '):p.category}</td>
            <td>
                <div style="color:#e53935;font-weight:bold;">${formatVND(p.priceCurrent)}</div>
            </td>
            <td>${p.stock||0}</td>
            <td>${p.company||''}</td>
            <td>
                <button class="btn small" onclick="editProduct('${p.id}')">Sửa</button>
                <button class="btn small" onclick="toggleHiddenProduct('${p.id}')">${p.hidden?'Hiện':'Ẩn'}</button>
                <button class="btn small danger" onclick="deleteProduct('${p.id}')">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Thêm sản phẩm ---
document.getElementById('add-product')?.addEventListener('click', ()=>{
    const sku = prompt('Mã SKU:'); if(!sku) return;
    const name = prompt('Tên sản phẩm:'); if(!name) return;
    const priceCurrent = prompt('Giá hiện tại:'); 
    const company = prompt('Thương hiệu:'); 
    const img = prompt('Link ảnh:'); 
    const category = prompt('Danh mục (ngăn cách dấu ,):');

    const newProduct = {
        id: uid('p'),
        sku,
        name,
        priceCurrent: priceCurrent||'0',
        company,
        img,
        category: category ? category.split(',').map(x=>x.trim()) : [],
        stock: 0,
        hidden: false
    };

    productsCache.push(newProduct);
    write('products', productsCache);
    ensureSampleCategories();
    renderProducts(searchInput.value.trim(), categorySelect.value, true);
});

// --- Sửa sản phẩm ---
window.editProduct = function(id){
    const p = productsCache.find(x => x.id===id);
    if(!p) return alert('Không tìm thấy sản phẩm.');

    const sku = prompt('Mã SKU:', p.sku); if(sku!=null) p.sku = sku;
    const name = prompt('Tên sản phẩm:', p.name); if(name!=null) p.name = name;
    const priceCurrent = prompt('Giá hiện tại:', p.priceCurrent); if(priceCurrent!=null) p.priceCurrent = priceCurrent;
    const company = prompt('Thương hiệu:', p.company); if(company!=null) p.company = company;
    const img = prompt('Link ảnh:', p.img); if(img!=null) p.img = img;
    const category = prompt('Danh mục (ngăn cách dấu ,):', Array.isArray(p.category)?p.category.join(', '):p.category);
    if(category!=null) p.category = category.split(',').map(x=>x.trim());

    write('products', productsCache);
    ensureSampleCategories();
    renderProducts(searchInput.value.trim(), categorySelect.value, true);
};

// --- Ẩn/Hiện sản phẩm ---
window.toggleHiddenProduct = function(id){
    const p = productsCache.find(x => x.id===id);
    if(!p) return;
    p.hidden = !p.hidden;
    write('products', productsCache);
    renderProducts(searchInput.value.trim(), categorySelect.value, true);
};

// --- Xóa sản phẩm ---
window.deleteProduct = function(id){
    if(!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    productsCache = productsCache.filter(p => p.id!==id);
    write('products', productsCache);
    ensureSampleCategories();
    renderProducts(searchInput.value.trim(), categorySelect.value, true);
};

// --- Tìm kiếm & lọc danh mục ---
const searchInput = document.getElementById('product-search');
const categorySelect = document.getElementById('filter-category');
searchInput?.addEventListener('input', ()=>renderProducts(searchInput.value.trim(), categorySelect.value, true));
categorySelect?.addEventListener('change', ()=>renderProducts(searchInput.value.trim(), categorySelect.value, true));

// --- Khởi tạo ---
ensureSampleProducts();
ensureSampleCategories();
renderProducts('', '', true);

/// ================================ QUẢN LÝ PHIẾU NHẬP =================================================
function read(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Tạo mã phiếu tự động
function generateImportID() {
  return "IMP" + Date.now();
}

// Hiển thị danh sách phiếu nhập
function renderImports() {
  const tbody = document.getElementById("imports-table");
  const imports = read("imports");
  tbody.innerHTML = "";

  imports.forEach((imp, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${imp.date}</td>
      <td>${imp.items.length} SP</td>
      <td>${imp.totalQty}</td>
      <td>${imp.status}</td>
      <td><button class="btn small" onclick="viewImport('${imp.id}')">Xem</button></td>
      <td><button class="btn small danger" onclick="deleteImport('${imp.id}')">X</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Xem chi tiết phiếu nhập
function viewImport(id) {
  const imports = read("imports");
  const imp = imports.find(i => i.id === id);
  if (!imp) return;

  let text = `PHIẾU NHẬP: ${id}\nNgày: ${imp.date}\n\nSẢN PHẨM:\n`;
  imp.items.forEach(item => {
    text += `- ${item.name}: SL ${item.qty}\n`;
  });
  alert(text);
}

// Xóa phiếu nhập
function deleteImport(id) {
  let imports = read("imports");
  imports = imports.filter(i => i.id !== id);
  write("imports", imports);
  renderImports();
  alert("Đã xóa phiếu nhập");
}

// ==== TẠO PHIẾU NHẬP ============
const addImportBtn = document.getElementById("add-import");
const importForm = document.getElementById("import-form");
const importProduct = document.getElementById("import-product");
const importQty = document.getElementById("import-qty");
const importStatus = document.getElementById("import-status");
const btnSaveImport = document.getElementById("btn-save-import");
const btnCancelImport = document.getElementById("btn-cancel-import");

// Điền danh sách sản phẩm vào select
function loadProductsToSelect() {
  const products = read("products");
  importProduct.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

// Hiển thị / ẩn form ngay dưới nút
addImportBtn.onclick = () => {
  importForm.classList.toggle("hidden");
  loadProductsToSelect();
};

// Hủy phiếu nhập
btnCancelImport.onclick = () => {
  importForm.classList.add("hidden");
  importQty.value = 1;
};

// Lưu phiếu nhập
btnSaveImport.onclick = () => {
  const date = new Date().toISOString().split("T")[0];
  const productId = importProduct.value;
  const qty = Number(importQty.value);
  const status = importStatus.value;

  if (!productId || qty <= 0) {
    alert("Chọn sản phẩm và nhập số lượng hợp lệ");
    return;
  }

  // Lấy danh sách sản phẩm
  const products = read("products");
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  // Cập nhật số lượng kho
  prod.stock = (prod.stock || 0) + qty;
  write("products", products);

  // **Cập nhật productsCache để đồng bộ dữ liệu**
  productsCache = products;

  // **Cập nhật giao diện danh sách sản phẩm ngay**
  const searchInput = document.getElementById('product-search');
  const categorySelect = document.getElementById('filter-category');
  if (typeof renderProducts === "function") {
    renderProducts(
      searchInput ? searchInput.value.trim() : '', 
      categorySelect ? categorySelect.value : '', 
      true
    );
  }

  // Tạo phiếu nhập mới
  const imports = read("imports");
  imports.push({
    id: generateImportID(),
    date,
    totalQty: qty,
    status: status === "done" ? "Hoàn tất" : "Chờ duyệt",
    items: [{ id: prod.id, name: prod.name, qty }]
  });
  write("imports", imports);

  // Render lại danh sách phiếu nhập
  renderImports();

  // Reset và ẩn form
  importForm.classList.add("hidden");
  importQty.value = 1;

  alert("Đã tạo phiếu nhập thành công");
};

// Khởi tạo danh sách
renderImports();

// ======================================== QUẢN LÝ ĐƠN HÀNG ==================================================
const statusMap = {
  'new': 'Mới',
  'processing': 'Đang xử lý',
  'done': 'Đã giao',
  'cancel': 'Hủy'
};

// Hiển thị danh sách đơn hàng
function renderOrders(filter = '') {
  const tbody = document.getElementById('orders-table');
  tbody.innerHTML = '';

  const orders = read('orders') || [];
  orders
    .filter(o => !filter || o.status === filter)
    .forEach((o, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${o.date}</td>
        <td>${o.customerName}</td>
        <td>${statusMap[o.status] || o.status}</td>
        <td>${formatVND(o.total)}</td>
        <td>
          <button class="btn" onclick="viewOrder('${o.id}')">Xem</button>
          <button class="btn" onclick="updateOrderStatus('${o.id}')">Cập nhật</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

// Xem chi tiết đơn hàng
window.viewOrder = function(id) {
  const orders = read('orders') || [];
  const order = orders.find(o => o.id === id);
  if (!order) return alert('Không tìm thấy đơn hàng!');

  const address = order.address || {};
  let content = `Đơn hàng: ${order.id}
Khách hàng: ${order.customerName}
Email: ${order.email}
Số điện thoại: ${address.phone || 'Chưa cập nhật'}
Ngày: ${order.date}
Địa chỉ: ${address.address || 'Chưa cập nhật'}
Ghi chú: ${address.note || 'Không có'}
Trạng thái: ${statusMap[order.status] || order.status}

Sản phẩm:\n`;

  order.items.forEach((item, i) => {
    const itemTotal = item.price * item.qty;
    content += `${i + 1}. ${item.name} | Size: ${item.size} | Số lượng: ${item.qty} | Giá: ${formatVND(item.price)} | Thành tiền: ${formatVND(itemTotal)}\n`;
  });

  content += `\nTổng tiền: ${formatVND(order.total)}`;
  alert(content);
}

// Cập nhật trạng thái đơn hàng
window.updateOrderStatus = function(id) {
  const orders = read('orders') || [];
  const order = orders.find(o => o.id === id);
  if (!order) return alert('Không tìm thấy đơn hàng!');

  const tbody = document.getElementById('orders-table');
  const tr = Array.from(tbody.children).find(r => r.children[0].textContent == orders.indexOf(order) + 1);
  if (!tr) return;

  const statusCell = tr.children[3];
  statusCell.innerHTML = `
    <select id="status-select">
      ${Object.entries(statusMap).map(([key, val]) =>
        `<option value="${key}" ${key === order.status ? 'selected' : ''}>${val}</option>`
      ).join('')}
    </select>
    <button onclick="saveOrderStatus('${id}')">Lưu</button>
  `;
}

// Lưu trạng thái đơn hàng
window.saveOrderStatus = function(id) {
  const select = document.getElementById('status-select');
  if (!select) return;

  const orders = read('orders') || [];
  const order = orders.find(o => o.id === id);
  if (!order) return;

  order.status = select.value;
  write('orders', orders);
  renderOrders(document.getElementById('order-filter').value);
}

// Gắn sự kiện lọc khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
  renderOrders();

  const orderFilter = document.getElementById('order-filter');
  orderFilter.addEventListener('change', () => {
    renderOrders(orderFilter.value);
  });
});

// Hàm reload dữ liệu products từ localStorage
function reloadProducts() {
    productsCache = read('products').map(p => ({...p, hidden: p.hidden || false}));
    renderProducts(searchInput?.value?.trim() || '', categorySelect?.value || '', true);
}

// Tự động reload khi localStorage thay đổi
window.addEventListener('storage', (e) => {
    if (e.key === 'products') {
        reloadProducts();
    }
});

// ============================== QUẢN LÝ GIÁ BÁN VÀ LỢI NHUẬN =======================================
function getCategoryProfitList(){ return read('categoryProfit') || []; }
function saveCategoryProfitList(list){ write('categoryProfit', list); }
function getProductProfitList(){ return read('productProfit') || []; }
function saveProductProfitList(list){ write('productProfit', list); }

function getProductProfit(product){
  const productProfit = getProductProfitList();
  const found = productProfit.find(x => x.id === product.id);
  if(found) return Number(found.profit) || 0;

  const categoryProfit = getCategoryProfitList();
  let max = 0;
  const cats = Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []);
  cats.forEach(cat => {
    const cp = categoryProfit.find(c => c.category === cat);
    if(cp && Number(cp.profit) > max) max = Number(cp.profit);
  });
  return max;
}

function calcSellingPrice(cost, profitPercent){
  cost = Number(cost) || 0;
  profitPercent = Number(profitPercent) || 0;
  return Math.round(cost * (1 + profitPercent/100));
}

function getProductCostFallback(p){
  if(p == null) return 0;
  if(p.cost != null && p.cost !== '') return Number(p.cost);
  if(p.priceCurrent != null && p.priceCurrent !== '') return Number(p.priceCurrent);
  return 0;
}

function populatePricingSelections(){
  const profitCategory = document.getElementById('profit-category');
  const productSelect = document.getElementById('product-price-select');
  if(!profitCategory || !productSelect) return;

  const products = read('products') || [];
  const cats = new Set();
  products.forEach(p => {
    if(Array.isArray(p.category)) p.category.forEach(c => cats.add(c));
    else if(p.category) cats.add(p.category);
  });

  profitCategory.innerHTML = '<option value="">Chọn danh mục</option>';
  Array.from(cats).sort().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    profitCategory.appendChild(opt);
  });

  productSelect.innerHTML = '<option value="">Chọn sản phẩm</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name}${p.sku? ' — ' + p.sku : ''}`;
    productSelect.appendChild(opt);
  });
}

function applyCategoryProfit(){
  const profitCategory = document.getElementById('profit-category');
  const profitPercentInput = document.getElementById('profit-percent');
  if(!profitCategory || !profitPercentInput) return alert('UI pricing chưa sẵn sàng');

  const cat = profitCategory.value;
  const profit = Number(profitPercentInput.value);
  if(!cat) return alert('Chọn danh mục trước');
  if(isNaN(profit)) return alert('Nhập % lợi nhuận hợp lệ');

  const list = getCategoryProfitList();
  const exist = list.find(x => x.category === cat);
  if(exist) exist.profit = profit;
  else list.push({category: cat, profit: profit});
  saveCategoryProfitList(list);

  let products = read('products') || [];
  const productProfit = getProductProfitList();
  products = products.map(p => {
    const cats = Array.isArray(p.category) ? p.category : (p.category? [p.category] : []);
    if(cats.includes(cat)){
      const override = productProfit.find(pp => pp.id === p.id);
      if(!override){
        const cost = getProductCostFallback(p);
        p.priceCurrent = calcSellingPrice(cost, profit);
      }
    }
    return p;
  });
  write('products', products);

  populatePricingSelections();
  renderProductPricingTable();
  if(typeof renderProducts === 'function') renderProducts('', '', true);
  if(typeof renderProductsUser === 'function') renderProductsUser();

  alert('Đã áp dụng % lợi nhuận cho danh mục: ' + cat);
}

function saveProductPriceDirect(){
  const productSelect = document.getElementById('product-price-select');
  const productPriceInput = document.getElementById('product-price-input');
  if(!productSelect || !productPriceInput) return alert('UI pricing chưa sẵn sàng');

  const id = productSelect.value;
  let price = Number(productPriceInput.value);
  if(!id) return alert('Chọn sản phẩm trước');
  if(isNaN(price) || price < 0) return alert('Nhập giá hợp lệ');

  const products = read('products') || [];
  const p = products.find(x => x.id === id);
  if(!p) return alert('Không tìm thấy sản phẩm');

  p.priceCurrent = Math.round(price);
  write('products', products);

  renderProductPricingTable();
  if(typeof renderProducts === 'function') renderProducts('', '', true);
  if(typeof renderProductsUser === 'function') renderProductsUser();

  alert('Đã lưu giá cho sản phẩm.');
}

function saveProductProfitOverride(id, profitValue){
  const list = getProductProfitList();
  const exist = list.find(x => x.id === id);
  if(exist) exist.profit = Number(profitValue);
  else list.push({id: id, profit: Number(profitValue)});
  saveProductProfitList(list);

  const products = read('products') || [];
  const p = products.find(x => x.id === id);
  if(p){
    const cost = getProductCostFallback(p);
    p.priceCurrent = calcSellingPrice(cost, profitValue);
    write('products', products);
  }
}

function renderProductPricingTable(){
  const pricingSection = document.getElementById('pricing');
  if(!pricingSection) return;

  const old = document.getElementById('pricing-product-table');
  if(old) old.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'pricing-product-table';
  wrapper.style.marginTop = '12px';
  wrapper.innerHTML = '<h4>Danh sách sản phẩm (tóm tắt)</h4>';

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.innerHTML = `
    <thead>
      <tr style="text-align:left;background:#f5f5f5">
        <th style="padding:6px">#</th>
        <th style="padding:6px">Ảnh</th>
        <th style="padding:6px">Tên</th>
        <th style="padding:6px">Giá vốn</th>
        <th style="padding:6px">% Lợi nhuận</th>
        <th style="padding:6px">Giá bán</th>
        <th style="padding:6px">Hành động</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  wrapper.appendChild(table);
  pricingSection.appendChild(wrapper);

  const tbody = table.querySelector('tbody');
  const products = read('products') || [];
  const productProfit = getProductProfitList();

  products.forEach((p, idx) => {
    const cost = getProductCostFallback(p);
    const appliedProfit = getProductProfit(p);
    const selling = calcSellingPrice(cost, appliedProfit);

    const tr = document.createElement('tr');
    tr.style.borderTop = '1px solid #eee';
    tr.innerHTML = `
      <td style="padding:6px;vertical-align:middle">${idx+1}</td>
      <td style="padding:6px;vertical-align:middle"><img src="${p.img||''}" width="48" style="object-fit:cover;border-radius:4px"></td>
      <td style="padding:6px;vertical-align:middle">${p.name}</td>
      <td style="padding:6px;vertical-align:middle">${formatVND(cost)}</td>
      <td style="padding:6px;vertical-align:middle">
        <input type="number" data-pid="${p.id}" class="pricing-profit-input" value="${appliedProfit}" style="width:80px">
      </td>
      <td style="padding:6px;vertical-align:middle">${formatVND(selling)}</td>
      <td style="padding:6px;vertical-align:middle">
        <button class="btn small apply-product-profit" data-id="${p.id}">Áp dụng</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  wrapper.querySelectorAll('.apply-product-profit').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const input = wrapper.querySelector(`input[data-pid="${id}"]`);
      const v = Number(input.value);
      if(isNaN(v)) return alert('Nhập % lợi nhuận hợp lệ');
      saveProductProfitOverride(id, v);
      renderProductPricingTable();
      if(typeof renderProducts === 'function') renderProducts('', '', true);
      if(typeof renderProductsUser === 'function') renderProductsUser();
      alert('Đã lưu % lợi nhuận cho sản phẩm');
    };
  });
}

function initPricingModule(){
  populatePricingSelections();
  renderProductPricingTable();

  const applyBtn = document.getElementById('apply-profit');
  const savePriceBtn = document.getElementById('save-product-price');

  applyBtn?.addEventListener('click', applyCategoryProfit);
  savePriceBtn?.addEventListener('click', saveProductPriceDirect);

  const productSelect = document.getElementById('product-price-select');
  const productPriceInput = document.getElementById('product-price-input');
  productSelect?.addEventListener('change', ()=> {
    const id = productSelect.value;
    if(!id){ productPriceInput.value = ''; return; }
    const products = read('products') || [];
    const p = products.find(x => x.id === id);
    if(p) productPriceInput.value = p.priceCurrent || '';
  });
}

window.initPricingModule = initPricingModule;
window.renderProductPricingTable = renderProductPricingTable;
window.populatePricingSelections = populatePricingSelections;

window.addEventListener('load', ()=> {
  setTimeout(()=> { try{ initPricingModule(); }catch(e){ /* ignore */ } }, 50);
});

// ================================= QUẢN LÝ TỒN KHO ====================================================
function renderInventory() {
    const products = read('products');
    const selectedProduct = document.getElementById('inventory-product').value;

    // Lọc theo sản phẩm nếu chọn
    let filtered = selectedProduct ? products.filter(p => p.id === selectedProduct) : products.slice();

    // Sắp xếp: sản phẩm hết hàng (stock=0) lên đầu
    filtered.sort((a, b) => (b.stock === 0 ? 1 : 0) - (a.stock === 0 ? 1 : 0));

    const wrap = document.getElementById('inventory-result');
    wrap.innerHTML = '';

    if (!filtered.length) {
        wrap.innerHTML = '<div class="small">Không có sản phẩm nào</div>';
    } else {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';

        filtered.forEach(p => {
            const li = document.createElement('li');
            li.style.marginBottom = '6px';
            li.style.padding = '6px';
            li.style.border = '1px solid #ddd';
            li.style.borderRadius = '4px';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            // Nếu stock = 0 thì màu đỏ
            if(p.stock === 0) li.style.backgroundColor = '#ffe6e6';

            li.innerHTML = `
                <span>${p.name} - Tồn: ${p.stock}</span>
                <button class="btn" onclick="goToProduct('${p.id}')">Mở</button>
            `;
            ul.appendChild(li);
        });
        wrap.appendChild(ul);
    }
}

// Chuyển đến sản phẩm trong bảng và highlight
window.goToProduct = function(id){
    document.querySelector('[data-section="products"]').click();
    setTimeout(() => {
        const tr = Array.from(document.querySelectorAll('#products-table tr'))
                        .find(row => row.querySelector(`button[onclick*="${id}"]`));
        if(tr){
            tr.scrollIntoView({behavior:'smooth', block:'center'});
            tr.style.backgroundColor = '#fffae6';
            setTimeout(()=>tr.style.backgroundColor = '', 2000);
        }
    }, 200);
}

// Khi load trang hoặc đổi sản phẩm trong select
document.addEventListener('DOMContentLoaded', () => {
    renderInventory();
    
    const inventorySelect = document.getElementById('inventory-product');
    if(inventorySelect) {
        inventorySelect.addEventListener('change', renderInventory);
    }
});

setInterval(() => {
    if(document.getElementById('inventory-result')) {
        renderInventory();
    }
}, 1000);

// ===================================== ĐỒNG BỘ & RESET =============================================
// Đồng bộ dữ liệu cho phần khách hàng
document.getElementById('sync-to-customer').addEventListener('click',()=>{
  alert('Dữ liệu đã sẵn sàng để phần khách hàng đọc từ localStorage (keys: products, users, orders)')
})

// Reset toàn bộ dữ liệu về mẫu ban đầu
document.getElementById('reset-sample').addEventListener('click',()=>{
  if(!confirm('Reset toàn bộ dữ liệu mẫu?'))return;
  localStorage.removeItem('products');
  localStorage.removeItem('users');
  localStorage.removeItem('orders');
  localStorage.removeItem('imports');
  localStorage.removeItem('categories');
  ensureSample();
  renderAll();
  alert('Đã reset')
})

// ===== Tiện ích nhỏ =====
// Cập nhật input giá khi chọn sản phẩm
document.getElementById('product-price-select').addEventListener('change',e=>{
  const p=read('products').find(x=>x.id===e.target.value);
  document.getElementById('product-price-input').value=p?p.price:''
})

// Hàm khởi tạo khi load (yêu cầu đăng nhập trước khi gọi ensureSample/renderAll)
function renderAll(){
  renderStats();
  renderUsers();
  renderProducts();
  renderCategories();
  renderImports();
  renderOrders();
}

// Expose ra ngoài để debug
window.adminLS = {read,write}