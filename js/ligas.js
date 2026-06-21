/**
 * ============================================================================
 * FORA DO RADAR - Gestão de Ligas
 * ============================================================================
 *
 * Este ficheiro gerencia a listagem e exibição de ligas.
 * As ligas são carregadas da base de dados Supabase,
 * filtradas pelo país selecionado.
 *
 * ============================================================================
 */

// Importar funções do Supabase
import {
    supabase,
    getLigasByPais,
    getPaises,
    getClubesByLiga,
    sanitizeInput
} from './supabase.js';
import { showNotification } from './main.js';

/**
 * ============================================================================
 * ESTADO DA PÁGINA
 * ============================================================================
 */
const PageState = {
    // ID do país atual (obtido do URL)
    paisId: null,

    // Informações do país atual
    paisAtual: null,

    // Lista de ligas do país
    ligas: [],

    // Se está a carregar dados
    isLoading: false
};

/**
 * ============================================================================
 * INICIALIZAÇÃO
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏆 Página de ligas inicializada');

    // Obter ID do país do URL
    PageState.paisId = getPaisIdFromUrl();

    // Se não houver país, mostrar erro
    if (!PageState.paisId) {
        showError('Nenhum país especificado');
        return;
    }

    // Carregar informações do país
    await loadPaisInfo();

    // Carregar ligas
    await loadLigas();
});

/**
 * ============================================================================
 * FUNÇÕES DE URL
 * ============================================================================
 */

/**
 * Obter ID do país do URL
 * @returns {number|null} - ID do país ou null
 */
function getPaisIdFromUrl() {
    // Obter parâmetros do URL
    const urlParams = new URLSearchParams(window.location.search);
    const paisId = urlParams.get('pais');

    // Converter para número
    if (paisId) {
        return parseInt(paisId);
    }

    return null;
}

/**
 * ============================================================================
 * CARREGAR DADOS
 * ============================================================================
 */

/**
 * Carregar informações do país atual
 */
async function loadPaisInfo() {
    try {
        // Obter todos os países e filtrar pelo ID
        // (Alternativa mais simples seria ter uma função getPaisById)
        const paises = await getPaises();
        PageState.paisAtual = paises.find(p => p.id === PageState.paisId);

        // Atualizar título da página
        updatePageTitle();

        // Atualizar breadcrumb
        updateBreadcrumb();
    } catch (error) {
        console.error('Erro ao carregar informações do país:', error);
    }
}

/**
 * Carregar ligas do país
 */
async function loadLigas() {
    // Evitar carregar se já está a carregar
    if (PageState.isLoading) return;

    PageState.isLoading = true;
    const container = document.getElementById('ligas-grid');

    if (!container) {
        PageState.isLoading = false;
        return;
    }

    // Mostrar loading
    container.innerHTML = renderLoadingSkeletons(4);

    try {
        // Carregar ligas do país
        PageState.ligas = await getLigasByPais(PageState.paisId);

        // Para cada liga, contar quantos clubes tem
        // Isto é feito em paralelo para ser mais rápido
        await loadLigaClubesCount();

        // Renderizar ligas
        renderLigas();
    } catch (error) {
        console.error('Erro ao carregar ligas:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar ligas</p>
                <button onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
        showNotification('Erro ao carregar ligas', 'error');
    } finally {
        PageState.isLoading = false;
    }
}

/**
 * Carregar contagem de clubes para cada liga
 */
async function loadLigaClubesCount() {
    // Array para guardar promessas
    const promises = PageState.ligas.map(async (liga) => {
        // Obter clubes da liga
        const clubes = await getClubesByLiga(liga.id);

        // Guardar contagem
        liga.clubesCount = clubes.length;
    });

    // Executar todas as promessas em paralelo
    await Promise.all(promises);
}

/**
 * ============================================================================
 * ATUALIZAR UI
 * ============================================================================
 */

/**
 * Atualizar título da página
 */
function updatePageTitle() {
    const titleElement = document.getElementById('page-title');
    const subtitleElement = document.getElementById('page-subtitle');

    if (titleElement && PageState.paisAtual) {
        titleElement.textContent = `Ligas de ${PageState.paisAtual.nome}`;
    }

    if (subtitleElement && PageState.paisAtual) {
        subtitleElement.innerHTML = `${PageState.paisAtual.bandeira} ${PageState.paisAtual.nome}`;
    }

    // Atualizar título do documento (aba do navegador)
    document.title = `Ligas - ${PageState.paisAtual?.nome || 'País'} | FORA DO RADAR`;
}

/**
 * Atualizar breadcrumb
 */
function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');

    if (breadcrumb && PageState.paisAtual) {
        breadcrumb.innerHTML = `
            <a href="/index.html">Início</a>
            <span>/</span>
            <a href="/pages/paises.html">Países</a>
            <span>/</span>
            <span class="current">${PageState.paisAtual.nome}</span>
        `;
    }
}

/**
 * ============================================================================
 * RENDERIZAÇÃO
 * ============================================================================
 */

/**
 * Renderizar lista de ligas
 */
function renderLigas() {
    const container = document.getElementById('ligas-grid');
    if (!container) return;

    // Verificar se há ligas
    if (PageState.ligas.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>Este país ainda não tem ligas registadas</p>
                <a href="/pages/paises.html" class="btn-secondary">
                    Ver outros países
                </a>
            </div>
        `;
        return;
    }

    // Renderizar cada liga como um card
    let html = '';

    PageState.ligas.forEach(liga => {
        html += `
            <article class="liga-card" onclick="navigateToLiga(${liga.id})">
                <div class="liga-card-header">
                    <span class="liga-icon">🏆</span>
                    <span class="liga-clubes-count">${liga.clubesCount || 0} clubes</span>
                </div>
                <div class="liga-card-body">
                    <h3 class="liga-nome">${liga.nome}</h3>
                    <p class="liga-pais">
                        ${PageState.paisAtual?.bandeira} ${PageState.paisAtual?.nome}
                    </p>
                </div>
                <div class="liga-card-footer">
                    <span class="liga-cta">Ver clubes →</span>
                </div>
            </article>
        `;
    });

    container.innerHTML = html;
}

/**
 * Renderizar esqueletos de loading
 * @param {number} count - Quantidade
 * @returns {string} - HTML
 */
function renderLoadingSkeletons(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-card liga">
                <div class="skeleton header"></div>
                <div class="skeleton title"></div>
                <div class="skeleton subtitle"></div>
            </div>
        `;
    }
    return html;
}

/**
 * ============================================================================
 * NAVEGAÇÃO
 * ============================================================================
 */

/**
 * Navegar para página de clubes da liga
 * @param {number} ligaId - ID da liga
 */
function navigateToLiga(ligaId) {
    window.location.href = `/pages/clubes.html?liga=${ligaId}`;
}

// Expor função globalmente
window.navigateToLiga = navigateToLiga;

/**
 * ============================================================================
 * ERROS
 * ============================================================================
 */

/**
 * Mostrar erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    const container = document.getElementById('ligas-grid');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <a href="/pages/paises.html" class="btn-secondary">
                    Ver países disponíveis
                </a>
            </div>
        `;
    }
}