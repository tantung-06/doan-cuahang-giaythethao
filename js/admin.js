// === Thông tin đăng nhập Admin ===
const ADMIN_CRED = { user: 'admin', pass: '123' };

// === Xử lý đăng nhập (yêu cầu mỗi lần mở) ===
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

// ===== QUẢN LÝ NGƯỜI DÙNG =====
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
// =======================================================================================================

// ===== QUẢN LÝ DANH MỤC =====
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
// ==============================================================================================

// ===== QUẢN LÝ SẢN PHẨM =====
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
        {id:"sp-gcb-1",sku:'SP001',name:'Giày Chạy Bộ Nam Nike Pegasus Plus - Đen',category:['Giày Chạy Bộ', 'Giày Nam'],priceCurrent:3485400,priceOld:5890000,company:'NIKE',img:'./assest/img/Nike_Pegasus_Plus.jpg',stock:12,hidden:false},
        {id:"sp-gcb-2",sku:'SP002',name:'Giày Chạy Bộ Nam Nike React Infinity Run 4 - Đen',category:['Giày Chạy Bộ'],priceCurrent:3000000,priceOld:4000000,company:'NIKE',img:'./assest/img/Nike_Reactx_Infinity_Run4.jpg',stock:8,hidden:false},
        {id:"sp-gcb-3",sku:'SP003',name:'Giày Chạy Bộ Nữ Under Armour Halo Runner',category:['Giày Chạy Bộ'],priceCurrent:2000000,priceOld:3000000,company:'UNDER ARMOUR',img:'./assest/img/Under_Armour_Halo_Runner.jpg',stock:10,hidden:false},
        {id:"sp-gcb-4",sku:'SP004',name:'Giày Chạy Bộ Nam Puma Deviate Nitro 3 - Xanh Lá',category:['Giày Chạy Bộ'],priceCurrent:5000000,priceOld:6000000,company:'PUMA',img:'./assest/img/Puma_Deviate_Nitro3.jpg',stock:7,hidden:false},
        {id:"sp-gcb-5",sku:'SP005',name:'Giày Chạy Bộ Nam HOKA Bondi 9 Wide - Nâu',category:['Giày Chạy Bộ'],priceCurrent:4000000,priceOld:5000000,company:'HOKA',img:'./assest/img/Hoka_Bondi_9_Wide.jpg',stock:5,hidden:false},
        {id:"sp-gcb-6",sku:'SP006',name:'Giày Chạy Bộ Nữ Asics Gel-Kayano 32 Lite-Show - Xanh Lá', category:['Giày Chạy Bộ','Giày Nữ'],priceCurrent:1000000,priceOld:2000000,company:'ASICS', img:'./assest/img/Asics_Gel-Kayano_32_Lite-Show.jpg', stock:6,hidden:false},
        {id:"sp-gcb-7",sku:'SP007',name:'Giày Chạy Bộ Nữ On Running Cloudsurfer Max - Xanh Dương', category:['Giày Chạy Bộ','Giày Nữ'],  priceCurrent:2000000,priceOld:3000000, company:'ON RUNNING', img:'./assest/img/On_Running_Cloudsurfer_Max.jpg', stock:8,hidden:false},
        {id:"sp-gcb-8",sku:'SP008',name:'Giày Chạy Bộ Nữ Nike Journey Run - Trắng', category:['Giày Chạy Bộ','Giày Nữ'],  priceCurrent:400000,priceOld:1000000, company:'NIKE', img:'./assest/img/Nike_Journey_Run.jpg', stock:9,hidden:false},
        {id:"sp-gcb-9",sku:'SP009',name:'Giày Chạy Bộ Nữ Nike Structure 26 - Xanh Lá', category:['Giày Chạy Bộ','Giày Nữ'],  priceCurrent:4000000,priceOld:5000000,company:'NIKE',  img:'./assest/img/Nike_Structure_26.jpg', stock:4,hidden:false},
        {id:"sp-gcb-10",sku:'SP010',name:'Giày Chạy Bộ Nam Nike Zoom Fly 6 - Cam', category:['Giày Chạy Bộ','Giày Nam'], priceCurrent:3000000, priceOld:4000000, company:'NIKE', img:'./assest/img/Nike_Zoom_Fly_6.jpg', stock:7,hidden:false},
        {id:"sp-gbd-1",sku:'SP011',name:'Giày Đá Bóng Nam Nike Legend 10 Academy - Xanh Dương', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:3000000, priceOld:4000000,  company:'NIKE',img:'./assest/img/Nike_Legend_10_Academy.jpg', stock:10,hidden:false},
        {id:"sp-gbd-2",sku:'SP012',name:'Giày Đá Bóng Nam Nike Phantom Luna li Academy - Xanh Dương', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:3000000, priceOld:4000000, company:'NIKE',img:'./assest/img/Nike_Phantom_Lunali_Academy.jpg', stock:9,hidden:false},
        {id:"sp-gbd-3",sku:'SP013',name:'Giày Đá Bóng Nam Adidas Samba Messi - Trắng', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:4000000,   priceOld:5000000,company:'ADIDAS',img:'./assest/img/Adidas_Samba_Messi.jpg', stock:8,hidden:false},
        {id:"sp-gbd-4",sku:'SP014',name:'Giày Đá Bóng Nam Adidas F50 Elite - Tím', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:4000000,priceOld:5000000,  company:'ADIDAS',img:'./assest/img/Adidas_F50_Elite.jpg', stock:6,hidden:false},
        {id:"sp-gbd-5",sku:'SP015',name:'Giày Đá Bóng Nam Puma King Match Tt - Trắng', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:4000000, priceOld:5000000, company:'PUMA', img:'./assest/img/Puma_King_Match_Tt.jpg', stock:7,hidden:false},
        {id:"sp-gbd-6",sku:'SP016',name:'Giày Đá Bóng Nam Adidas Predator Club - Đen', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:1000000,priceOld:2000000, company:'ADIDAS', img:'./assest/img/Adidas_Predator_Club.jpg', stock:6,hidden:false},
        {id:"sp-gbd-7",sku:'SP017',name:'Giày Đá Bóng Nam Adidas Samba Inter Milan - Trắng', category:['Giày Đá Bóng','Giày Nam'], priceCurrent:1000000, priceOld:2000000, company:'ADIDAS', img:'./assest/img/Adidas_Samba_Inter_Milan.jpg', stock:5,hidden:false},
        {id:"sp-gbd-8",sku:'SP018',name:'Giày Đá Bóng Nam Nike Mercurial Vapor 16 Academy Kylian Mbappé - Vàng', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:1000000,priceOld:'2000000', company:'NIKE', img:'./assest/img/Nike_Mercurial_Vapol_16_Academy.jpg', stock:8,hidden:false},
        {id:"sp-gbd-9",sku:'SP019',name:'Giày Đá Bóng Nam Nike Zoom Vapor 16 Academy Tf - Đỏ', category:['Giày Đá Bóng','Giày Nam'],priceCurrent:1000000, priceOld:2000000, company:'NIKE',  img:'./assest/img/Nike_Zoom_Vapor_16_Academy_Tf.jpg', stock:9,hidden:false},
        {id:"sp-gbd-10",sku:'SP020',name:'Giày Đá Bóng Nam Puma Ultra 6 Play Tt - Cam', category:['Giày Đá Bóng','Giày Nam'],  priceCurrent:4000000, priceOld:5000000,company:'PUMA', img:'./assest/img/Puma_Ultra_6_Play_Tt.jpg', stock:7,hidden:false},
        {id:"sp-gsnk-1",sku:'SP021',name:'Giày Sneaker Nữ On Running Cloudtilt - Xám', category:['Giày Sneaker','Giày Nữ'], priceCurrent:4000000,priceOld:5000000, company:'ON RUNNING',  img:'./assest/img/On_Running_Cloudtilt.jpg', stock:8,hidden:false},
        {id:"sp-gsnk-2",sku:'SP022',name:'Giày Sneaker Nữ Adidas Tekwen - Đen', category:['Giày Sneaker','Giày Nữ'],priceCurrent:500000, priceOld:1000000,  company:'ADIDAS', img:'./assest/img/Adidas_Tekwen.jpg', stock:6,hidden:false},
        {id:"sp-gsnk-3",sku:'SP023',name:'Giày Sneaker Nữ Under Armour Shift', category:['Giày Sneaker','Giày Nữ'], priceCurrent:500000, priceOld:1000000,  company:'UNDER ARMOUR',img:'./assest/img/Under_Armour_Shift.jpg', stock:5,hidden:false},
        {id:"sp-gsnk-4",sku:'SP024',name:'Giày Sneaker Nữ Asics Gel-1130 - Be', category:['Giày Sneaker','Giày Nữ'], priceCurrent:500000, priceOld:1000000, company:'ASICS', img:'./assest/img/Asics_Gel-1130.jpg', stock:7,hidden:false},
        {id:"sp-gsnk-5",sku:'SP025',name:'Giày Sneaker Nữ Nike Air Force 1 07 - Trắng', category:['Giày Sneaker','Giày Nữ'],  priceCurrent:500000, priceOld:1000000,company:'NIKE', img:'./assest/img/Nike_Air_Force.jpg', stock:8,hidden:false},
        {id:"sp-gsnk-6",sku:'SP026',name:'Giày Sneaker Nam Asics Jog 100S - Đen', category:['Giày Sneaker','Giày Nam'], priceCurrent:6000000, priceOld:7000000, company:'ASICS', img:'./assest/img/Asics_Jog_100S.jpg', stock:6,hidden:false},
        {id:"sp-gsnk-7",sku:'SP027',name:'Giày Sneaker Nam Asics Japan S - Trắng', category:['Giày Sneaker','Giày Nam'],priceCurrent:4000000,  priceOld:5000000, company:'ASICS', img:'./assest/img/Asics_Japan_S.jpg', stock:5,hidden:false},
        {id:"sp-gsnk-8",sku:'SP028',name:'Giày Sneaker Nam Nike V2K Run - Đen', category:['Giày Sneaker','Giày Nam'], priceCurrent:3400000, priceOld:4200000, company:'NIKE', img:'./assest/img/Nike_V2K_Run.jpg', stock:7,hidden:false},
        {id:"sp-gsnk-9",sku:'SP029',name:'Giày Sneaker Nam Nike Big Low - Trắng', category:['Giày Sneaker','Giày Nam'],priceCurrent:3400000, priceOld:4200000,  company:'NIKE', img:'./assest/img/Nike_Big_Low.jpg', stock:8,hidden:false},
        {id:"sp-gsnk-10",sku:'SP030',name:'Giày Sneaker Nam Adidas Grand Court 2.0 - Be', category:['Giày Sneaker','Giày Nam'], priceCurrent:3400000, priceOld:4200000,  company:'ADIDAS',img:'./assest/img/Adidas_Grand_Court_2.jpg', stock:6,hidden:false}
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

    // Render option filter
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
                ${p.priceOld?`<div style="text-decoration:line-through;color:#888;font-size:0.9em;">${formatVND(p.priceOld)}</div>`:''}
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
    const priceOld = prompt('Giá cũ:'); 
    const company = prompt('Thương hiệu:'); 
    const img = prompt('Link ảnh:'); 
    const category = prompt('Danh mục (ngăn cách dấu ,):');

    const newProduct = {
        id: uid('p'),
        sku,
        name,
        priceCurrent: priceCurrent||'0',
        priceOld: priceOld||'',
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
    const priceOld = prompt('Giá cũ:', p.priceOld); if(priceOld!=null) p.priceOld = priceOld;
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
// =======================================================================================================
// ===== QUẢN LÝ PHIẾU NHẬP HÀNG =====
// Hiển thị danh sách phiếu nhập
function renderImports(){
    const tbody = document.getElementById('imports-table');
    tbody.innerHTML = '';

    const imports = read('imports') || [];

    imports.forEach((imp, i) => {
        const totalQty = imp.items.reduce((s, it) => s + it.qty, 0);
        const totalCost = imp.items.reduce((s, it) => s + it.qty * it.cost, 0);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${imp.date}</td>
            <td>${imp.items.length} sp</td>
            <td>${totalQty}</td>
            <td>${formatVND(totalCost)}</td>
            <td>${imp.status}</td>
            <td>
                <button class="btn" onclick="viewImport('${imp.id}')">Xem</button>
                ${imp.status === 'pending' ? `<button class="btn" onclick="completeImport('${imp.id}')">Hoàn thành</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Xem chi tiết phiếu nhập
window.viewImport = function(id){
    const imports = read('imports') || [];
    const imp = imports.find(x => x.id === id);
    if(!imp) return alert('Không tìm thấy phiếu nhập!');

    let content = `Phiếu nhập: ${imp.id}\nNgày: ${imp.date}\nTrạng thái: ${imp.status}\n\nSản phẩm:\n`;
    imp.items.forEach((item, i) => {
        const product = read('products').find(p => p.id === item.productId);
        content += `${i+1}. ${product?.name || item.productId} | Số lượng: ${item.qty} | Giá nhập: ${formatVND(item.cost)} | Thành tiền: ${formatVND(item.qty * item.cost)}\n`;
    });
    const totalCost = imp.items.reduce((s, it) => s + it.qty * it.cost, 0);
    content += `\nTổng tiền nhập: ${formatVND(totalCost)}`;

    alert(content);
}

// --- Hoàn thành phiếu nhập (cộng số lượng vào kho) ---
window.completeImport = function(id){
    const imports = read('imports') || [];
    const imp = imports.find(x => x.id === id);
    if(!imp || imp.status === 'completed') return;

    const products = read('products') || [];

    // Cộng số lượng vào stock
    imp.items.forEach(it => {
        const p = products.find(pr => pr.id === it.productId);
        if(p) p.stock = (p.stock || 0) + it.qty;
    });

    // Lưu lại sản phẩm
    write('products', products);

    // Đồng bộ lại cache để render đúng
    productsCache = products.map(p => ({...p, hidden: p.hidden || false}));

    // Render lại danh sách sản phẩm
    renderProducts(searchInput.value.trim(), categorySelect.value, true);
    renderStats();

    // Đánh dấu phiếu hoàn thành
    imp.status = 'completed';
    write('imports', imports);

    // Render lại tất cả
    renderImports();
    renderProducts(searchInput.value.trim(), categorySelect.value, true);
    renderStats();
}

// Tạo phiếu nhập mới (có thể nhập nhiều sản phẩm)
document.getElementById('add-import').addEventListener('click', () => {
    const products = read('products') || [];
    if(!products.length){
        alert('Chưa có sản phẩm nào trong kho');
        return;
    }

    let items = [];
    while(true){
        const pid = prompt('Nhập ID sản phẩm (để trống sẽ dùng sản phẩm đầu tiên, nhập "x" để kết thúc)') || products[0].id;
        if(pid.toLowerCase() === 'x') break;

        const qty = Number(prompt('Nhập số lượng', 10));
        const cost = Number(prompt('Nhập giá nhập (VND) cho 1 đơn vị', 100000));

        if(!pid || !qty || !cost){
            alert('Thông tin sản phẩm không hợp lệ, thử lại');
            continue;
        }

        items.push({ productId: pid, qty, cost });
        const more = confirm('Thêm sản phẩm khác vào phiếu nhập?');
        if(!more) break;
    }

    if(!items.length) return alert('Không có sản phẩm nào được thêm vào phiếu nhập!');

    const imports = read('imports') || [];
    imports.push({
        id: uid('imp'),
        date: new Date().toLocaleDateString(),
        items,
        status: 'pending'
    });
    write('imports', imports);
    renderImports();
});
// =============================================================================================================

// ===== QUẢN LÝ ĐƠN HÀNG =====
// Hiển thị danh sách đơn hàng trong bảng
function renderOrders(filter='') {
  const tbody = document.getElementById('orders-table');
  tbody.innerHTML = '';

  const orders = read('orders') || [];

  // Lọc đơn hàng theo trạng thái nếu có
  orders.filter(o => !filter || o.status === filter).forEach((o, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${o.date}</td>
      <td>${o.customerName}</td>
      <td>${o.status}</td>
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
  if(!order) return alert('Không tìm thấy đơn hàng!');

  const address = order.address || {};
  let content = `Đơn hàng: ${order.id}
Khách hàng: ${order.customerName}
Email: ${order.email}
Số điện thoại: ${address.phone || 'Chưa cập nhật'}
Ngày: ${order.date}
Địa chỉ: ${address.address || 'Chưa cập nhật'}
Ghi chú: ${address.note || 'Không có'}
Trạng thái: ${order.status}

Sản phẩm:\n`;

  order.items.forEach((item, i) => {
    content += `${i+1}. ${item.name} | Size: ${item.size} | Số lượng: ${item.qty} | Giá: ${formatVND(item.price)} | Thành tiền: ${formatVND(item.qty * item.price)}\n`;
  });

  content += `\nTổng tiền: ${formatVND(order.total)}`;

  alert(content);
}

// Cập nhật trạng thái đơn hàng
window.updateOrderStatus = function(id) {
  const statuses = ['new', 'processing', 'shipped', 'cancelled'];
  const orders = read('orders') || [];
  const order = orders.find(x => x.id === id);
  if(!order) return alert('Không tìm thấy đơn hàng!');

  const s = prompt('Trạng thái mới (new, processing, shipped, cancelled):', order.status);
  if(!s || !statuses.includes(s)) return alert('Trạng thái không hợp lệ!');

  order.status = s;
  write('orders', orders);
  renderOrders();
}

// Lọc đơn hàng theo trạng thái
document.getElementById('order-filter').addEventListener('change', e => renderOrders(e.target.value));

// Hiển thị lần đầu
renderOrders();
// ========================================================================================

// ===== ĐỊNH GIÁ =====
// Áp dụng tỉ lệ lợi nhuận cho danh mục
document.getElementById('apply-profit').addEventListener('click',()=>{
  const catId=document.getElementById('profit-category').value; 
  const pct=Number(document.getElementById('profit-percent').value)
  
  if(!catId||!pct){
    alert('Chọn danh mục và nhập %');
    return
  }
  
  const cats=read('categories');
  const c=cats.find(x=>x.id===catId);
  c.profitPercent=pct;
  write('categories',cats)
  
  // Áp dụng cho tất cả sản phẩm trong danh mục: giá bán = giá vốn*(1+%/100)
  const prods=read('products');
  prods.filter(p=>p.category===catId).forEach(p=>p.price=Math.round(p.cost*(1+pct/100)))
  write('products',prods);
  renderProducts();
  alert('Đã áp dụng tỉ lệ lợi nhuận')
})

// Lưu giá cho sản phẩm cụ thể
document.getElementById('save-product-price').addEventListener('click',()=>{
  const pid=document.getElementById('product-price-select').value; 
  const price=Number(document.getElementById('product-price-input').value); 
  
  if(!pid||!price){
    alert('Chọn sản phẩm và nhập giá');
    return
  }
  
  const prods=read('products');
  const p=prods.find(x=>x.id===pid);
  p.price=price;
  write('products',prods);
  renderProducts();
  alert('Đã lưu giá')
})
// ==============================================================================================
// ===== QUẢN LÝ TỒN KHO =====
document.getElementById('check-stock').addEventListener('click', () => {
    const th = Number(document.getElementById('stock-threshold').value) || 5; // Ngưỡng cảnh báo
    const products = read('products');
    const low = products.filter(p => (p.stock || 0) <= th); // Dùng stock

    const wrap = document.getElementById('inventory-result');
    wrap.innerHTML = '';

    if (!low.length) {
        wrap.innerHTML = '<div class="small">Không có sản phẩm sắp hết</div>';
    } else {
        const ul = document.createElement('ul');
        low.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${p.name} - Tồn: ${p.stock || 0} 
                <button class="btn" onclick="goToProduct('${p.id}')">Mở</button>
            `;
            ul.appendChild(li);
        });
        wrap.appendChild(ul);
    }
});

// Chuyển đến sản phẩm trong bảng và highlight
window.goToProduct = function(id){
    // Chuyển sang tab sản phẩm
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
// =================================================================================================

// ===== ĐỒNG BỘ & RESET =====
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