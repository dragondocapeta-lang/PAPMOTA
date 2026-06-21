/**
 * ============================================================================
 * FORA DO RADAR - Ficheiro JavaScript Principal v2.0
 * ============================================================================
 */

import {
    supabase,
    getCurrentUser,
    getRandomClube
} from './supabase.js';

/**
 * Estado Global
 */
const AppState = {
    currentUser: null,
    userProfile: null,
    isLoading: false
};

/**
 * Inicialização
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 FORA DO RADAR v2.0 - Inicializando...');

    // Verificar autenticação
    await checkAuthState();

    // Inicializar menu mobile
    initMobileMenu();

    // Inicializar botão de autenticação
    initAuthButton();

    // Header scroll effect
    initHeaderScroll();

    // Carregar clube aleatório na homepage
    if (isHomePage()) {
        await loadRandomClub();
    }

    // Listener para mudanças de autenticação
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event);

        if (event === 'SIGNED_IN') {
            AppState.currentUser = session.user;
            updateUIForLoggedInUser();
        } else if (event === 'SIGNED_OUT') {
            AppState.currentUser = null;
            AppState.userProfile = null;
            updateUIForLoggedOutUser();
        }
    });

    console.log('✅ FORA DO RADAR - Pronto!');
});

/**
 * Verificar estado de autenticação
 */
async function checkAuthState() {
    try {
        const user = await getCurrentUser();
        AppState.currentUser = user;

        if (user) {
            updateUIForLoggedInUser();
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

/**
 * Inicializar botão de autenticação com dropdown
 */
function initAuthButton() {
    const authBtn = document.querySelector('.auth-btn');
    const authDropdown = document.querySelector('.auth-dropdown');

    if (!authBtn || !authDropdown) return;

    // Toggle dropdown ao clicar no botão
    authBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        authDropdown.classList.toggle('active');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!authBtn.contains(e.target) && !authDropdown.contains(e.target)) {
            authDropdown.classList.remove('active');
        }
    });

    // Prevenir que clique dentro do dropdown o feche
    authDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

/**
 * Inicializar menu do utilizador (quando logado)
 */
function initUserMenu() {
    const userBtn = document.querySelector('.user-btn');
    const userDropdown = document.querySelector('.user-dropdown');

    if (!userBtn || !userDropdown) return;

    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userDropdown.classList.remove('active');
    });
}

/**
 * Atualizar UI para utilizador logado
 */
function updateUIForLoggedInUser() {
    const authContainer = document.querySelector('.auth-container');
    if (!authContainer) return;

    const userName = AppState.userProfile?.nome || AppState.currentUser?.email?.split('@')[0] || 'Utilizador';
    const initials = userName.charAt(0).toUpperCase();

    authContainer.innerHTML = `
        <div class="user-menu">
            <button class="user-btn">
                <div class="user-avatar">${initials}</div>
                <span class="user-name">${userName}</span>
            </button>
            <div class="user-dropdown">
                <button onclick="logout()" class="logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Terminar Sessão
                </button>
            </div>
        </div>
    `;

    // Inicializar dropdown do user
    initUserMenu();
}

/**
 * Atualizar UI para utilizador não logado
 */
function updateUIForLoggedOutUser() {
    const authContainer = document.querySelector('.auth-container');
    if (!authContainer) return;

    authContainer.innerHTML = `
        <button class="auth-btn">
            <span class="auth-btn-icon">👤</span>
            <span>Entrar</span>
        </button>
        <div class="auth-dropdown">
            <a href="/pages/login.html" class="auth-dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Iniciar Sessão
            </a>
            <div class="auth-dropdown-divider"></div>
            <a href="/pages/register.html" class="auth-dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Criar Conta
            </a>
        </div>
    `;

    // Reinicializar dropdown
    initAuthButton();
}

/**
 * Logout
 */
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Erro ao fazer logout:', error.message);
            showNotification('Erro ao sair. Tente novamente.', 'error');
            return;
        }

        window.location.href = '/index.html';
    } catch (error) {
        console.error('Erro inesperado:', error);
        showNotification('Erro inesperado. Tente novamente.', 'error');
    }
}

window.logout = logout;

/**
 * Menu Mobile
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        const icon = menuToggle.querySelector('span');
        if (icon) {
            icon.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        }
    });

    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('span');
            if (icon) icon.textContent = '☰';
        });
    });
}

/**
 * Header scroll effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/**
 * Verificar se é homepage
 */
function isHomePage() {
    return document.getElementById('random-club-container') !== null;
}

/**
 * Carregar clube aleatório
 */
async function loadRandomClub() {
    const container = document.getElementById('random-club-container');
    if (!container) return;

    container.innerHTML = `
        <div class="random-club-card">
            <div class="loading-skeleton">
                <div class="skeleton emblem"></div>
                <div class="skeleton text"></div>
                <div class="skeleton text short"></div>
            </div>
        </div>
    `;

    try {
        const clube = await getRandomClube();

        if (!clube) {
            container.innerHTML = `
                <div class="random-club-card">
                    <div class="error-message">
                        <p>Não foi possível carregar</p>
                    </div>
                </div>
            `;
            return;
        }

        renderRandomClub(clube, container);
    } catch (error) {
        console.error('Erro ao carregar clube:', error);
        container.innerHTML = `
            <div class="random-club-card">
                <div class="error-message">
                    <p>Erro inesperado</p>
                </div>
            </div>
        `;
    }
}

/**
 * Renderizar clube aleatório
 */
function renderRandomClub(clube, container) {
    const paisNome = clube.ligas?.paises?.nome || '';
    const paisBandeira = clube.ligas?.paises?.bandeira || '';
    const ligaNome = clube.ligas?.nome || '';

    container.innerHTML = `
        <a href="/pages/clube.html?id=${clube.id}" class="random-club-card">
            <div class="random-club-emblem">
                ${clube.escudo || '⚽'}
            </div>
            <div class="random-club-info">
                <h3 class="random-club-name">${clube.nome}</h3>
                <p class="random-club-country">
                    ${paisBandeira} ${paisNome}
                </p>
                <p class="random-club-league">
                    🏆 ${ligaNome}
                </p>
                <button class="random-club-btn">
                    Ver detalhes →
                </button>
            </div>
        </a>
    `;
}

/**
 * Notificação
 */
function showNotification(message, type = 'info') {
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

window.showNotification = showNotification;

/**
 * Navegação
 */
function navigateTo(path) {
    window.location.href = path;
}

window.navigateTo = navigateTo;

/**
 * Sanitização
 */
function sanitizeInput(input) {
    const str = String(input);
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

export { AppState, sanitizeInput };
