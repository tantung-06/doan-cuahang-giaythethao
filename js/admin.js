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
// Tạo ID ngẫu nhiên
function uid(prefix='id'){return prefix+Math.random().toString(36).slice(2,9)}

// Đọc dữ liệu từ localStorage
function read(key){
  try{
    return JSON.parse(localStorage.getItem(key))||[]
  }catch(e){
    return[]
  }
}

// Ghi dữ liệu vào localStorage
function write(key,val){
  localStorage.setItem(key,JSON.stringify(val))
}

// Đảm bảo có dữ liệu mẫu khi khởi động
function ensureSample(){
  if(!read('products').length){
    // Tạo danh mục mẫu
    const sampleCats=[
      {id:'cat-run',name:'Giày Chạy Bộ',profitPercent:30},
      {id:'cat-sneak',name:'Sneaker',profitPercent:25}
    ]
    write('categories',sampleCats)
    
    // Tạo sản phẩm mẫu
    const sampleProds=[
      {id:uid('p'),sku:'SP001',name:'Nike Pegasus',category:'cat-run',price:3485400,cost:2000000,qty:12,image:'./assest/img/Nike_Pegasus_Plus.jpg',hidden:false}
    ]
    write('products',sampleProds)
    
    // Tạo người dùng mẫu
    const sampleUsers=[
      {id:uid('u'),name:'Tan Tung',email:'tantung@gmail.com',password:'admin123',locked:false}
    ]
    write('users',sampleUsers)
    
    // Khởi tạo đơn hàng và phiếu nhập rỗng
    write('orders',[])
    write('imports',[])
  }
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
    list.appendChild(li)
  })
  
  // Cập nhật dropdown chọn danh mục
  const filter=document.getElementById('filter-category');
  filter.innerHTML='<option value="">Tất cả danh mục</option>'
  const profit=document.getElementById('profit-category');
  profit.innerHTML='<option value="">Chọn danh mục</option>'
  
  read('categories').forEach(c=>{
    filter.innerHTML+=`<option value="${c.id}">${c.name}</option>`;
    profit.innerHTML+=`<option value="${c.id}">${c.name}</option>`
  })
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

// ===== QUẢN LÝ SẢN PHẨM =====
// Hiển thị danh sách sản phẩm
function renderProducts(filter='',catFilter=''){
  const tbody=document.getElementById('products-table');
  tbody.innerHTML=''
  const prods=read('products')
  
  // Lọc sản phẩm theo tên/SKU và danh mục
  prods.filter(p=>
    (!filter||p.name.toLowerCase().includes(filter)||p.sku.toLowerCase().includes(filter))&&
    (!catFilter||p.category===catFilter)
  ).forEach((p,i)=>{
    const cat=read('categories').find(c=>c.id===p.category)
    const tr=document.createElement('tr')
    tr.innerHTML=`
      <td>${i+1}</td>
      <td><img src="${p.image}" style="width:60px;height:40px;object-fit:cover;border-radius:6px"></td>
      <td>${p.name}</td>
      <td>${p.sku}</td>
      <td>${cat?cat.name:''}</td>
      <td>${formatVND(p.price)}</td>
      <td>${p.qty}</td>
      <td>
        <button class="btn" onclick="editProduct('${p.id}')">Sửa</button> 
        <button class="btn" onclick="toggleHideProduct('${p.id}')">${p.hidden?'Hiện':'Ẩn'}</button> 
        <button class="btn" onclick="deleteProduct('${p.id}')">Xóa</button>
      </td>`
    tbody.appendChild(tr)
  })

  // Cập nhật dropdown chọn sản phẩm
  const ps=document.getElementById('product-price-select');
  ps.innerHTML='<option value="">Chọn sản phẩm</option>'
  read('products').forEach(p=>ps.innerHTML+=`<option value="${p.id}">${p.name} (${p.sku})</option>`)
}

