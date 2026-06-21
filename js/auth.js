/**
 * ============================================================================
 * FORA DO RADAR - Sistema de Autenticação
 * ============================================================================
 *
 * Este ficheiro gerencia toda a autenticação do utilizador:
 * - Registo de novos utilizadores
 * - Login de utilizadores existentes
 * - Logout
 * - Recuperação de password
 *
 * Utiliza o sistema de autenticação do Supabase.
 * ============================================================================
 */

// Importar cliente Supabase
import { supabase, getCurrentUser } from './supabase.js';

/**
 * ============================================================================
 * INICIALIZAÇÃO DA PÁGINA
 * ============================================================================
 */

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔐 Sistema de autenticação inicializado');

    // Verificar se há erros no URL (vindos do Supabase)
    checkUrlErrors();

    // Verificar se o utilizador já está logado
    const user = await getCurrentUser();

    // Se estiver logado e estiver na página de login/registo,
    // redirecionar para a página inicial
    if (user) {
        const currentPage = window.location.pathname;
        if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
            window.location.href = '/index.html';
            return;
        }
    }

    // Inicializar formulários
    initLoginForm();
    initRegisterForm();
    initResetPasswordForm();
    initUpdatePasswordForm();
});

/**
 * ============================================================================
 * FORMULÁRIO DE LOGIN
 * ============================================================================
 */

/**
 * Inicializar o formulário de login
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');

    // Se o formulário não existir nesta página, não fazer nada
    if (!loginForm) return;

    // Adicionar evento de submit
    loginForm.addEventListener('submit', async (e) => {
        // Impedir comportamento padrão do formulário
        e.preventDefault();

        // Obter valores dos campos
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;

        // Validar campos
        if (!email || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        // Validar formato do email
        if (!isValidEmail(email)) {
            showError('Por favor, insira um email válido.');
            return;
        }

        // Validar tamanho da password
        if (password.length < 6) {
            showError('A password deve ter pelo menos 6 caracteres.');
            return;
        }

        // Tentar fazer login
        await performLogin(email, password);
    });
}

/**
 * Realizar login
 * @param {string} email - Email do utilizador
 * @param {string} password - Password do utilizador
 */
async function performLogin(email, password) {
    // Mostrar loading
    showLoading(true);

    try {
        // Chamar API do Supabase para autenticar
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        // Se houver erro, mostrar mensagem
        if (error) {
            // Traduzir mensagens de erro comuns
            const errorMessage = translateError(error.message);
            showError(errorMessage);
            showLoading(false);
            return;
        }

        // Login bem-sucedido!
        console.log('✅ Login realizado com sucesso:', data.user.email);

        // Mostrar mensagem de sucesso
        showSuccess('Login realizado com sucesso!');

        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);

    } catch (error) {
        console.error('Erro inesperado:', error);
        showError('Ocorreu um erro inesperado. Tente novamente.');
        showLoading(false);
    }
}

/**
 * ============================================================================
 * FORMULÁRIO DE REGISTO
 * ============================================================================
 */

/**
 * Inicializar o formulário de registo
 */
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');

    // Se o formulário não existir nesta página, não fazer nada
    if (!registerForm) return;

    // Adicionar evento de submit
    registerForm.addEventListener('submit', async (e) => {
        // Impedir comportamento padrão do formulário
        e.preventDefault();

        // Obter valores dos campos
        const nome = document.getElementById('nome')?.value;
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        // Validar campos
        if (!nome || !email || !password || !confirmPassword) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        // Validar formato do email
        if (!isValidEmail(email)) {
            showError('Por favor, insira um email válido.');
            return;
        }

        // Validar tamanho da password
        if (password.length < 6) {
            showError('A password deve ter pelo menos 6 caracteres.');
            return;
        }

        // Validar se as passwords coincidem
        if (password !== confirmPassword) {
            showError('As passwords não coincidem.');
            return;
        }

        // Tentar registar
        await performRegister(email, password, nome);
    });
}

