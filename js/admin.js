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

function read(key){ return JSON.parse(localStorage.getItem(key)||'[]'); }
function write(key,data){ localStorage.setItem(key, JSON.stringify(data)); }

function uid(prefix='id'){ return prefix+Math.random().toString(36).substr(2,6); }

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

// ================================ QUẢN LÝ PHIẾU NHẬP =================================================
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

  const selectedCat = document.getElementById('import-filter-category')?.value || '';

  imports.forEach((imp, index) => {
    const tr = document.createElement("tr");
    const statusText = importStatusMap[imp.status] || imp.status || '';

    const item = (imp.items && imp.items[0]) || {};
    let itemCategory = item.category || '';
    if(!itemCategory && item.id){
      const prod = read('products').find(p => p.id === item.id);
      if(prod){ itemCategory = Array.isArray(prod.category) ? prod.category.join(', ') : (prod.category || ''); }
    }

    if(selectedCat && !itemCategory.includes(selectedCat)) return;

    const canEdit = imp.status !== 'done';
    const unitPrice = Number(item.price || 0);
    const lineTotal = unitPrice * (Number(item.qty) || 0);
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${imp.date}</td>
      <td>${(item.name) ? item.name : ((imp.items||[]).length + ' SP')}</td>
      <td>${itemCategory}</td>
      <td>${unitPrice? formatVND(unitPrice) : ''}</td>
      <td>${lineTotal? formatVND(lineTotal) : ''}</td>
      <td>${imp.totalQty}</td>
      <td>${statusText}</td>
      <td>
        <button class="btn small" onclick="viewImport('${imp.id}')">Xem</button>
        ${canEdit ? `<button class="btn small" onclick="editImport('${imp.id}')">Chỉnh sửa</button>` : ''}
      </td>
      <td><button class="btn small danger" onclick="deleteImport('${imp.id}')">X</button></td>
    `;
    tbody.appendChild(tr);
  });
}

window.editImport = function(id){
  const imports = read('imports') || [];
  const imp = imports.find(i => i.id === id);
  if(!imp) return alert('Không tìm thấy phiếu nhập');

  if(imp.status === 'done') return alert('Phiếu nhập đã hoàn tất, không thể chỉnh sửa');

  editingImportId = id;
  importForm.classList.remove('hidden');
  loadProductsToSelect();
  const item = (imp.items && imp.items[0]) || {};
  importProduct.value = item.id || '';
  importQty.value = item.qty || 1;
  const importPriceInput = document.getElementById('import-price');
  if(importPriceInput) importPriceInput.value = (item.price != null) ? item.price : '';
  importStatus.value = imp.status || 'pending';
};

// Xem chi tiết phiếu nhập
function viewImport(id) {
  const imports = read("imports");
  const imp = imports.find(i => i.id === id);
  if (!imp) return;
  const statusText = importStatusMap[imp.status] || imp.status || '';

  let text = `PHIẾU NHẬP: ${id}\nNgày: ${imp.date}\nTrạng thái: ${statusText}\n\nSẢN PHẨM:\n`;
  imp.items.forEach(item => {
    const price = Number(item.price || 0);
    const line = price ? ` | Giá: ${formatVND(price)} | Thành tiền: ${formatVND(price * (Number(item.qty)||0))}` : '';
    text += `- ${item.name}: SL ${item.qty}${line}\n`;
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

let editingImportId = null;

const importStatusMap = { pending: 'Chờ duyệt', done: 'Hoàn tất' };

// Điền danh sách sản phẩm vào select
function loadProductsToSelect() {
  const products = read("products");
  importProduct.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

if(typeof importProduct !== 'undefined' && importProduct){
  importProduct.addEventListener('change', ()=>{
    const p = read('products').find(x=>x.id === importProduct.value);
    const priceInput = document.getElementById('import-price');
    if(priceInput) priceInput.value = p ? (p.priceCurrent || p.price || 0) : '';
  });
}

// Hiển thị / ẩn form ngay dưới nút
addImportBtn.onclick = () => {
  editingImportId = null;
  importForm.classList.toggle("hidden");
  loadProductsToSelect();
  setTimeout(()=>{
    const p = read('products').find(x=>x.id === importProduct.value);
    const priceInput = document.getElementById('import-price');
    if(priceInput) priceInput.value = p ? (p.priceCurrent || p.price || '') : '';
  }, 10);
};

// Hủy phiếu nhập
btnCancelImport.onclick = () => {
  importForm.classList.add("hidden");
  importQty.value = 1;
  importProduct.value = '';
  importStatus.value = 'pending';
  const importPriceInput = document.getElementById('import-price'); if(importPriceInput) importPriceInput.value = '';
  editingImportId = null;
};

// Lưu phiếu nhập
btnSaveImport.onclick = () => {
  const date = new Date().toISOString().split("T")[0];
  const productId = importProduct.value;
  const qty = Number(importQty.value);
  const status = importStatus.value;
  const unitPrice = Number(document.getElementById('import-price')?.value) || 0;

  if (!productId || qty <= 0) {
    alert("Chọn sản phẩm và nhập số lượng hợp lệ");
    return;
  }

  // Lấy danh sách sản phẩm
  const products = read("products");
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const imports = read("imports");

  if(editingImportId){
    const imp = imports.find(i => i.id === editingImportId);
    if(!imp) return alert('Không tìm thấy phiếu nhập để chỉnh sửa');

    const oldItem = (imp.items && imp.items[0]) || {};
    const oldProdId = oldItem.id;
    const oldQty = Number(oldItem.qty) || 0;

    if(oldProdId !== productId){
      const oldProd = products.find(p => p.id === oldProdId);
      if(oldProd){ oldProd.stock = Math.max(0, (oldProd.stock || 0) - oldQty); }
      prod.stock = (prod.stock || 0) + qty;
    } else {
      const diff = qty - oldQty;
      prod.stock = Math.max(0, (prod.stock || 0) + diff);
    }

    const catStr = Array.isArray(prod.category) ? prod.category.join(', ') : (prod.category || '');
    imp.items = [{ id: prod.id, name: prod.name, qty, category: catStr, price: unitPrice }];
    imp.totalQty = qty;
    imp.status = status;
    imp.date = date;

    write('products', products);
    productsCache = products;
    write('imports', imports);
    renderImports();
    renderProducts(searchInput.value.trim(), categorySelect.value, true);

    editingImportId = null;
    importForm.classList.add('hidden');
    importQty.value = 1;
    importProduct.value = '';
    importStatus.value = 'pending';
    alert('Đã cập nhật phiếu nhập');
    return;
  }

  prod.stock = (prod.stock || 0) + qty;
  write('products', products);
  productsCache = products;
  renderProducts(searchInput.value.trim(), categorySelect.value, true);

  const catStrNew = Array.isArray(prod.category) ? prod.category.join(', ') : (prod.category || '');
  imports.push({
    id: generateImportID(),
    date,
    totalQty: qty,
    status: status,
    items: [{ id: prod.id, name: prod.name, qty, category: catStrNew, price: unitPrice }]
  });
  write('imports', imports);
  renderImports();
  importForm.classList.add('hidden');
  importQty.value = 1;
  alert('Đã tạo phiếu nhập thành công');
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
// Lấy danh sách sản phẩm, chuẩn hóa dữ liệu
function getProducts() {
  // Normalize product entries from different schema versions so pricing module
  // can safely assume fields: id (string), ma, basePrice, price, profitPercent, saleOff, finalPrice, category (string)
  let productsLocal = JSON.parse(localStorage.getItem('products')) || [];
  productsLocal = productsLocal.map(p => {
    const basePrice = Number(p.basePrice ?? p.price ?? p.priceCurrent ?? 0) || 0;
    const profitPercent = Number(p.profitPercent ?? 0) || 0;
    const saleOff = Number(p.saleOff ?? 0) || 0;
    const price = Number(p.price ?? p.priceCurrent ?? Math.round(basePrice * (1 + profitPercent / 100))) || 0;
    const finalPrice = Number(p.finalPrice ?? Math.round(price * (1 - saleOff / 100))) || 0;
    const ma = p.ma ?? p.sku ?? p.id ?? '';
    const category = Array.isArray(p.category) ? p.category.join(', ') : (p.category ?? '');

    return {
      ...p,
      id: p.id,
      ma,
      basePrice,
      price,
      profitPercent,
      saleOff,
      finalPrice,
      category
    };
  });

  // Persist normalized data back so subsequent calls are consistent
  localStorage.setItem('products', JSON.stringify(productsLocal));
  return productsLocal;
}

// Lưu sản phẩm và cập nhật bảng giá cuối
function saveProducts(productsLocal) {
    localStorage.setItem('products', JSON.stringify(productsLocal));
    updatePriceTableWithSale(productsLocal);
}

// Cập nhật bảng prices trong localStorage
function updatePriceTableWithSale(productsLocal) {
    let prices = JSON.parse(localStorage.getItem("prices")) || [];
    productsLocal.forEach(p => {
        const idx = prices.findIndex(pr => pr.ma === p.ma);
        const finalPrice = Math.round(p.price * (1 - (p.saleOff ?? 0)/100));
        p.finalPrice = finalPrice;
        if(idx >= 0){
            prices[idx] = { ...prices[idx], price: p.price, finalPrice, saleOff: p.saleOff ?? 0 };
        } else {
            prices.push({ ma: p.ma, name: p.name, price: p.price, saleOff: p.saleOff ?? 0, finalPrice });
        }
    });
    localStorage.setItem("prices", JSON.stringify(prices));
}

// Populate danh mục & sản phẩm
function populateCategoryFilters() {
    const profitCat = document.getElementById("profit-category");
    const productSelect = document.getElementById("product-price-select");
    if (!profitCat || !productSelect) return;

    const selectedCat = profitCat.value;
    const selectedProduct = productSelect.value;

    const productsLocal = getProducts();
    const categories = [...new Set(productsLocal.map(p => p.category))];

    profitCat.innerHTML = `<option value="">Chọn danh mục</option>`;
    categories.forEach(c => {
        profitCat.innerHTML += `<option value="${c}" ${c === selectedCat ? 'selected' : ''}>${c}</option>`;
    });

    productSelect.innerHTML = `<option value="">Chọn sản phẩm</option>`;
    productsLocal.forEach(p => {
        productSelect.innerHTML += `<option value="${p.id}" ${p.id == selectedProduct ? 'selected' : ''}>${p.name}</option>`;
    });
}

// Áp dụng lợi nhuận theo danh mục
function applyProfitByCategory() {
    const btn = document.getElementById("apply-profit");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const cat = document.getElementById("profit-category").value;
        const percent = parseFloat(document.getElementById("profit-percent").value);
        if (!cat || isNaN(percent)) return alert("Chọn danh mục và nhập % lợi nhuận hợp lệ");

        const productsLocal = getProducts();
        productsLocal.forEach(p => {
            if (p.category === cat) {
                p.profitPercent = percent;
                p.price = Math.round(p.basePrice * (1 + percent / 100));
                p.finalPrice = Math.round(p.price * (1 - (p.saleOff ?? 0)/100));
            }
        });
        saveProducts(productsLocal);
        renderProfitTable();
        populateCategoryFilters();
        if(percent < 5) alert(`⚠️ % lợi nhuận thấp (${percent}%) cho danh mục "${cat}"`);
    });
}

// Áp dụng lợi nhuận theo sản phẩm
function applyProfitByProduct() {
    const btn = document.getElementById("save-product-price");
    if (!btn) return;

    btn.addEventListener("click", () => {
    const id = document.getElementById("product-price-select").value; // keep ID as string
        const percent = parseFloat(document.getElementById("product-price-input").value);
        if (!id || isNaN(percent)) return alert("Chọn sản phẩm và nhập % lợi nhuận hợp lệ");

        const productsLocal = getProducts();
    const product = productsLocal.find(p => String(p.id) === String(id));
        if (product) {
            product.profitPercent = percent;
            product.price = Math.round(product.basePrice * (1 + percent / 100));
            product.finalPrice = Math.round(product.price * (1 - (product.saleOff ?? 0)/100));
            saveProducts(productsLocal);
            updateProductRow(product);
            if(percent < 5) alert(`⚠️ % lợi nhuận thấp (${percent}%) cho sản phẩm "${product.name}"`);
        }
    });
}

// Render toàn bộ bảng lợi nhuận + giảm giá
function renderProfitTable() {
    const container = document.getElementById("priceTable");
    if (!container) return;

    const productsLocal = getProducts();
    if (productsLocal.length === 0) {
        container.innerHTML = "<p>Chưa có sản phẩm!</p>";
        return;
    }

    let html = `
        <table border="1" cellspacing="0" cellpadding="6" width="100%">
            <tr style="background:#2f3e46;color:white;">
                <th>Mã SP</th>
                <th>Tên SP</th>
                <th>Danh mục</th>
                <th>Giá vốn (VNĐ)</th>
                <th>% Lợi nhuận</th>
                <th>Giá bán (VNĐ)</th>
                <th>Giảm giá (%)</th>
                <th>Giá cuối (VNĐ)</th>
                <th>Chỉnh % lợi nhuận</th>
            </tr>
    `;

    productsLocal.forEach(p => {
        const colorAlert = p.profitPercent < 5 ? 'style="background:#ffcccc"' : '';
        html += `
            <tr id="row-${p.id}" ${colorAlert}>
                <td>${p.ma}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.basePrice.toLocaleString("vi-VN")}</td>
                <td class="cell-profit">${p.profitPercent}</td>
                <td class="cell-price">${p.price.toLocaleString("vi-VN")}</td>
                <td><input type="number" min="0" max="100" value="${p.saleOff ?? 0}" data-id="${p.id}" class="inputSale" style="width:50px"></td>
                <td class="cell-finalPrice">${p.finalPrice.toLocaleString("vi-VN")}</td>
                <td>
                    <input type="number" min="0" max="100" value="${p.profitPercent}" data-id="${p.id}" class="inputProfit" style="width:60px">
                    <button class="btnUpdateProfit" data-id="${p.id}">Lưu</button>
                </td>
            </tr>
        `;
    });

    html += "</table>";
    container.innerHTML = html;

    // Gắn event delegation chỉ 1 lần
    attachTableEvents();
}

// Cập nhật dòng sản phẩm thay vì render toàn bộ
function updateProductRow(p) {
    const row = document.getElementById(`row-${p.id}`);
    if(!row) return;

    row.querySelector('.cell-profit').textContent = p.profitPercent;
    row.querySelector('.cell-price').textContent = p.price.toLocaleString("vi-VN");
    row.querySelector('.cell-finalPrice').textContent = p.finalPrice.toLocaleString("vi-VN");
    const inputSale = row.querySelector('.inputSale');
    if(inputSale) inputSale.value = p.saleOff ?? 0;
    const inputProfit = row.querySelector('.inputProfit');
    if(inputProfit) inputProfit.value = p.profitPercent;

    row.style.background = p.profitPercent < 5 ? '#ffcccc' : '';
}

// Gắn sự kiện cho table (Event Delegation)
function attachTableEvents() {
    const container = document.getElementById("priceTable");
    if(!container) return;

    container.onclick = function(e){
        const btn = e.target.closest('.btnUpdateProfit');
        if(btn){
      const id = btn.dataset.id; // IDs are strings in our dataset
      const input = container.querySelector(`.inputProfit[data-id='${id}']`);
            const percent = parseFloat(input.value);
            if (isNaN(percent) || percent < 0) return alert("Nhập % lợi nhuận hợp lệ (>=0)");
            const productsLocal = getProducts();
      const product = productsLocal.find(p => String(p.id) === String(id));
            if(product){
                product.profitPercent = percent;
                product.price = Math.round(product.basePrice * (1 + percent / 100));
                product.finalPrice = Math.round(product.price * (1 - (product.saleOff ?? 0)/100));
                saveProducts(productsLocal);
                updateProductRow(product);
                if(percent < 5) alert(`⚠️ % lợi nhuận thấp (${percent}%) cho sản phẩm "${product.name}"`);
            }
        }
    };

    container.onchange = function(e){
        const input = e.target.closest('.inputSale');
        if(input){
      const id = input.dataset.id;
      let sale = parseFloat(input.value);
            if (isNaN(sale) || sale < 0 || sale > 100){
                alert("Nhập giảm giá hợp lệ 0-100%");
                input.value = 0; sale = 0;
            }
            const productsLocal = getProducts();
      const product = productsLocal.find(p => String(p.id) === String(id));
            if(product){
                product.saleOff = sale;
                product.finalPrice = Math.round(product.price * (1 - sale/100));
                saveProducts(productsLocal);
                updateProductRow(product);
            }
        }
    };
}

// Khởi chạy module
function initProfitManagement() {
    populateCategoryFilters();
    applyProfitByCategory();
    applyProfitByProduct();
    renderProfitTable();
}

document.addEventListener("DOMContentLoaded", initProfitManagement);

// ====================== Tra cứu lợi nhuận theo ngày =============================
function computeProfitBetweenDates(){
  const fromVal = document.getElementById('profit-from').value;
  const toVal = document.getElementById('profit-to').value;
  const resultWrap = document.getElementById('profit-result');
  resultWrap.innerHTML = '';

  if(!fromVal || !toVal){
    resultWrap.innerHTML = '<span style="color:#d32f2f">Vui lòng chọn đủ 2 ngày</span>';
    return;
  }

  const fromDate = new Date(fromVal + 'T00:00:00');
  const toDate = new Date(toVal + 'T23:59:59');
  if(fromDate > toDate){
    resultWrap.innerHTML = '<span style="color:#d32f2f">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc</span>';
    return;
  }

  const orders = read('orders') || [];
  const productsLocal = getProducts();

  let totalRevenue = 0; // doanh thu
  let totalCost = 0; // vốn
  let totalProfit = 0;
  let totalOrders = 0;
  let totalItems = 0;

  orders.forEach(o => {
    // order.date expected in YYYY-MM-DD or ISO format
    const od = new Date(o.date + 'T00:00:00');
    if(od >= fromDate && od <= toDate){
      totalOrders++;
      (o.items || []).forEach(item => {
        const qty = Number(item.qty) || 0;
        const sellPrice = Number(item.price) || 0; // price at time of order
        totalRevenue += sellPrice * qty;
        totalItems += qty;

        // try to find product to get basePrice
        let prod = null;
        if(item.id){ prod = productsLocal.find(p => String(p.id) === String(item.id)); }
        if(!prod && item.name){ prod = productsLocal.find(p => p.name === item.name); }

        const base = prod ? (Number(prod.basePrice) || Number(prod.price) || 0) : 0;
        totalCost += base * qty;
        totalProfit += (sellPrice - base) * qty;
      });
    }
  });

  const format = formatVND;
  resultWrap.innerHTML = `
    <div style="font-size:14px">
    <div><strong>Đơn hàng:</strong> ${totalOrders}</div>
    <div><strong>Tổng số lượng:</strong> ${totalItems}</div>
    <div><strong>Doanh thu:</strong> ${format(totalRevenue)}</div>
    <div><strong>Vốn:</strong> ${format(totalCost)}</div>
    <div><strong>Lợi nhuận:</strong> ${format(Math.round(totalProfit))}</div>
    </div>
  `;
}

document.getElementById('btn-search-profit')?.addEventListener('click', computeProfitBetweenDates);

// ================================= QUẢN LÝ TỒN KHO ====================================================
(function inventoryModule(){
  const ID_CHECK = "inv-check-stock";
  const ID_THRESHOLD = "inv-stock-threshold";
  const ID_RESULT = "inv-stock-result";
  const ID_CAT = "inv-stock-category";
  const ID_PROD = "inv-stock-product";
  const ID_SEARCH_BTN = "inv-btn-search-stock";
  const ID_SEARCH_RESULT = "inv-stock-search-result";
  const ID_FROM = "inv-date-from";
  const ID_TO = "inv-date-to";
  const ID_STATS_BTN = "inv-btn-stock-stats";
  const ID_STATS_RESULT = "inv-stock-stats";

  function formatISO(d){
    if(!d) return "";
    const dt = new Date(d);
    if(isNaN(dt)) return ""+d;
    const y = dt.getFullYear();
    const m = String(dt.getMonth()+1).padStart(2,"0");
    const day = String(dt.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }

  function readLS(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch(e){ return fallback; }
  }

  function populateInventoryFilters(){
    const catSelect = document.getElementById("inv-stock-category");
    const prodSelect = document.getElementById("inv-stock-product");
    if(!catSelect || !prodSelect) return;

    const cats = readLS("categories", []);
    const prods = readLS("products", []);

    const categoryIsId = prods.some(p => typeof p.category === "number");

    catSelect.innerHTML = `<option value="">-- Tất cả danh mục --</option>`;
    cats.forEach(c => {
      const val = categoryIsId ? c.id : c.name;
      const label = c.name ?? c.id;
      catSelect.innerHTML += `<option value="${val}">${label}</option>`;
    });

    prodSelect.innerHTML = `<option value="">-- Chọn sản phẩm --</option>`;
    prods.forEach(p => {
      const id = p.id ?? p.ma ?? p.code ?? "";
      prodSelect.innerHTML += `<option value="${id}">${p.name || id} ${p.ma? '('+p.ma+')':''}</option>`;
    });
  }

  function canhBaoTheoNguong(){
    const res = document.getElementById(ID_RESULT);
    if(!res) return;
    const prods = readLS("products", []);
    const raw = document.getElementById(ID_THRESHOLD)?.value;
    const threshold = isNaN(Number(raw)) ? 20 : Number(raw);

    if(prods.length === 0){
      res.innerHTML = `<div>Chưa có sản phẩm nào!</div>`;
      return;
    }

    let html = `<h4>⚠️ Kiểm tra tồn kho (ngưỡng ${threshold})</h4><ul>`;
    prods.forEach(p=>{
      const stock = Number(p.stock ?? p.quantity ?? 0);
      let color="green", msg=`✅ Hàng đủ (Tồn ${stock})`;
      if(stock < 5){ color="red"; msg=`🚨 Cần nhập gấp! (Tồn ${stock})`; }
      else if(stock < threshold){ color="orange"; msg=`⚠️ Nên nhập thêm (Tồn ${stock})`; }
      html += `<li style="color:${color}"><b>${p.name}</b> — ${msg}</li>`;
    });
    html += "</ul>";
    res.innerHTML = html;
  }

  
function traCuuTonKho(){
  const res = document.getElementById("inv-stock-search-result");
  if(!res) return;
  const prods = readLS("products", []);
  const prodId = document.getElementById("inv-stock-product")?.value;
  const cat = document.getElementById("inv-stock-category")?.value;

  let list = prods;

  if(prodId){
    list = list.filter(p => String(p.id) === String(prodId) || String(p.ma) === String(prodId));
  } else if(cat){
    const categoryIsId = prods.some(p => typeof p.category === "number");
    list = list.filter(p => String(p.category) === String(cat));
  }

  if(!list || list.length === 0){
    res.innerHTML = "<div>Không tìm thấy sản phẩm phù hợp</div>"; 
    return;
  }

  res.innerHTML = list.map(p => {
    const stock = Number(p.stock ?? p.quantity ?? 0);
    return `<div><b>${p.name}</b> ${p.ma? '('+p.ma+')':''} — <b>${stock}</b> tồn</div>`;
  }).join("");
}

  // Helper: build date array inclusive
  function getDatesInRange(fromISO, toISO){
    const a = new Date(fromISO); a.setHours(0,0,0,0);
    const b = new Date(toISO); b.setHours(0,0,0,0);
    const list = [];
    for(let d = new Date(a); d <= b; d.setDate(d.getDate()+1)){
      list.push(new Date(d));
    }
    return list;
  }

  function tinhTonDauKy(products, phieuNhap, phieuXuat, fromDateISO){
    const from = new Date(fromDateISO); from.setHours(0,0,0,0);
    const map = {};
    (products||[]).forEach(p => map[p.id] = Number(p.stock ?? p.quantity ?? 0));

    Object.keys(map).forEach(k => map[k] = 0);

    (phieuNhap||[]).forEach(r => {
      const d = new Date(r.importDate ?? r.date ?? r.dateStr ?? r.createdAt ?? "");
      if(isNaN(d)) return;
      if(d < from){
        (r.items||[]).forEach(it => {
          const id = it.productId ?? it.id ?? it.prodId ?? it.product;
          map[id] = (map[id] || 0) + Number(it.qty || it.quantity || 0);
        });
      }
    });

    (phieuXuat||[]).forEach(r => {
      const d = new Date(r.date ?? r.exportDate ?? r.createdAt ?? r.orderDate ?? "");
      if(isNaN(d)) return;
      if(d < from){
        (r.items||[]).forEach(it => {
          const id = it.productId ?? it.id ?? it.prodId ?? it.product;
          map[id] = (map[id] || 0) - Number(it.qty || it.quantity || 0);
        });
      }
    });

    return map;
  }

function thongKeTheoNgay(products, phieuNhap, phieuXuat, stockPrevMap, fromISO, toISO){
  const dates = getDatesInRange(fromISO, toISO);
  let html = "";

  dates.forEach(d => {
    const dayStr = formatISO(d);
    const hasImport = (phieuNhap || []).some(r => {
      const d2 = formatISO(r.importDate ?? r.date ?? r.createdAt ?? "");
      if (d2 !== dayStr) return false;
      return (r.items || []).some(it => Number(it.qty || it.quantity || 0) > 0);
    });

    const hasExport = (phieuXuat || []).some(r => {
      const d2 = formatISO(r.date ?? r.exportDate ?? r.createdAt ?? r.orderDate ?? "");
      if (d2 !== dayStr) return false;
      return (r.items || []).some(it => Number(it.qty || it.quantity || 0) > 0);
    });

    if (!hasImport && !hasExport) return;

    const rows = [];
    (products || []).forEach(p => {
      const nhapQty = (phieuNhap || []).reduce((s, r) => {
        const d2 = formatISO(r.importDate ?? r.date ?? r.createdAt ?? "");
        if (d2 !== dayStr) return s;
        const it = (r.items || []).find(it => String(it.productId ?? it.id ?? "") === String(p.id));
        return s + (it ? Number(it.qty || it.quantity || 0) : 0);
      }, 0);

      const xuatQty = (phieuXuat || []).reduce((s, r) => {
        const d2 = formatISO(r.date ?? r.exportDate ?? r.createdAt ?? "");
        if (d2 !== dayStr) return s;
        const it = (r.items || []).find(it => String(it.productId ?? it.id ?? "") === String(p.id));
        return s + (it ? Number(it.qty || it.quantity || 0) : 0);
      }, 0);

      if (nhapQty > 0 || xuatQty > 0) {
        rows.push({ product: p, nhapQty, xuatQty });
      }
    });

    if (rows.length === 0) return;

    html += `<h4>Ngày ${dayStr}</h4>`;
    html += `<table border="1" cellpadding="5" cellspacing="0" style="width:100%;margin-bottom:12px">
              <tr><th>Sản phẩm</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối</th></tr>`;

    rows.forEach(r => {
      const prev = Number(stockPrevMap[r.product.id] || 0);
      const stockCuoi = prev + r.nhapQty - r.xuatQty;
      stockPrevMap[r.product.id] = stockCuoi;

      html += `<tr>
        <td>${r.product.name || r.product.ma || r.product.id}</td>
        <td style="text-align:right">${r.nhapQty}</td>
        <td style="text-align:right">${r.xuatQty}</td>
        <td style="text-align:right">${stockCuoi}</td>
      </tr>`;
    });

    html += `</table>`;
  });

  return html;
}
  function thongKeNhapXuatTheoNgay(fromISO, toISO){
    const res = document.getElementById(ID_STATS_RESULT);
    if(!res) return;
    if(!fromISO || !toISO) { alert("Vui lòng chọn đầy đủ ngày"); return; }

    const products = readLS("products", []);
    const phieuNhap = readLS("purchaseReceipts", readLS("phieuNhap", []));
    const phieuXuat = readLS("phieuXuat", readLS("exports", readLS("orders", [])));

    const dateFrom = new Date(fromISO); const dateTo = new Date(toISO);
    if(isNaN(dateFrom) || isNaN(dateTo) || dateFrom > dateTo) { alert("Khoảng ngày không hợp lệ"); return; }

    const diffDays = Math.floor((dateTo - dateFrom) / (1000*60*60*24));
    const groupByMonth = diffDays > 60;

    const stockPrevMap = tinhTonDauKy(products, phieuNhap, phieuXuat, fromISO);

    let html = `<h3>📦 Thống kê nhập–xuất từ ${formatISO(fromISO)} đến ${formatISO(toISO)}</h3>`;
    html += groupByMonth ? thongKeTheoThang(products, phieuNhap, phieuXuat, stockPrevMap, fromISO, toISO)
                        : thongKeTheoNgay(products, phieuNhap, phieuXuat, stockPrevMap, fromISO, toISO);

    res.innerHTML = html;
  }

  function attachListeners(){
    populateInventoryFilters();

    const btnCheck = document.getElementById(ID_CHECK);
    if(btnCheck){
      btnCheck.removeEventListener("click", canhBaoTheoNguong);
      btnCheck.addEventListener("click", canhBaoTheoNguong);
    }

    const btnSearch = document.getElementById(ID_SEARCH_BTN);
    if(btnSearch){
      btnSearch.removeEventListener("click", traCuuTonKho);
      btnSearch.addEventListener("click", traCuuTonKho);
    }

    const btnStats = document.getElementById(ID_STATS_BTN);
    if(btnStats){
      btnStats.replaceWith(btnStats.cloneNode(true));
      const newBtn = document.getElementById(ID_STATS_BTN);
      if(newBtn){
        newBtn.addEventListener("click", ()=>{
          const from = document.getElementById(ID_FROM)?.value;
          const to = document.getElementById(ID_TO)?.value;
          if(!from || !to){ alert("Vui lòng chọn khoảng thời gian"); return; }
          thongKeNhapXuatTheoNgay(from, to);
        });
      }
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    attachListeners();
  }); 
  window.populateInventoryFilters = populateInventoryFilters;
  window.canhBaoTheoNguong = canhBaoTheoNguong;
  window.traCuuTonKho = traCuuTonKho;
  window.thongKeNhapXuatTheoNgay = thongKeNhapXuatTheoNgay;
})();
  
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