/**
 * ============================================================================
 * FORA DO RADAR - Gestão de Clubes (Lista)
 * ============================================================================
 *
 * Este ficheiro gerencia a listagem de clubes de uma liga.
 * Mostra todos os clubes com informações resumidas.
 *
 * ============================================================================
 */

// Importar funções do Supabase
import {
    supabase,
    getClubesByLiga,
    getLigas,
    getPaises
} from './supabase.js';
import { showNotification } from './main.js';

/**
 * ============================================================================
 * ESTADO DA PÁGINA
 * ============================================================================
 */
const PageState = {
    // ID da liga atual (do URL)
    ligaId: null,

    // Informações da liga atual
    ligaAtual: null,

    // Informações do país da liga
    paisAtual: null,

    // Lista de clubes
    clubes: [],

    // Se está a carregar
    isLoading: false
};

/**
 * ============================================================================
 * INICIALIZAÇÃO
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('⚽ Página de clubes inicializada');

    // Obter ID da liga do URL
    PageState.ligaId = getLigaIdFromUrl();

    // Se não houver liga, mostrar erro
    if (!PageState.ligaId) {
        showError('Nenhuma liga especificada');
        return;
    }

    // Carregar informações da liga
    await loadLigaInfo();

    // Carregar clubes
    await loadClubes();
});

/**
 * ============================================================================
 * URL
 * ============================================================================
 */

/**
 * Obter ID da liga do URL
 * @returns {number|null} - ID da liga ou null
 */
function getLigaIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const ligaId = urlParams.get('liga');

    if (ligaId) {
        return parseInt(ligaId);
    }

    return null;
}

/**
 * ============================================================================
 * CARREGAR DADOS
 * ============================================================================
 */

/**
 * Carregar informações da liga e país
 */
async function loadLigaInfo() {
    try {
        // Obter informações da liga pelo ID
        // Como não temos função específica, usamos SQL direto
        const { data, error } = await supabase
            .from('ligas')
            .select(`
                *,
                paises:pais_id (*)
            `)
            .eq('id', PageState.ligaId)
            .single();

        if (error) {
            console.error('Erro ao carregar liga:', error);
            return;
        }

        PageState.ligaAtual = data;
        PageState.paisAtual = data.paises;

        // Atualizar UI
        updatePageTitle();
        updateBreadcrumb();
    } catch (error) {
        console.error('Erro inesperado:', error);
    }
}

/**
 * Carregar clubes da liga
 */
async function loadClubes() {
    if (PageState.isLoading) return;

    PageState.isLoading = true;
    const container = document.getElementById('clubes-grid');

    if (!container) {
        PageState.isLoading = false;
        return;
    }

    // Mostrar loading
    container.innerHTML = renderLoadingSkeletons(8);

    try {
        // Carregar clubes
        PageState.clubes = await getClubesByLiga(PageState.ligaId);

        // Renderizar
        renderClubes();
    } catch (error) {
        console.error('Erro ao carregar clubes:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar clubes</p>
                <button onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
        showNotification('Erro ao carregar clubes', 'error');
    } finally {
        PageState.isLoading = false;
    }
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

    if (titleElement && PageState.ligaAtual) {
        titleElement.textContent = PageState.ligaAtual.nome;
    }

    if (subtitleElement && PageState.paisAtual) {
        subtitleElement.innerHTML = `${PageState.paisAtual.bandeira} ${PageState.paisAtual.nome}`;
    }

    // Título do documento
    document.title = `${PageState.ligaAtual?.nome || 'Liga'} | FORA DO RADAR`;
}

/**
 * Atualizar breadcrumb
 */
function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');

    if (breadcrumb && PageState.ligaAtual && PageState.paisAtual) {
        breadcrumb.innerHTML = `
            <a href="/index.html">Início</a>
            <span>/</span>
            <a href="/pages/paises.html">Países</a>
            <span>/</span>
            <a href="/pages/ligas.html?pais=${PageState.paisAtual.id}">
                ${PageState.paisAtual.nome}
            </a>
            <span>/</span>
            <span class="current">${PageState.ligaAtual.nome}</span>
        `;
    }
}

/**
 * ============================================================================
 * RENDERIZAÇÃO
 * ============================================================================
 */

/**
 * Renderizar lista de clubes
 */
function renderClubes() {
    const container = document.getElementById('clubes-grid');
    if (!container) return;

    // Verificar se há clubes
    if (PageState.clubes.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>Esta liga ainda não tem clubes registados</p>
                <a href="/pages/paises.html" class="btn-secondary">
                    Ver outros países
                </a>
            </div>
        `;
        return;
    }

    // Renderizar cada clube
    let html = '';

    PageState.clubes.forEach(clube => {
        html += `
            <article class="clube-card" onclick="navigateToClube(${clube.id})">
                <div class="clube-emblem">
                    ${clube.escudo || '⚽'}
                </div>
                <div class="clube-info">
                    <h3 class="clube-nome">${clube.nome}</h3>
                    <p class="clube-cidade">📍 ${clube.cidade || 'Cidade desconhecida'}</p>
                    <p class="clube-fundacao">Fundado em ${clube.fundacao || '?'}</p>
                </div>
                <div class="clube-cta">
                    <span>Ver detalhes →</span>
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
            <div class="skeleton-card clube">
                <div class="skeleton emblem"></div>
                <div class="skeleton title"></div>
                <div class="skeleton text"></div>
                <div class="skeleton text short"></div>
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
 * Navegar para página do clube
 * @param {number} clubeId - ID do clube
 */
function navigateToClube(clubeId) {
    window.location.href = `/pages/clube.html?id=${clubeId}`;
}

// Expor globalmente
window.navigateToClube = navigateToClube;

/**
 * ============================================================================
 * ERROS
 * ============================================================================
 */

/**
 * Mostrar erro
 * @param {string} message - Mensagem
 */
function showError(message) {
    const container = document.getElementById('clubes-grid');
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