// Định dạng số thành tiền Việt
function formatVND(n){
  return new Intl.NumberFormat('vi-VN').format(n)+'₫'
}

// Sửa thông tin sản phẩm
window.editProduct=function(id){
  const prods=read('products');
  const p=prods.find(x=>x.id===id);
  const name=prompt('Tên sản phẩm',p.name); 
  if(name==null) return; 
  p.name=name;
  const sku=prompt('Mã (SKU)',p.sku); 
  if(sku!=null) p.sku=sku;
  const price=prompt('Giá bán (VND)',p.price); 
  if(price!=null) p.price=Number(price);
  const qty=prompt('Số lượng',p.qty); 
  if(qty!=null) p.qty=Number(qty);
  write('products',prods); 
  renderProducts(document.getElementById('product-search').value.toLowerCase(),document.getElementById('filter-category').value); 
  renderStats()
}

// Ẩn/Hiện sản phẩm
window.toggleHideProduct=function(id){
  const prods=read('products');
  const p=prods.find(x=>x.id===id);
  p.hidden=!p.hidden;
  write('products',prods);
  renderProducts();
}

// Xóa sản phẩm
window.deleteProduct=function(id){
  if(!confirm('Xóa sản phẩm?'))return;
  let prods=read('products');
  prods=prods.filter(x=>x.id!==id);
  write('products',prods);
  renderProducts();
  renderStats()
}

// Thêm sản phẩm mới
document.getElementById('add-product').addEventListener('click',()=>{
  // Mở chuỗi prompt để nhập thông tin sản phẩm
  const name=prompt('Tên sản phẩm'); 
  if(!name) return; 
  const sku=prompt('Mã (SKU)', 'SP'+Math.floor(Math.random()*900+100)); 
  const cats=read('categories'); 
  const cat=cats.length?cats[0].id:''; 
  const price=Number(prompt('Giá bán (VND)',100000)); 
  const cost=Number(prompt('Giá vốn (VND)',Math.floor(price*0.6))); 
  const qty=Number(prompt('Số lượng',1)); 
  const img=prompt('Đường dẫn ảnh', './assest/img/Nike_Pegasus_Plus.jpg');
  
  const prods=read('products'); 
  prods.push({id:uid('p'),sku,name,category:cat,price,cost,qty,image:img,hidden:false}); 
  write('products',prods); 
  renderProducts(); 
  renderStats()
})

// Tìm kiếm sản phẩm
document.getElementById('product-search').addEventListener('input',e=>renderProducts(e.target.value.toLowerCase(),document.getElementById('filter-category').value))

// Lọc theo danh mục
document.getElementById('filter-category').addEventListener('change',e=>renderProducts(document.getElementById('product-search').value.toLowerCase(),e.target.value))

// Import dữ liệu mẫu
document.getElementById('import-sample').addEventListener('click',()=>{
  ensureSample();
  alert('Đã import mẫu (nếu chưa có)');
  renderAll()
})

