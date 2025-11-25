// ===============================
// 🌐 Controle do menu ativo e scroll suave
// ===============================
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');

    // Se for feedback, abre link externo em nova aba
    if (href.includes("flyaway999.github.io")) {
      e.preventDefault();
      window.open(href, "_blank");
      return;
    }

    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');

    const targetId = href.slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Atualiza o menu ativo ao rolar a página
window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  document.querySelectorAll('section[id]').forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
});

// ===============================
// 🔐 Modal Admin + Login
// ===============================
const modal = document.getElementById('adminModal');
const adminBtn = document.getElementById('adminBtn');
const closeBtn = document.querySelector('.close');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Abre modal admin
adminBtn.addEventListener('click', () => {
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
});

// Fecha modal
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// ===============================
// 👨‍💼 Login Admin
// ===============================
const ADMIN_EMAIL = "admin@escola.com";
const ADMIN_PASSWORD = "123456";

loginBtn.addEventListener('click', () => {
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    alert("✅ Login realizado com sucesso!");
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
    loadNotices();
  } else {
    alert("❌ Email ou senha incorretos!");
  }
});

logoutBtn.addEventListener('click', () => {
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// ===============================
// 📝 Criar e exibir avisos
// ===============================
const createNoticeBtn = document.getElementById('createNoticeBtn');
const noticesGrid = document.getElementById('noticesGrid');

function loadNotices() {
  const notices = JSON.parse(localStorage.getItem('notices')) || [];

  // --- Mural público ---
  noticesGrid.innerHTML = '';
  const pinned = notices.filter(n => n.pinned);
  const regular = notices.filter(n => !n.pinned);
  [...pinned, ...regular].forEach(notice => {
    const div = document.createElement('div');
    div.className = 'notice-card';
    div.innerHTML = `
      ${notice.image ? `<img src="${notice.image}" alt="Aviso">` : ''}
      <h3>${notice.title}</h3>
      <p>${notice.content}</p>
      <small>Autor: ${notice.author}</small>
    `;
    noticesGrid.appendChild(div);
  });
  if (notices.length === 0) {
    noticesGrid.innerHTML = '<div class="loading">Nenhum aviso disponível</div>';
  }

  // --- Lista de avisos no painel admin ---
  const adminNoticesList = document.getElementById('adminNoticesList');
  adminNoticesList.innerHTML = '';
  notices.forEach((notice, index) => {
    const div = document.createElement('div');
    div.className = 'admin-notice';
    div.innerHTML = `
      <strong>${notice.title}</strong> - ${notice.author}
      <button class="delete-btn" data-index="${index}">Excluir</button>
    `;
    adminNoticesList.appendChild(div);
  });

  // Evento de excluir aviso
  const deleteBtns = document.querySelectorAll('#adminNoticesList .delete-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-index');
      const notices = JSON.parse(localStorage.getItem('notices')) || [];
      notices.splice(idx, 1);
      localStorage.setItem('notices', JSON.stringify(notices));
      loadNotices();
    });
  });
}

// Criar novo aviso
createNoticeBtn.addEventListener('click', () => {
  const title = document.getElementById('noticeTitle').value.trim();
  const content = document.getElementById('noticeContent').value.trim();
  const image = document.getElementById('noticeImage').value.trim();
  const author = document.getElementById('noticeAuthor').value.trim();
  const pinned = document.getElementById('noticePinned').checked;

  if (!title || !content || !author) {
    alert('Preencha pelo menos título, conteúdo e autor!');
    return;
  }

  const notices = JSON.parse(localStorage.getItem('notices')) || [];
  notices.push({ title, content, image, author, pinned });
  localStorage.setItem('notices', JSON.stringify(notices));

  // Limpa campos
  document.getElementById('noticeTitle').value = '';
  document.getElementById('noticeContent').value = '';
  document.getElementById('noticeImage').value = '';
  document.getElementById('noticeAuthor').value = '';
  document.getElementById('noticePinned').checked = false;

  loadNotices();
  alert('✅ Aviso publicado com sucesso!');
});

// Carrega avisos ao abrir página
loadNotices();
// ===============================
// 🖼️ Preview da Imagem no Painel Admin
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const noticeImageInput = document.getElementById("noticeImage");

    if (!noticeImageInput) {
        console.warn("Input noticeImage não encontrado.");
        return;
    }

    // Criar preview se não existir
    let preview = document.getElementById("imagePreview");

    if (!preview) {
        preview = document.createElement("img");
        preview.id = "imagePreview";

        // Estilos da imagem de preview
        preview.style.display = "none";
        preview.style.width = "100%";
        preview.style.maxHeight = "200px";
        preview.style.objectFit = "cover";
        preview.style.borderRadius = "10px";
        preview.style.marginTop = "10px";
        preview.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";

        // Insere logo abaixo do campo de URL da imagem
        noticeImageInput.insertAdjacentElement("afterend", preview);
    }

    noticeImageInput.addEventListener("input", () => {
        const url = noticeImageInput.value.trim();

        if (!url) {
            preview.style.display = "none";
            return;
        }

        preview.src = url;
        preview.style.display = "block";
    });
});
