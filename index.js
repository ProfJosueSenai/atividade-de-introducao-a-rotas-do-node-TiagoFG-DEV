const http = require('http');
const fs = require('fs');
const path = require('path');

const porta = 3000;

/* =========================
   DADOS (catálogo)
   ========================= */
const CATEGORIES = {
  frutas: [
    { id: 'maca', nome: 'Maçã', preco: 2.5, unidade: 'un', img: '/img/maca.png', desc: 'Maçãs fresquinhas e crocantes.' },
    { id: 'banana', nome: 'Banana', preco: 3.0, unidade: 'dúzia', img: '/img/banana.png', desc: 'Banana docinha e madura.' },
    { id: 'laranja', nome: 'Laranja', preco: 2.0, unidade: 'un', img: '/img/laranja.png', desc: 'Laranja suculenta para sucos.' },
    { id: 'abacaxi', nome: 'Abacaxi', preco: 6.8, unidade: 'un', img: '/img/abacaxi.png', desc: 'Abacaxi docinho, perfeito para sobremesas.' },
  ],
  verduras: [
    { id: 'alface', nome: 'Alface', preco: 2.5, unidade: 'un', img: '/img/alface.png', desc: 'Alface verde, crocante e fresca.' },
    { id: 'rucula', nome: 'Rúcula', preco: 3.2, unidade: 'maço', img: '/img/rucula.png', desc: 'Rúcula com sabor levemente picante.' },
    { id: 'brocolis', nome: 'Brócolis', preco: 4.8, unidade: 'un', img: '/img/brocolis.png', desc: 'Brócolis de primeira, ótimo no vapor.' },
    { id: 'pepino', nome: 'Pepino', preco: 3.0, unidade: 'un', img: '/img/pepino.png', desc: 'Pepino crocante para saladas.' },
    { id: 'alho', nome: 'Alho', preco: 1.5, unidade: '100g', img: '/img/alho.png', desc: 'Alho aromático, dá um sabor especial.' },
  ],
  carnes: [
    { id: 'frango', nome: 'Frango', preco: 12.5, unidade: 'kg', img: '/img/frango.png', desc: 'Frango fresco e suculento.' },
    { id: 'carne', nome: 'Carne bovina', preco: 34.9, unidade: 'kg', img: '/img/carne.png', desc: 'Carne bovina macia para grelhar.' },
    { id: 'peixe', nome: 'Peixe', preco: 22.0, unidade: 'kg', img: '/img/peixe.png', desc: 'Peixe fresco, sabor leve.' },
    { id: 'bacon', nome: 'Bacon', preco: 18.9, unidade: 'kg', img: '/img/bacon.png', desc: 'Bacon defumado crocante.' },
    { id: 'costela', nome: 'Costela suína', preco: 27.5, unidade: 'kg', img: '/img/costela.png', desc: 'Costela suína suculenta.' },
  ],
  bebidas: [
    { id: 'agua', nome: 'Água', preco: 2.0, unidade: '500ml', img: '/img/agua.png', desc: 'Água mineral geladinha.' },
    { id: 'suco', nome: 'Suco de laranja', preco: 6.0, unidade: '1L', img: '/img/suco.png', desc: 'Suco 100% natural.' },
    { id: 'refrigerante', nome: 'Refrigerante', preco: 5.5, unidade: '2L', img: '/img/refrigerante.png', desc: 'Clássico gelado pra família.' },
    { id: 'cha', nome: 'Chá gelado', preco: 4.8, unidade: '1L', img: '/img/cha.png', desc: 'Chá gelado refrescante.' },
    { id: 'cafe', nome: 'Café', preco: 3.5, unidade: '250g', img: '/img/cafe.png', desc: 'Café moído na hora.' },
  ]
};

// Recomendados para o slider da home (use ids existentes)
const RECOMENDADOS = [
  { cat: 'frutas', id: 'maca' },
  { cat: 'verduras', id: 'brocolis' },
  { cat: 'carnes', id: 'carne' },
  { cat: 'bebidas', id: 'suco' },
];

