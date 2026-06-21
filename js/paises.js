/**
 * ============================================================================
 * FORA DO RADAR - Gestão de Países
 * ============================================================================
 *
 * Este ficheiro gerencia a listagem e exibição de países.
 * Os países são carregados da base de dados Supabase.
 *
 * Funcionalidades:
 * - Listar países por continente
 * - Filtrar países
 * - Navegar para ligas ao clicar
 *
 * ============================================================================
 */

// Importar funções do Supabase
import { supabase, getContinentes, getPaises, sanitizeInput } from './supabase.js';
import { showNotification } from './main.js';

/**
 * ============================================================================
 * ESTADO DA PÁGINA
 * ============================================================================
 */
const PageState = {
    // Lista de países carregados
    paises: [],

    // Lista de continentes para filtro
    continentes: [],

    // Continente atualmente selecionado (null = todos)
    continenteSelecionado: null,

    // Se está a carregar dados
    isLoading: false
};

/**
 * ============================================================================
 * INICIALIZAÇÃO
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌍 Página de países inicializada');

    // Carregar continentes para o filtro
    await loadContinentes();

    // Carregar países
    await loadPaises();

    // Inicializar filtros
    initFilters();
});

/**
 * ============================================================================
 * CARREGAR DADOS DO SUPABASE
 * ============================================================================
 */

/**
 * Carregar continentes para o filtro
 */
async function loadContinentes() {
    try {
        PageState.continentes = await getContinentes();

        // Renderizar opções de filtro
        renderContinenteFilter();
    } catch (error) {
        console.error('Erro ao carregar continentes:', error);
        showNotification('Erro ao carregar continentes', 'error');
    }
}

/**
 * Carregar países do Supabase
 */
async function loadPaises() {
    // Evitar carregar se já está a carregar
    if (PageState.isLoading) return;

    PageState.isLoading = true;
    const container = document.getElementById('paises-grid');

    if (!container) {
        PageState.isLoading = false;
        return;
    }

    // Mostrar loading
    container.innerHTML = renderLoadingSkeletons(12);

    try {
        // Carregar países do Supabase
        // Se houver continente selecionado, filtrar por ele
        PageState.paises = await getPaises(PageState.continenteSelecionado);

        // Renderizar países
        renderPaises();
    } catch (error) {
        console.error('Erro ao carregar países:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar países</p>
                <button onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
        showNotification('Erro ao carregar países', 'error');
    } finally {
        PageState.isLoading = false;
    }
}

/**
 * ============================================================================
 * RENDERIZAÇÃO
 * ============================================================================
 */

/**
 * Renderizar opções de filtro de continente
 */
function renderContinenteFilter() {
    const filterContainer = document.getElementById('continente-filter');
    if (!filterContainer) return;

    // Criar HTML dos botões de filtro
    let html = `
        <button class="filter-btn ${PageState.continenteSelecionado === null ? 'active' : ''}"
                data-continente="">
            Todos
        </button>
    `;

    // Adicionar botão para cada continente
    PageState.continentes.forEach(continente => {
        html += `
            <button class="filter-btn ${PageState.continenteSelecionado === continente.id ? 'active' : ''}"
                    data-continente="${continente.id}">
                ${continente.nome}
            </button>
        `;
    });

    filterContainer.innerHTML = html;
}

/**
 * Renderizar lista de países
 */
function renderPaises() {
    const container = document.getElementById('paises-grid');
    if (!container) return;

    // Verificar se há países
    if (PageState.paises.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>Nenhum país encontrado</p>
            </div>
        `;
        return;
    }

    // Renderizar cada país como um card
    let html = '';

    PageState.paises.forEach(pais => {
        // Obter nome do continente
        // Nota: os dados vêm com join do continente
        const continenteNome = pais.continentes?.nome || 'Desconhecido';

        html += `
            <article class="pais-card" onclick="navigateToPais(${pais.id})">
                <div class="pais-card-header">
                    <span class="pais-bandeira">${pais.bandeira || '🌍'}</span>
                </div>
                <div class="pais-card-body">
                    <h3 class="pais-nome">${pais.nome}</h3>
                    <p class="pais-continente">${continenteNome}</p>
                </div>
                <div class="pais-card-footer">
                    <span class="pais-cta">Ver ligas →</span>
                </div>
            </article>
        `;
    });

    container.innerHTML = html;
}

/**
 * Renderizar esqueletos de loading
 * @param {number} count - Quantidade de esqueletos
 * @returns {string} - HTML dos esqueletos
 */
function renderLoadingSkeletons(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-card">
                <div class="skeleton flag"></div>
                <div class="skeleton title"></div>
                <div class="skeleton subtitle"></div>
            </div>
        `;
    }
    return html;
}

/**
 * ============================================================================
 * FILTROS
 * ============================================================================
 */

/**
 * Inicializar filtros
 */
function initFilters() {
    const filterContainer = document.getElementById('continente-filter');
    if (!filterContainer) return;

    // Evento de clique nos botões de filtro
    filterContainer.addEventListener('click', async (e) => {
        // Verificar se clicou num botão
        if (e.target.classList.contains('filter-btn')) {
            // Obter valor do continente
            const continenteId = e.target.dataset.continente;

            // Atualizar estado
            PageState.continenteSelecionado = continenteId ? parseInt(continenteId) : null;

            // Atualizar UI dos botões
            filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Recarregar países com o filtro
            await loadPaises();
        }
    });
}

/**
 * ============================================================================
 * NAVEGAÇÃO
 * ============================================================================
 */

/**
 * Navegar para página de ligas do país
 * @param {number} paisId - ID do país
 */
function navigateToPais(paisId) {
    window.location.href = `/pages/ligas.html?pais=${paisId}`;
}

// Expor função globalmente
window.navigateToPais = navigateToPais;