/**
 * Realizar registo
 * @param {string} email - Email do utilizador
 * @param {string} password - Password do utilizador
 * @param {string} nome - Nome do utilizador
 */
async function performRegister(email, password, nome) {
    // Mostrar loading
    showLoading(true);

    try {
        // Chamar API do Supabase para registar
        // Nota: O perfil é criado automaticamente pelo trigger na base de dados
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // Passar o nome nos metadados
                // Os metadados ficam guardados no utilizador
                data: {
                    nome: nome
                }
            }
        });

        // Se houver erro, mostrar mensagem
        if (error) {
            const errorMessage = translateError(error.message);
            showError(errorMessage);
            showLoading(false);
            return;
        }

        // Registo bem-sucedido!
        console.log('✅ Registo realizado com sucesso:', data.user.email);

        // Mostrar mensagem de sucesso
        showSuccess('Conta criada com sucesso! Pode fazer login.');

        // Redirecionar para página de login após 2 segundos
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 2000);

    } catch (error) {
        console.error('Erro inesperado:', error);
        showError('Ocorreu um erro inesperado. Tente novamente.');
        showLoading(false);
    }
}

/**
 * ============================================================================
 * RECUPERAÇÃO DE PASSWORD
 * ============================================================================
 */

/**
 * Inicializar o formulário de recuperação
 */
function initResetPasswordForm() {
    const resetForm = document.getElementById('reset-password-form');

    // Se o formulário não existir nesta página, não fazer nada
    if (!resetForm) return;

    // Adicionar evento de submit
    resetForm.addEventListener('submit', async (e) => {
        // Impedir comportamento padrão do formulário
        e.preventDefault();

        // Obter valor do email
        const email = document.getElementById('email')?.value;

        // Validar email
        if (!email || !isValidEmail(email)) {
            showError('Por favor, insira um email válido.');
            return;
        }

        // Tentar enviar email de recuperação
        await performPasswordReset(email);
    });
}

/**
 * Enviar email de recuperação de password
 * @param {string} email - Email do utilizador
 */
async function performPasswordReset(email) {
    // Mostrar loading
    showLoading(true);

    try {
        // Chamar API do Supabase para enviar email de recuperação
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // URL para onde o utilizador será redirecionado após clicar no link
            redirectTo: `${window.location.origin}/pages/update-password.html`
        });

        // Se houver erro, mostrar mensagem
        if (error) {
            const errorMessage = translateError(error.message);
            showError(errorMessage);
            showLoading(false);
            return;
        }

        // Email enviado com sucesso!
        showSuccess('Email de recuperação enviado! Verifique a sua caixa de entrada.');

        // Desabilitar formulário
        const form = document.getElementById('reset-password-form');
        if (form) {
            form.querySelectorAll('input, button').forEach(el => {
                el.disabled = true;
            });
        }

    } catch (error) {
        console.error('Erro inesperado:', error);
        showError('Ocorreu um erro inesperado. Tente novamente.');
        showLoading(false);
    }
}

/**
 * ============================================================================
 * ATUALIZAR PASSWORD
 * ============================================================================
 */

/**
 * Inicializar o formulário de atualização de password
 */
function initUpdatePasswordForm() {
    const updateForm = document.getElementById('update-password-form');

    // Se o formulário não existir nesta página, não fazer nada
    if (!updateForm) return;

    // Verificar se há um token de recuperação no URL
    // O Supabase adiciona automaticamente estes parâmetros
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    // Se não houver token, redirecionar para página inicial
    if (!accessToken || type !== 'recovery') {
        showError('Link de recuperação inválido ou expirado.');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 2000);
        return;
    }

    // O utilizador está autenticado temporariamente via token
    // Podemos agora atualizar a password

    // Adicionar evento de submit
    updateForm.addEventListener('submit', async (e) => {
        // Impedir comportamento padrão do formulário
        e.preventDefault();

        // Obter valores
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        // Validar campos
        if (!newPassword || !confirmPassword) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        // Validar tamanho da password
        if (newPassword.length < 6) {
            showError('A password deve ter pelo menos 6 caracteres.');
            return;
        }

        // Validar se as passwords coincidem
        if (newPassword !== confirmPassword) {
            showError('As passwords não coincidem.');
            return;
        }

        // Atualizar password
        await updatePassword(newPassword);
    });
}