// ===== QUẢN LÝ PHIẾU NHẬP HÀNG =====
// Hiển thị danh sách phiếu nhập
function renderImports(){
  const tbody=document.getElementById('imports-table');
  tbody.innerHTML=''
  
  read('imports').forEach((imp,i)=>{
    const totalQty=imp.items.reduce((s,it)=>s+it.qty,0); // Tổng số lượng
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${i+1}</td>
      <td>${imp.date}</td>
      <td>${imp.items.length} sp</td>
      <td>${totalQty}</td>
      <td>${imp.status}</td>
      <td><button class="btn" onclick="completeImport('${imp.id}')">Hoàn thành</button></td>`;
    tbody.appendChild(tr)
  })
}

// Hoàn thành phiếu nhập (cộng số lượng vào kho)
window.completeImport=function(id){
  const imps=read('imports');
  const imp=imps.find(x=>x.id===id);
  imp.status='completed'; 
  
  // Cộng số lượng vào sản phẩm
  imp.items.forEach(it=>{
    const prods=read('products');
    const p=prods.find(x=>x.id===it.productId); 
    if(p) p.qty += it.qty; 
    write('products',prods)
  })
  
  write('imports',imps); 
  renderImports(); 
  renderProducts(); 
  renderStats();
}

// Tạo phiếu nhập mới
document.getElementById('add-import').addEventListener('click',()=>{
  const prods=read('products'); 
  if(!prods.length){
    alert('Chưa có sản phẩm');
    return
  }
  
  const pid=prompt('Nhập id sản phẩm (sao chép id từ bảng hoặc leave blank để dùng đầu tiên)') || prods[0].id; 
  const qty=Number(prompt('Số lượng nhập',10))
  const cost=Number(prompt('Giá nhập (VND) cho đơn vị',100000)); 
  const imps=read('imports'); 
  imps.push({id:uid('imp'),date:new Date().toLocaleDateString(),items:[{productId:pid,qty:qty,cost}],status:'pending'}); 
  write('imports',imps); 
  renderImports()
})

// ===== QUẢN LÝ ĐỚN HÀNG =====
// Hiển thị danh sách đơn hàng
function renderOrders(filter=''){
  const tbody=document.getElementById('orders-table');
  tbody.innerHTML=''
  
  // Lọc đơn hàng theo trạng thái
  read('orders').filter(o=>!filter||o.status===filter).forEach((o,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${i+1}</td>
      <td>${o.date}</td>
      <td>${o.customerName}</td>
      <td>${o.status}</td>
      <td>${formatVND(o.total)}</td>
      <td>
        <button class="btn" onclick="viewOrder('${o.id}')">Xem</button> 
        <button class="btn" onclick="updateOrderStatus('${o.id}')">Cập nhật</button>
      </td>`;
    tbody.appendChild(tr)
  })
}

// Xem chi tiết đơn hàng
window.viewOrder=function(id){
  const o=read('orders').find(x=>x.id===id);
  alert(JSON.stringify(o,null,2))
}

// Cập nhật trạng thái đơn hàng
window.updateOrderStatus=function(id){
  const os=['new','processing','shipped','cancelled'];
  const o=read('orders').find(x=>x.id===id);
  const s=prompt('Trạng thái mới: new, processing, shipped, cancelled',o.status); 
  if(!s) return; 
  o.status=s; 
  write('orders',read('orders')); 
  renderOrders();
}

// Lọc đơn hàng theo trạng thái
document.getElementById('order-filter').addEventListener('change',e=>renderOrders(e.target.value))

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

// ===== QUẢN LÝ TỒN KHO =====
// Kiểm tra sản phẩm sắp hết hàng
document.getElementById('check-stock').addEventListener('click',()=>{
  const th=Number(document.getElementById('stock-threshold').value)||5; // Ngưỡng cảnh báo
  const low=read('products').filter(p=>p.qty<=th) // Lọc sản phẩm tồn kho thấp
  const wrap=document.getElementById('inventory-result'); 
  wrap.innerHTML=''
  
  if(!low.length) {
    wrap.innerHTML='<div class="small">Không có sản phẩm sắp hết</div>'
  } else { 
    const ul=document.createElement('ul'); 
    low.forEach(p=>{
      const li=document.createElement('li');
      li.innerHTML=`${p.name} - Tồn: ${p.qty} 
        <button class="btn" onclick="goToProduct('${p.id}')">Mở</button>`; 
      ul.appendChild(li)
    }); 
    wrap.appendChild(ul)
  }
})

// Chuyển đến sản phẩm trong bảng
window.goToProduct=function(id){
  alert('Chức năng demo: tìm sản phẩm trong bảng');
  document.querySelector('[data-section="products"]').click(); 
  setTimeout(()=>{
    document.querySelector('#products-table tr td button')?.focus()
  },200)
}

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