/* =========================
   HELPERS
   ========================= */
function getProductById(id) {
  for (const cat of Object.keys(CATEGORIES)) {
    const p = CATEGORIES[cat].find(x => x.id === id);
    if (p) return { ...p, categoria: cat };
  }
  return null;
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function layout({ title, content, showBack = false }) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root{
    --brand:#ff9800;
    --brand-2:#2ecc71;
    --bg:#fffaf0;
    --card:#ffffff;
    --text:#333;
    --muted:#666;
    --shadow:0 2px 8px rgba(0,0,0,.12);
    --radius:14px;
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:var(--bg);color:var(--text)}
  header{
    position:sticky;top:0;z-index:20;background:linear-gradient(90deg,var(--brand),#ffb84d);
    color:#fff;padding:8px 10px;box-shadow:var(--shadow);display:flex;align-items:center;justify-content:center;gap:12px
  }
  header img.logo{width:260px;height:160px}
  header .title{font-size:1.6rem;font-weight:800;letter-spacing:.2px}
  nav{
    position:sticky;top:64px;z-index:19;background:#fff3e0;box-shadow:var(--shadow);
  }
  nav .wrap{max-width:1100px;margin:0 auto;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:10px}
  .menu{display:flex;gap:10px;flex-wrap:wrap}
  .pill{background:#fff;border-radius:999px;padding:8px 14px;text-decoration:none;color:var(--text);font-weight:700;box-shadow:var(--shadow);transition:.2s}
  .pill:hover{transform:translateY(-2px);background:var(--brand);color:#fff}
  .cart-badge{display:inline-flex;align-items:center;gap:8px}
  .cart-count{display:inline-flex;min-width:22px;height:22px;align-items:center;justify-content:center;border-radius:999px;background:var(--brand);color:#fff;font-size:.85rem;font-weight:800;box-shadow:var(--shadow)}
  main{max-width:1100px;margin:0 auto;padding:20px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
  .card{
    background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:14px;display:flex;flex-direction:column;gap:10px;transition:.2s
  }
  .card:hover{transform:translateY(-2px)}
  .card img{width:100%;height:160px;object-fit:contain;border-radius:10px;background:#fff}
  .name{font-weight:800}
  .muted{color:var(--muted);font-size:.9rem}
  .price{color:var(--brand);font-weight:900}
  .row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .qty{display:flex;align-items:center;gap:8px}
  .qty input{width:64px;padding:8px;border-radius:10px;border:1px solid #ddd}
  button, .btn{
    border:0;border-radius:12px;padding:10px 14px;background:var(--brand);color:#fff;font-weight:800;cursor:pointer;box-shadow:var(--shadow);text-decoration:none;display:inline-flex;align-items:center;gap:8px
  }
  button:hover,.btn:hover{filter:brightness(.95);transform:translateY(-1px)}
  .back{margin-top:16px;display:inline-block}
  /* Slider */
  .slider{position:relative;overflow:hidden;border-radius:var(--radius);box-shadow:var(--shadow);background:#fff}
  .slides{display:flex;transition:transform .5s ease}
  .slide{min-width:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center;padding:18px}
  .slide img{width:100%;height:260px;object-fit:contain}
  .slide .info{display:flex;flex-direction:column;gap:8px}
  .slider .nav-btn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.45);border:0;color:#fff;width:40px;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .slider .prev{left:10px} .slider .next{right:10px}
  .dots{display:flex;gap:6px;justify-content:center;margin-top:10px}
  .dot{width:10px;height:10px;border-radius:999px;background:#ddd}
  .dot.active{background:var(--brand)}
  /* Filtros */
  .filters{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}
  .filters input,.filters select{padding:10px;border:1px solid #ddd;border-radius:10px;background:#fff}
  /* Tabela carrinho */
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
  th,td{padding:12px;border-bottom:1px solid #eee;text-align:left}
  tfoot td{font-weight:900}
  .empty{padding:16px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow)}
  /* Toast */
  .toast{position:fixed;bottom:20px;right:20px;background:#333;color:#fff;padding:12px 16px;border-radius:12px;opacity:0;transform:translateY(10px);transition:.25s;z-index:50}
  .toast.show{opacity:1;transform:none}
</style>
</head>
<body>
<header>
  <img class="logo" src="/img/logo.png" alt="logo" />
  <div class="title">Mercadinho da Juju</div>
</header>
<nav>
  <div class="wrap">
    <div class="menu">
      <a class="pill" href="/">🏠 Início</a>
      <a class="pill" href="/frutas">🍎 Frutas</a>
      <a class="pill" href="/verduras">🥬 Verduras</a>
      <a class="pill" href="/carnes">🥩 Carnes</a>
      <a class="pill" href="/bebidas">🥤 Bebidas</a>
      <a class="pill" href="/carrinho">🛒 Carrinho</a>
    </div>
    <div class="cart-badge">Itens: <span id="cartCount" class="cart-count">0</span></div>
  </div>
</nav>
<main>
  ${content}
  ${showBack ? `<a class="btn back" href="/">⬅ Voltar ao início</a>` : ``}
</main>
<div id="toast" class="toast"></div>
<script>
  // ====== UTIL ======
  const BRL = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const toast = (msg) => {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 1600);
  };
  const getCart = () => JSON.parse(localStorage.getItem('carrinho')||'[]');
  const setCart = (c) => { localStorage.setItem('carrinho', JSON.stringify(c)); updateCartCount(); };
  const addToCart = (id, qtd=1) => {
    const cart = getCart();
    const idx = cart.findIndex(i=>i.id===id);
    if(idx>=0){ cart[idx].qtd += qtd; } else { cart.push({id,qtd}); }
    setCart(cart);
    toast('Produto adicionado ao carrinho!');
  };
  const removeFromCart = (id) => { setCart(getCart().filter(i=>i.id!==id)); };
  const updateCartCount = () => {
    const c = getCart();
    const total = c.reduce((s,i)=>s+i.qtd,0);
    const el = document.getElementById('cartCount');
    if(el) el.textContent = total;
  };
  updateCartCount();

  // ====== SLIDER (home) ======
  (function(){
    const slides = document.querySelector('.slides');
    if(!slides) return;
    const slideEls = slides.querySelectorAll('.slide');
    let i = 0;
    const go = (n)=>{ i=(n+slideEls.length)%slideEls.length; slides.style.transform = 'translateX(' + (-i*100) + '%)'; updateDots(); };
    const prev = document.querySelector('.prev'); const next = document.querySelector('.next');
    prev.addEventListener('click', ()=>go(i-1));
    next.addEventListener('click', ()=>go(i+1));
    let timer = setInterval(()=>go(i+1), 4000);
    slides.addEventListener('mouseenter',()=>clearInterval(timer));
    slides.addEventListener('mouseleave',()=>timer=setInterval(()=>go(i+1), 4000));
    const dots = document.querySelectorAll('.dot');
    function updateDots(){ dots.forEach((d,idx)=>d.classList.toggle('active', idx===i)); }
    dots.forEach((d,idx)=>d.addEventListener('click',()=>go(idx)));
    updateDots();
  })();

  // ====== LISTAGEM DINÂMICA (categorias) ======
  function renderList(containerId, items){
    const el = document.getElementById(containerId);
    if(!el) return;
    el.innerHTML = items.map(p => \`
      <div class="card">
        <img src="\${p.img}" alt="\${p.nome}">
        <div class="name">\${p.nome}</div>
        <div class="muted">\${p.desc}</div>
        <div class="row">
          <div class="price">\${BRL(p.preco)} <span class="muted">/ \${p.unidade}</span></div>
          <div class="qty">
            <input type="number" min="1" value="1" id="qtd-\${p.id}">
            <button onclick="(function(){ const q = parseInt(document.getElementById('qtd-\${p.id}').value)||1; addToCart('\${p.id}', q); })()">Adicionar</button>
          </div>
        </div>
        <div class="row">
          <a class="btn" href="/produto?id=\${encodeURIComponent(p.id)}">Ver detalhes</a>
        </div>
      </div>\`).join('');
  }
</script>
</body>
</html>
`;
}

/* =========================
   PÁGINAS
   ========================= */
function homePage() {
  const rec = RECOMENDADOS.map(r => getProductById(r.id)).filter(Boolean);
  const slides = rec.map(p => `
    <div class="slide">
      <div class="info">
        <div class="muted">Recomendado pela Juju</div>
        <div class="name" style="font-size:1.4rem">${escapeHtml(p.nome)}</div>
        <div class="muted">${escapeHtml(p.desc)}</div>
        <div class="row">
          <div class="price">${(p.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} <span class="muted">/ ${escapeHtml(p.unidade)}</span></div>
          <div class="qty">
            <input type="number" min="1" value="1" id="qtd-${p.id}">
            <button onclick="(function(){ const q = parseInt(document.getElementById('qtd-${p.id}').value)||1; addToCart('${p.id}', q); })()">Adicionar</button>
          </div>
        </div>
        <div class="row"><a class="btn" href="/produto?id=${encodeURIComponent(p.id)}">Ver detalhes</a></div>
      </div>
      <img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.nome)}">
    </div>
  `).join('');

  const dots = rec.map((_,i)=>`<div class="dot${i===0?' active':''}"></div>`).join('');

  const content = `
    <section class="slider">
      <div class="slides">
        ${slides}
      </div>
      <button class="nav-btn prev">❮</button>
      <button class="nav-btn next">❯</button>
    </section>
    <div class="dots">${dots}</div>

    <h2 style="margin:18px 0 8px">Categorias</h2>
    <div class="grid">
      <a class="card" href="/frutas"><img src="/img/maca.png" alt="Frutas"><div class="name">🍎 Frutas</div><div class="muted">Doces e fresquinhas</div></a>
      <a class="card" href="/verduras"><img src="/img/alface.png" alt="Verduras"><div class="name">🥬 Verduras</div><div class="muted">Verdes e crocantes</div></a>
      <a class="card" href="/carnes"><img src="/img/carne.png" alt="Carnes"><div class="name">🥩 Carnes</div><div class="muted">Suculentas</div></a>
      <a class="card" href="/bebidas"><img src="/img/suco.png" alt="Bebidas"><div class="name">🥤 Bebidas</div><div class="muted">Para refrescar</div></a>
    </div>
  `;
  return layout({ title: 'Início', content, showBack: false }); // sem voltar na home
}

function categoryPage(catKey, title) {
  const items = CATEGORIES[catKey] || [];
  const json = JSON.stringify(items);
  const content = `
    <h2>${escapeHtml(title)}</h2>
    <div class="filters">
      <input id="f-q" placeholder="Buscar produto..." />
      <select id="f-sort">
        <option value="nome-asc">Nome (A-Z)</option>
        <option value="nome-desc">Nome (Z-A)</option>
        <option value="preco-asc">Preço (menor)</option>
        <option value="preco-desc">Preço (maior)</option>
      </select>
    </div>
    <div id="list" class="grid"></div>
    <script>
      const DATA = ${json};
      let VIEW = [...DATA];
      const q = document.getElementById('f-q');
      const s = document.getElementById('f-sort');
      const apply = ()=>{
        const query = (q.value||'').toLowerCase();
        VIEW = DATA.filter(p=>p.nome.toLowerCase().includes(query));
        const [k,dir] = s.value.split('-');
        VIEW.sort((a,b)=>{
          if(k==='nome'){ return dir==='asc' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome); }
          if(k==='preco'){ return dir==='asc' ? a.preco-b.preco : b.preco-a.preco; }
          return 0;
        });
        renderList('list', VIEW);
      };
      q.addEventListener('input',apply);
      s.addEventListener('change',apply);
      apply();
    </script>
  `;
  return layout({ title, content, showBack: true });
}

function productPage(id) {
  const p = getProductById(id);
  if(!p) return notFound();
  const content = `
    <div class="grid" style="grid-template-columns: 1.1fr 1fr;">
      <div class="card"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.nome)}"></div>
      <div class="card">
        <div class="name" style="font-size:1.6rem">${escapeHtml(p.nome)}</div>
        <div class="muted">${escapeHtml(p.desc)}</div>
        <div class="price" style="font-size:1.2rem">${p.preco.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} <span class="muted">/ ${escapeHtml(p.unidade)}</span></div>
        <div class="qty">
          <label for="q">Quantidade:</label>
          <input id="q" type="number" min="1" value="1">
          <button onclick="(function(){ const q = parseInt(document.getElementById('q').value)||1; addToCart('${p.id}', q); })()">Adicionar ao carrinho</button>
        </div>
        <div class="row">
          <a class="btn" href="/${escapeHtml(p.categoria)}">Ver mais em ${escapeHtml(p.categoria)}</a>
          <a class="btn" href="/carrinho">Ir ao carrinho</a>
        </div>
      </div>
    </div>
  `;
  return layout({ title: p.nome, content, showBack: true });
}

function cartPage() {
const content = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Carrinho - Mercadinho da Juju</title>
<style>
  body { font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 20px; }
  h2 { text-align: center; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #fff; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
  th { background-color: #ffcc00; }
  .empty { text-align: center; margin-top: 20px; font-size: 1.2em; color: #666; }
  .row { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
  button, .btn { padding: 10px 15px; border: none; cursor: pointer; border-radius: 4px; }
  button { background-color: #ff4d4d; color: white; }
  .btn { background-color: #4CAF50; color: white; text-decoration: none; display: inline-block; }
</style>
</head>
<body>
  <h2>Seu Carrinho</h2>
  <div id="cartEmpty" class="empty" style="display:none">Seu carrinho está vazio.</div>
  <table id="cartTable" style="display:none">
    <thead>
      <tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Subtotal</th><th></th></tr>
    </thead>
    <tbody id="cartBody"></tbody>
    <tfoot>
      <tr><td colspan="3">Total</td><td id="cartTotal">R$ 0,00</td><td></td></tr>
    </tfoot>
  </table>
  <div class="row">
    <a class="btn" href="/checkout">Finalizar compra</a>
    <button onclick="localStorage.removeItem('carrinho'); renderCart();">Esvaziar</button>
  </div>

  <script>
    // --- Array de produtos (exemplo) ---
    const plano = [
    { id: 'maca', nome: 'Maçã', preco: 2.5, unidade: 'un', img: '/img/maca.png', desc: 'Maçãs fresquinhas e crocantes.' },
    { id: 'banana', nome: 'Banana', preco: 3.0, unidade: 'dúzia', img: '/img/banana.png', desc: 'Banana docinha e madura.' },
    { id: 'laranja', nome: 'Laranja', preco: 2.0, unidade: 'un', img: '/img/laranja.png', desc: 'Laranja suculenta para sucos.' },
    { id: 'abacaxi', nome: 'Abacaxi', preco: 6.8, unidade: 'un', img: '/img/abacaxi.png', desc: 'Abacaxi docinho, perfeito para sobremesas.' },
    { id: 'alface', nome: 'Alface', preco: 2.5, unidade: 'un', img: '/img/alface.png', desc: 'Alface verde, crocante e fresca.' },
    { id: 'rucula', nome: 'Rúcula', preco: 3.2, unidade: 'maço', img: '/img/rucula.png', desc: 'Rúcula com sabor levemente picante.' },
    { id: 'brocolis', nome: 'Brócolis', preco: 4.8, unidade: 'un', img: '/img/brocolis.png', desc: 'Brócolis de primeira, ótimo no vapor.' },
    { id: 'pepino', nome: 'Pepino', preco: 3.0, unidade: 'un', img: '/img/pepino.png', desc: 'Pepino crocante para saladas.' },
    { id: 'alho', nome: 'Alho', preco: 1.5, unidade: '100g', img: '/img/alho.png', desc: 'Alho aromático, dá um sabor especial.' },
    { id: 'frango', nome: 'Frango', preco: 12.5, unidade: 'kg', img: '/img/frango.png', desc: 'Frango fresco e suculento.' },
    { id: 'carne', nome: 'Carne bovina', preco: 34.9, unidade: 'kg', img: '/img/carne.png', desc: 'Carne bovina macia para grelhar.' },
    { id: 'peixe', nome: 'Peixe', preco: 22.0, unidade: 'kg', img: '/img/peixe.png', desc: 'Peixe fresco, sabor leve.' },
    { id: 'bacon', nome: 'Bacon', preco: 18.9, unidade: 'kg', img: '/img/bacon.png', desc: 'Bacon defumado crocante.' },
    { id: 'costela', nome: 'Costela suína', preco: 27.5, unidade: 'kg', img: '/img/costela.png', desc: 'Costela suína suculenta.' },
    { id: 'agua', nome: 'Água', preco: 2.0, unidade: '500ml', img: '/img/agua.png', desc: 'Água mineral geladinha.' },
    { id: 'suco', nome: 'Suco de laranja', preco: 6.0, unidade: '1L', img: '/img/suco.png', desc: 'Suco 100% natural.' },
    { id: 'refrigerante', nome: 'Refrigerante', preco: 5.5, unidade: '2L', img: '/img/refrigerante.png', desc: 'Clássico gelado pra família.' },
    { id: 'cha', nome: 'Chá gelado', preco: 4.8, unidade: '1L', img: '/img/cha.png', desc: 'Chá gelado refrescante.' },
    { id: 'cafe', nome: 'Café', preco: 3.5, unidade: '250g', img: '/img/cafe.png', desc: 'Café moído na hora.' },
    ];

    // --- Funções do carrinho ---
    function getCart() {
      return JSON.parse(localStorage.getItem('carrinho') || '[]');
    }

    function setCart(cart) {
      localStorage.setItem('carrinho', JSON.stringify(cart));
    }

    function removeFromCart(id) {
      const cart = getCart().filter(item => item.id !== id);
      setCart(cart);
      renderCart();
    }

    const CATALOG = new Map(plano.map(p => [p.id, p]));

    function updateQuantity(id, qtd) {
      qtd = parseInt(qtd) || 1;
      const cart = getCart();
      const idx = cart.findIndex(i => i.id === id);
      if (idx !== -1) {
        cart[idx].qtd = qtd;
        setCart(cart);
        renderCart();
      }
    }

    function renderCart() {
      const c = getCart();
      const body = document.getElementById('cartBody');
      const table = document.getElementById('cartTable');
      const empty = document.getElementById('cartEmpty');

      if (c.length === 0) {
        table.style.display = 'none';
        empty.style.display = 'block';
        return;
      }

      table.style.display = 'table';
      empty.style.display = 'none';
      let total = 0;

      body.innerHTML = c.map(item => {
        const p = CATALOG.get(item.id);
        const sub = p.preco * item.qtd;
        total += sub;
        return \`
          <tr>
            <td>
              <img src="\${p.img}" alt="" style="width:40px;height:40px;object-fit:contain;vertical-align:middle;margin-right:8px">
              \${p.nome}
            </td>
            <td>
              <input type="number" min="1" value="\${item.qtd}" style="width:70px" 
                onchange="updateQuantity('\${p.id}', this.value)">
            </td>
            <td>\${p.preco.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} / \${p.unidade}</td>
            <td>\${sub.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
            <td><button onclick="removeFromCart('\${p.id}')">Remover</button></td>
          </tr>\`;
      }).join('');

      document.getElementById('cartTotal').textContent =
        total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    renderCart();
  </script>
</body>
</html>
    `;

     return layout({ title: 'Carrinho', content, showBack: true });
}

function checkoutPage() {
  const content = `
    <h2>Finalizar Compra</h2>
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card">
        <div class="name">Dados do cliente</div>
        <form id="f" onsubmit="return false" style="display:flex;flex-direction:column;gap:10px">
          <input required placeholder="Nome completo">
          <input required type="email" placeholder="E-mail">
          <input required placeholder="Telefone">
          <input required placeholder="Endereço">
          <select required>
            <option value="" disabled selected>Forma de pagamento</option>
            <option>Cartão de crédito</option>
            <option>Pix</option>
            <option>Boleto</option>
          </select>
          <button onclick="finalizar()">Concluir pedido</button>
        </form>
      </div>
      <div class="card">
        <div class="name">Resumo</div>
        <div id="resumo" class="muted">Carregando...</div>
      </div>
    </div>
    <script>
      function finalizar(){
        const c = getCart();
        if(c.length===0){ toast('Carrinho vazio!'); return; }
        toast('Pedido realizado! Obrigado 🧡');
        localStorage.removeItem('carrinho');
        setTimeout(()=>{ window.location.href='/' }, 900);
      }
      (function resumo(){
        const c = getCart(); if(c.length===0){ document.getElementById('resumo').textContent='Carrinho vazio.'; return; }
        // Monta catálogo rápido no client com nomes/preços (para um resumo simples):
        const MAP = new Map(${JSON.stringify(Object.values(CATEGORIES).flat().map(p=>({id:p.id,nome:p.nome,preco:p.preco,unidade:p.unidade})))}.map(p=>[p.id,p]));
        let total=0;
        const html = c.map(i=>{ const p=MAP.get(i.id); const sub=p.preco*i.qtd; total+=sub; return \`\${i.qtd}x \${p.nome} — \${sub.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}\`; }).join('<br>');
        document.getElementById('resumo').innerHTML = html + '<hr><b>Total: ' + total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) + '</b>';
      })();
    </script>
  `;
  return layout({ title: 'Checkout', content, showBack: true });
}

function notFound() {
  const content = `<div class="empty">Ops! Página não encontrada.</div>`;
  return layout({ title: '404', content, showBack: true });
}

/* =========================
   SERVIÇO DE IMAGENS (estático)
   ========================= */
function serveStatic(req, res) {
  const url = decodeURIComponent(req.url);
  if (!url.startsWith('/img/')) return false;

  // segurança básica: impedir path traversal
  const filePath = path.join(__dirname, url);
  if (!filePath.startsWith(path.join(__dirname, 'img'))) {
    res.writeHead(403); res.end('Forbidden'); return true;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Imagem não encontrada'); return; }
    const ext = path.extname(filePath).toLowerCase();
    const types = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.svg':'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
  return true;
}

/* =========================
   ROTAS
   ========================= */
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // servir imagens estáticas
  if (url.startsWith('/img/')) {
    serveStatic(req, res);
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (url === '/') {
    res.end(homePage());
  }
  else if (url === '/frutas') {
    res.end(categoryPage('frutas', 'Frutas'));
  }
  else if (url === '/verduras') {
    res.end(categoryPage('verduras', 'Verduras'));
  }
  else if (url === '/carnes') {
    res.end(categoryPage('carnes', 'Carnes'));
  }
  else if (url === '/bebidas') {
    res.end(categoryPage('bebidas', 'Bebidas'));
  }
  else if (url.startsWith('/produto')) {
    const id = new URL('http://x'+req.url).searchParams.get('id');
    res.end(productPage(id));
  }
  else if (url === '/carrinho') {
    res.end(cartPage());
  }
  else if (url === '/checkout') {
    res.end(checkoutPage());
  }
  else {
    res.statusCode = 404;
    res.end(notFound());
  }
});

server.listen(porta, () => {
  console.log('Servidor rodando');
  console.log('Endereço: http://localhost:' + porta);
});