/**
 * Atualizar password do utilizador
 * @param {string} newPassword - Nova password
 */
async function updatePassword(newPassword) {
    // Mostrar loading
    showLoading(true);

    try {
        // Chamar API do Supabase para atualizar a password
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        // Se houver erro, mostrar mensagem
        if (error) {
            const errorMessage = translateError(error.message);
            showError(errorMessage);
            showLoading(false);
            return;
        }

        // Password atualizada com sucesso!
        showSuccess('Password atualizada com sucesso!');

        // Fazer logout (para limpar a sessão temporária)
        await supabase.auth.signOut();

        // Redirecionar para login
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 2000);

    } catch (error) {
        console.error('Erro inesperado:', error);
        showError('Ocorreu um erro inesperado. Tente novamente.');
        showLoading(false);
    }
}

/**
 * ============================================================================
 * FUNÇÕES UTILITÁRIAS
 * ============================================================================
 */

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true se válido, false caso contrário
 */
function isValidEmail(email) {
    // Expressão regular simples para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Traduzir mensagens de erro do Supabase
 * @param {string} message - Mensagem original
 * @returns {string} - Mensagem traduzida
 */
function translateError(message) {
    // Objeto com traduções de mensagens comuns
    const translations = {
        'Invalid login credentials': 'Email ou password incorretos.',
        'Email not confirmed': 'Email não confirmado.',
        'User already registered': 'Este email já está registado.',
        'Password should be at least 6 characters': 'A password deve ter pelo menos 6 caracteres.',
        'Invalid email': 'Email inválido.',
        'User not found': 'Utilizador não encontrado.',
        'Unable to find user for password reset': 'Não foi encontrado nenhum utilizador com este email.',
        'Password update requires a logged in user': 'Sessão expirada. Peça um novo link de recuperação.',
        'New password should be different from the old password': 'A nova password deve ser diferente da anterior.'
    };

    // Procure tradução, ou devolva mensagem original
    return translations[message] || message;
}

/**
 * Verificar erros no URL
 * O Supabase pode redirecionar com erros no hash
 */
function checkUrlErrors() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error) {
        showError(decodeURIComponent(errorDescription || error));
        // Limpar hash do URL
        history.replaceState(null, '', window.location.pathname);
    }
}

/**
 * Mostrar mensagem de erro
 * @param {string} message - Mensagem a mostrar
 */
function showError(message) {
    const errorEl = document.querySelector('.auth-error');
    const successEl = document.querySelector('.auth-success');

    // Esconder sucesso
    if (successEl) successEl.style.display = 'none';

    // Mostrar erro
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

/**
 * Mostrar mensagem de sucesso
 * @param {string} message - Mensagem a mostrar
 */
function showSuccess(message) {
    const errorEl = document.querySelector('.auth-error');
    const successEl = document.querySelector('.auth-success');

    // Esconder erro
    if (errorEl) errorEl.style.display = 'none';

    // Mostrar sucesso
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
    }
}

/**
 * Mostrar/esconder indicador de loading
 * @param {boolean} show - true para mostrar, false para esconder
 */
function showLoading(show) {
    const submitBtn = document.querySelector('button[type="submit"]');

    if (submitBtn) {
        if (show) {
            // Desabilitar botão e mostrar loading
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.textContent;
            submitBtn.textContent = 'A processar...';
        } else {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Enviar';
        }
    }
}