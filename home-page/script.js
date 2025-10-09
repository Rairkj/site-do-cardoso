// Controle do menu ativo e scroll suave
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');

    // Se for feedback, abre link externo em nova aba e previne o comportamento padrão
    if(href.includes("flyaway999.github.io")) {
      e.preventDefault();
      window.open(href, "_blank");
      return;
    }

    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');

    // Scroll suave para a seção
    const targetId = href.slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Atualiza menu ativo ao rolar a página
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

// Modal admin simples
const modal = document.getElementById('adminModal');
const adminBtn = document.getElementById('adminBtn');
const closeBtn = document.querySelector('.close');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

adminBtn.addEventListener('click', () => modal.style.display = 'block');
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });

// Login fixo
const ADMIN_EMAIL = "admin@escola.com";
const ADMIN_PASSWORD = "123456";

loginBtn.addEventListener('click', () => {
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;

  if(email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    alert("Login realizado com sucesso!");
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
  } else {
    alert("Email ou senha incorretos!");
  }
});

// Logout simples
logoutBtn.addEventListener('click', () => {
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  modal.style.display = 'none';
});
