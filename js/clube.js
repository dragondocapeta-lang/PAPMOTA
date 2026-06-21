/**
 * ============================================================================
 * FORA DO RADAR - Página Individual do Clube
 * ============================================================================
 *
 * Este ficheiro gerencia a página de detalhes de um clube.
 * Mostra todas as informações do clube de forma profissional.
 *
 * ============================================================================
 */

// Importar funções do Supabase
import { supabase, getClubeById } from './supabase.js';
import { showNotification } from './main.js';

/**
 * ============================================================================
 * ESTADO DA PÁGINA
 * ============================================================================
 */
const PageState = {
    // ID do clube (do URL)
    clubeId: null,

    // Dados do clube
    clube: null,

    // Liga do clube
    liga: null,

    // País do clube
    pais: null,

    // Se está a carregar
    isLoading: false
};

/**
 * ============================================================================
 * INICIALIZAÇÃO
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('⚽ Página do clube inicializada');

    // Obter ID do clube do URL
    PageState.clubeId = getClubeIdFromUrl();

    // Se não houver clube, mostrar erro
    if (!PageState.clubeId) {
        showError('Nenhum clube especificado');
        return;
    }

    // Carregar dados do clube
    await loadClube();
});

/**
 * ============================================================================
 * URL
 * ============================================================================
 */

/**
 * Obter ID do clube do URL
 * @returns {number|null} - ID do clube ou null
 */
function getClubeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const clubeId = urlParams.get('id');

    if (clubeId) {
        return parseInt(clubeId);
    }

    return null;
}

/**
 * ============================================================================
 * CARREGAR DADOS
 * ============================================================================
 */

/**
 * Carregar dados completos do clube
 */
