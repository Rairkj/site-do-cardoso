import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupNavigation();
    setupModal();
    setupFeedbackForm();
    await checkAuthState();
    await loadNotices();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

function setupModal() {
    const modal = document.getElementById('adminModal');
    const adminBtn = document.getElementById('adminBtn');
    const closeBtn = document.querySelector('.close');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const createNoticeBtn = document.getElementById('createNoticeBtn');

    adminBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    createNoticeBtn.addEventListener('click', handleCreateNotice);
}

async function checkAuthState() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        currentUser = session.user;
        showAdminPanel();
        await loadAdminNotices();
    }

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            showAdminPanel();
            loadAdminNotices();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showAuthSection();
        }
    });
}

async function handleLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        alert('Por favor, preencha email e senha');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert('Erro ao fazer login: ' + error.message);
    } else {
        alert('Login realizado com sucesso!');
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
    }
}

async function handleRegister() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        alert('Por favor, preencha email e senha');
        return;
    }

    if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        alert('Erro ao criar conta: ' + error.message);
    } else {
        alert('Conta criada com sucesso! Você já está logado.');
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
    }
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert('Erro ao sair: ' + error.message);
    } else {
        alert('Logout realizado com sucesso!');
        document.getElementById('adminModal').style.display = 'none';
    }
}

function showAdminPanel() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

function showAuthSection() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

async function handleCreateNotice() {
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;
    const imageUrl = document.getElementById('noticeImage').value;
    const author = document.getElementById('noticeAuthor').value;
    const isPinned = document.getElementById('noticePinned').checked;

    if (!title || !content) {
        alert('Por favor, preencha título e conteúdo');
        return;
    }

    const { data, error } = await supabase
        .from('notices')
        .insert([
            {
                title,
                content,
                image_url: imageUrl || null,
                created_by: author || 'Administrador',
                is_pinned: isPinned
            }
        ]);

    if (error) {
        alert('Erro ao criar aviso: ' + error.message);
    } else {
        alert('Aviso publicado com sucesso!');
        document.getElementById('noticeTitle').value = '';
        document.getElementById('noticeContent').value = '';
        document.getElementById('noticeImage').value = '';
        document.getElementById('noticeAuthor').value = '';
        document.getElementById('noticePinned').checked = false;
        await loadNotices();
        await loadAdminNotices();
    }
}

async function loadNotices() {
    const noticesGrid = document.getElementById('noticesGrid');
    noticesGrid.innerHTML = '<div class="loading">Carregando avisos...</div>';

    const { data: notices, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        noticesGrid.innerHTML = '<div class="loading">Erro ao carregar avisos</div>';
        return;
    }

    if (!notices || notices.length === 0) {
        noticesGrid.innerHTML = '<div class="loading">Nenhum aviso publicado ainda</div>';
        return;
    }

    noticesGrid.innerHTML = notices.map(notice => createNoticeCard(notice)).join('');
}

function createNoticeCard(notice) {
    const date = new Date(notice.created_at).toLocaleDateString('pt-BR');
    const pinnedClass = notice.is_pinned ? 'pinned' : '';

    return `
        <div class="notice-card ${pinnedClass}">
            ${notice.image_url ? `<img src="${notice.image_url}" alt="${notice.title}" class="notice-image">` : ''}
            <div class="notice-content">
                <h3 class="notice-title">${notice.title}</h3>
                <p class="notice-text">${notice.content}</p>
                <div class="notice-meta">
                    <span>Por: ${notice.created_by}</span>
                    <span>${date}</span>
                </div>
            </div>
        </div>
    `;
}

async function loadAdminNotices() {
    const adminNoticesList = document.getElementById('adminNoticesList');

    const { data: notices, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !notices || notices.length === 0) {
        adminNoticesList.innerHTML = '<p style="text-align: center; color: #999;">Nenhum aviso criado ainda</p>';
    } else {
        adminNoticesList.innerHTML = `
            <h3>Seus Avisos</h3>
            ${notices.map(notice => `
                <div class="admin-notice-item">
                    <div>
                        <strong>${notice.title}</strong>
                        ${notice.is_pinned ? ' 📌' : ''}
                        <br>
                        <small>${new Date(notice.created_at).toLocaleDateString('pt-BR')}</small>
                    </div>
                    <button class="delete-btn" onclick="deleteNotice('${notice.id}')">Excluir</button>
                </div>
            `).join('')}
        `;
    }

    await loadAdminFeedback();
}

async function loadAdminFeedback() {
    const adminFeedbackList = document.getElementById('adminFeedbackList');

    const { data: feedbacks, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !feedbacks || feedbacks.length === 0) {
        adminFeedbackList.innerHTML = '<p style="text-align: center; color: #999;">Nenhum feedback recebido ainda</p>';
        return;
    }

    adminFeedbackList.innerHTML = feedbacks.map(feedback => {
        const date = new Date(feedback.created_at).toLocaleDateString('pt-BR');
        const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);

        return `
            <div class="feedback-item">
                <div class="feedback-item-header">
                    <span class="feedback-item-name">${feedback.name}</span>
                    <span class="feedback-item-rating">${stars}</span>
                </div>
                <div class="feedback-item-email">${feedback.email}</div>
                <div class="feedback-item-message">${feedback.message}</div>
                <div class="feedback-item-date">${date}</div>
            </div>
        `;
    }).join('');
}

function setupFeedbackForm() {
    const stars = document.querySelectorAll('.star');
    const feedbackForm = document.getElementById('feedbackForm');
    const ratingInput = document.getElementById('feedbackRating');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            ratingInput.value = rating;

            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                if (starRating <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                if (starRating <= rating) {
                    s.style.color = 'var(--secondary)';
                }
            });
        });

        star.addEventListener('mouseleave', () => {
            stars.forEach(s => {
                if (!s.classList.contains('active')) {
                    s.style.color = '#ddd';
                }
            });
        });
    });

    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSubmitFeedback();
    });
}

async function handleSubmitFeedback() {
    const name = document.getElementById('feedbackName').value;
    const email = document.getElementById('feedbackEmail').value;
    const message = document.getElementById('feedbackMessage').value;
    const rating = document.getElementById('feedbackRating').value;

    if (!name || !email || !message || !rating) {
        alert('Por favor, preencha todos os campos e selecione uma avaliação');
        return;
    }

    const { data, error } = await supabase
        .from('feedback')
        .insert([
            {
                name,
                email,
                message,
                rating: parseInt(rating)
            }
        ]);

    if (error) {
        alert('Erro ao enviar feedback: ' + error.message);
    } else {
        alert('Feedback enviado com sucesso! Obrigado pela sua opinião.');
        document.getElementById('feedbackForm').reset();
        document.getElementById('feedbackRating').value = '';
        document.querySelectorAll('.star').forEach(s => {
            s.classList.remove('active');
            s.style.color = '#ddd';
        });
    }
}

window.deleteNotice = async function(noticeId) {
    if (!confirm('Tem certeza que deseja excluir este aviso?')) {
        return;
    }

    const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeId);

    if (error) {
        alert('Erro ao excluir aviso: ' + error.message);
    } else {
        alert('Aviso excluído com sucesso!');
        await loadNotices();
        await loadAdminNotices();
    }
};