async function loadClube() {
    if (PageState.isLoading) return;

    PageState.isLoading = true;
    const container = document.getElementById('clube-container');

    if (!container) {
        PageState.isLoading = false;
        return;
    }

    // Mostrar loading
    container.innerHTML = renderLoadingSkeleton();

    try {
        // Carregar clube pelo ID
        PageState.clube = await getClubeById(PageState.clubeId);

        // Se não encontrou o clube
        if (!PageState.clube) {
            showError('Clube não encontrado');
            return;
        }

        // Extrair liga e país
        PageState.liga = PageState.clube.ligas;
        PageState.pais = PageState.liga?.paises;

        // Atualizar título do documento
        document.title = `${PageState.clube.nome} | FORA DO RADAR`;

        // Renderizar página do clube
        renderClube();
        updateBreadcrumb();

    } catch (error) {
        console.error('Erro ao carregar clube:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar dados do clube</p>
                <button onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
        showNotification('Erro ao carregar clube', 'error');
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
 * Renderizar página completa do clube
 */
function renderClube() {
    const container = document.getElementById('clube-container');
    if (!container || !PageState.clube) return;

    const clube = PageState.clube;
    const liga = PageState.liga;
    const pais = PageState.pais;
    const conquistas = clube.conquistas || [];
    const camisolas = clube.camisolas || [];

    container.innerHTML = `
        <!-- 1. Escudo e nome do time -->
        <header class="clube-header">
            <div class="clube-emblem-large">
                ${renderEscudo(clube.escudo)}
            </div>
            <div class="clube-header-info">
                <h1 class="clube-nome-principal">${clube.nome}</h1>
                <p class="clube-localizacao">
                    ${pais?.bandeira || ''} ${pais?.nome || 'País desconhecido'} |
                    🏆 ${liga?.nome || 'Liga desconhecida'}
                </p>
            </div>
        </header>

        <!-- 3. Ano de fundação -->
        <section class="clube-fundacao">
            <span class="fundacao-icon">📅</span>
            <div class="fundacao-content">
                <span class="fundacao-label">Fundação</span>
                <span class="fundacao-value">${clube.fundacao || 'Ano desconhecido'}</span>
            </div>
        </section>

        <!-- 2. Estádio com nome e foto -->
        <section class="clube-estadio">
            <h2>🏟️ Estádio</h2>
            <div class="estadio-card">
                ${clube.estadio_foto
                    ? `<img src="${clube.estadio_foto}" alt="Estádio ${clube.estadio || ''}" class="estadio-foto" loading="lazy">`
                    : `<div class="estadio-foto-placeholder">🏟️</div>`
                }
                <div class="estadio-info">
                    <h3 class="estadio-nome">${clube.estadio || 'Estádio desconhecido'}</h3>
                    <p class="estadio-cidade">📍 ${clube.cidade || 'Cidade desconhecida'}</p>
                </div>
            </div>
        </section>

        <!-- 4. Conquistas -->
        <section class="clube-conquistas">
            <h2>🏆 Conquistas</h2>
            ${conquistas.length > 0
                ? `<ul class="conquistas-lista">
                    ${conquistas.map(c => `
                        <li class="conquista-item">
                            <span class="conquista-ano">${c.ano || '—'}</span>
                            <div class="conquista-info">
                                <strong>${c.titulo}</strong>
                                ${c.descricao ? `<p>${c.descricao}</p>` : ''}
                            </div>
                        </li>
                    `).join('')}
                   </ul>`
                : `<p class="sem-dados">Ainda não há conquistas registadas para este clube.</p>`
            }
        </section>

        <!-- 5. Camisolas -->
        <section class="clube-camisolas">
            <h2>👕 Camisolas</h2>
            ${camisolas.length > 0
                ? `<div class="camisolas-grid">
                    ${camisolas.map(c => `
                        <div class="camisola-card">
                            ${c.imagem
                                ? `<img src="${c.imagem}" alt="Camisola ${c.tipo} ${c.temporada || ''}" loading="lazy">`
                                : `<div class="camisola-placeholder">👕</div>`
                            }
                            <div class="camisola-info">
                                <span class="camisola-tipo">${formatarTipoCamisola(c.tipo)}</span>
                                ${c.temporada ? `<span class="camisola-temporada">${c.temporada}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                   </div>`
                : `<p class="sem-dados">Ainda não há camisolas registadas para este clube.</p>`
            }
        </section>

        <!-- Descrição -->
        <section class="clube-descricao">
            <h2>Sobre o Clube</h2>
            <p class="descricao-texto">
                ${clube.descricao || 'Este clube ainda não tem descrição disponível.'}
            </p>
        </section>

        <!-- Navegação -->
        <section class="clube-nav">
            <a href="/pages/clubes.html?liga=${liga?.id}" class="btn-secondary">
                ← Ver outros clubes da ${liga?.nome || 'liga'}
            </a>
            <a href="/pages/paises.html" class="btn-secondary">
                Explorar mais países →
            </a>
        </section>
    `;
}

/**
 * Renderizar escudo (imagem ou emoji)
 */
function renderEscudo(escudo) {
    if (!escudo) return '⚽';
    if (escudo.startsWith('http')) {
        return `<img src="${escudo}" alt="Escudo" class="clube-escudo-img">`;
    }
    return escudo;
}

/**
 * Formatar tipo de camisola
 */
function formatarTipoCamisola(tipo) {
    const map = {
        principal: 'Principal',
        alternativa: 'Alternativa',
        terceira: 'Terceira',
        guarda_redes: 'Guarda-redes'
    };
    return map[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

/**
 * Atualizar breadcrumb
 */
function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');

    if (breadcrumb && PageState.clube && PageState.liga && PageState.pais) {
        breadcrumb.innerHTML = `
            <a href="/index.html">Início</a>
            <span>/</span>
            <a href="/pages/paises.html">Países</a>
            <span>/</span>
            <a href="/pages/ligas.html?pais=${PageState.pais.id}">
                ${PageState.pais.nome}
            </a>
            <span>/</span>
            <a href="/pages/clubes.html?liga=${PageState.liga.id}">
                ${PageState.liga.nome}
            </a>
            <span>/</span>
            <span class="current">${PageState.clube.nome}</span>
        `;
    }
}

/**
 * Renderizar esqueleto de loading
 * @returns {string} - HTML
 */
function renderLoadingSkeleton() {
    return `
        <div class="skeleton-loader">
            <div class="skeleton clube-header">
                <div class="skeleton emblem-large"></div>
                <div class="skeleton title-large"></div>
                <div class="skeleton subtitle"></div>
            </div>
            <div class="skeleton detalhes-grid">
                ${Array(5).fill('<div class="skeleton detalhe-item"></div>').join('')}
            </div>
            <div class="skeleton descricao">
                <div class="skeleton text"></div>
                <div class="skeleton text"></div>
                <div class="skeleton text short"></div>
            </div>
        </div>
    `;
}

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
    const container = document.getElementById('clube-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message large">
                <span class="error-icon">😕</span>
                <p>${message}</p>
                <a href="/pages/paises.html" class="btn-primary">
                    Ver países disponíveis
                </a>
            </div>
        `;
    }
}