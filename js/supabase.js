/**
 * ============================================================================
 * FORA DO RADAR - Configuração do Supabase
 * ============================================================================
 *
 * Este ficheiro configura a ligação com o Supabase.
 * O Supabase é uma plataforma de backend que fornece:
 * - Base de dados PostgreSQL
 * - Autenticação de utilizadores
 * - APIs automáticas
 *
 * IMPORTANTE: As credenciais já estão configuradas no ambiente.
 * ============================================================================
 */

// Importar a biblioteca do Supabase
// Esta biblioteca permite comunicar com o servidor Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/**
 * ============================================================================
 * CONFIGURAÇÃO DO SUPABASE
 * ============================================================================
 *
 * As credenciais são carregadas das variáveis de ambiente.
 * Estas variáveis são injectadas automaticamente pelo sistema.
 */

// URL do projeto Supabase
// Pode ser sobrescrita via variável de ambiente VITE_SUPABASE_URL
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://ikqyrnytoutiojgyqzli.supabase.co';

// Chave pública (anon key)
// Esta chave é segura para usar no frontend (navegador)
// Pode ser sobrescrita via variável de ambiente VITE_SUPABASE_ANON_KEY
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcXlybnl0b3V0aW9qZ3lxemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzcyMDAsImV4cCI6MjA5NzYxMzIwMH0.LZeqvYVgQyrFeJcb98V0VxjPdNwKIR7025GTJHqTBTU';

/**
 * ============================================================================
 * CLIENTE SUPABASE
 * ============================================================================
 *
 * Criamos uma instância do cliente Supabase.
 * Este cliente será usado em todos os outros ficheiros JavaScript
 * para comunicar com a base de dados.
 */

// Criar e exportar o cliente Supabase
// O parâmetro 'auth' configura a persistência da sessão
// 'storage' usa o localStorage para manter o utilizador logado
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // Persistir a sessão no localStorage do navegador
        // Isto mantém o utilizador logado mesmo após fechar o navegador
        persistSession: true,

        // Usar localStorage para guardar a sessão
        // Alternativa: sessionStorage (apenas dura até fechar o navegador)
        storage: window.localStorage,

        // Detectar sessão automaticamente ao carregar a página
        autoRefreshToken: true,

        // Detetar sessão a partir do URL (útil para magic links)
        detectSessionInUrl: true
    }
});

/**
 * ============================================================================
 * FUNÇÕES UTILITÁRIAS
 * ============================================================================
 */

/**
 * Verificar se o utilizador está autenticado
 * @returns {Promise<Object|null>} - O utilizador atual ou null
 *
 * Esta função é útil para verificar se alguém está logado
 * antes de mostrar conteúdo protegido.
 */
export async function getCurrentUser() {
    try {
        // Obter a sessão atual do Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        // Se houver erro, devolver null
        if (error) {
            console.error('Erro ao obter sessão:', error.message);
            return null;
        }

        // Devolver o utilizador da sessão ou null
        return session?.user || null;
    } catch (error) {
        console.error('Erro inesperado:', error);
        return null;
    }
}

/**
 * Obter o perfil do utilizador atual
 * @returns {Promise<Object|null>} - O perfil do utilizador ou null
 *
 * Esta função consulta a tabela 'perfis' para obter
 * informações adicionais do utilizador.
 */
export async function getCurrentUserProfile() {
    try {
        // Primeiro, obter o utilizador atual
        const user = await getCurrentUser();

        // Se não houver utilizador, devolver null
        if (!user) {
            return null;
        }

        // Consultar a tabela perfis
        // Usamos o ID do utilizador para encontrar o perfil correto
        const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', user.id)
            .single(); // .single() espera exatamente um resultado

        if (error) {
            console.error('Erro ao obter perfil:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro inesperado:', error);
        return null;
    }
}

/**
 * ============================================================================
 * FUNÇÕES DE CONSULTA À BASE DE DADOS
 * ============================================================================
 */

/**
 * Obter todos os continentes
 * @returns {Promise<Array>} - Lista de continentes
 */
export async function getContinentes() {
    try {
        const { data, error } = await supabase
            .from('continentes')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao obter continentes:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro inesperado:', error);
        return [];
    }
}

/**
 * Obter todos os países
 * @param {number} continenteId - ID do continente (opcional)
 * @returns {Promise<Array>} - Lista de países
 */
export async function getPaises(continenteId = null) {
    try {
        // Criar a query base
        let query = supabase
            .from('paises')
            .select(`
                *,
                continentes:continente_id (nome)
            `)
            .order('nome', { ascending: true });

        // Se foi especificado um continente, filtrar por ele
        if (continenteId) {
            query = query.eq('continente_id', continenteId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao obter países:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro inesperado:', error);
        return [];
    }
}

/**
 * Obter ligas de um país
 * @param {number} paisId - ID do país
 * @returns {Promise<Array>} - Lista de ligas
 */
export async function getLigasByPais(paisId) {
    try {
        const { data, error } = await supabase
            .from('ligas')
            .select('*')
            .eq('pais_id', paisId)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao obter ligas:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro inesperado:', error);
        return [];
    }
}

/**
 * Obter clubes de uma liga
 * @param {number} ligaId - ID da liga
 * @returns {Promise<Array>} - Lista de clubes
 */
export async function getClubesByLiga(ligaId) {
    try {
        const { data, error } = await supabase
            .from('clubes')
            .select(`
                *,
                ligas:liga_id (nome, pais_id)
            `)
            .eq('liga_id', ligaId)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao obter clubes:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro inesperado:', error);
        return [];
    }
}

/**
 * Obter um clube específico por ID (com liga, país, conquistas e camisolas)
 * @param {number} clubeId - ID do clube
 * @returns {Promise<Object|null>} - O clube ou null
 */
export async function getClubeById(clubeId) {
    try {
        const { data, error } = await supabase
            .from('clubes')
            .select(`
                *,
                ligas:liga_id (
                    nome,
                    pais_id,
                    paises:pais_id (nome, bandeira)
                ),
                conquistas (*),
                camisolas (*)
            `)
            .eq('id', clubeId)
            .single();

        if (error) {
            console.error('Erro ao obter clube:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro inesperado:', error);
        return null;
    }
}

/**
 * Obter um clube aleatório
 * @returns {Promise<Object|null>} - Um clube aleatório ou null
 *
 * Esta função é usada na página inicial para mostrar
 * um clube diferente a cada visita.
 */
export async function getRandomClube() {
    try {
        // Primeiro, contar quantos clubes existem
        const { count, error: countError } = await supabase
            .from('clubes')
            .select('*', { count: 'exact', head: true });

        if (countError || count === 0) {
            console.error('Erro ao contar clubes:', countError?.message);
            return null;
        }

        // Obter todos os IDs dos clubes
        const { data: allClubes, error: idsError } = await supabase
            .from('clubes')
            .select('id');

        if (idsError || !allClubes || allClubes.length === 0) {
            return null;
        }

        // Escolher um ID aleatório
        const randomIndex = Math.floor(Math.random() * allClubes.length);
        const randomId = allClubes[randomIndex].id;

        // Obter os detalhes do clube escolhido
        const clube = await getClubeById(randomId);

        return clube;
    } catch (error) {
        console.error('Erro inesperado:', error);
        return null;
    }
}

/**
 * Pesquisar clubes por nome
 * @param {string} searchTerm - Termo de pesquisa
 * @returns {Promise<Array>} - Lista de clubes encontrados
 */
export async function searchClubes(searchTerm) {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const { data, error } = await supabase
            .from('clubes')
            .select(`
                *,
                ligas:liga_id (
                    nome,
                    pais_id,
                    paises:pais_id (nome, bandeira)
                )
            `)
            .ilike('nome', `%${searchTerm}%`)
            .limit(20);

        if (error) {
            console.error('Erro ao pesquisar clubes:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro inesperado:', error);
        return [];
    }
}

/**
 * Pesquisar países por nome
 * @param {string} searchTerm - Termo de pesquisa
 * @returns {Promise<Array>} - Lista de países encontrados
 */
export async function searchPaises(searchTerm) {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const { data, error } = await supabase
            .from('paises')
            .select(`
                *,
                continentes:continente_id (nome)
            `)
            .ilike('nome', `%${searchTerm}%`)
            .limit(20);

        if (error) {
            console.error('Erro ao pesquisar países:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro inesperado:', error);
        return [];
    }
}

/**
 * Pesquisar ligas por nome
 * @param {string} searchTerm - Termo de pesquisa
 * @returns {Promise<Array>} - Lista de ligas encontradas
 */
export async function searchLigas(searchTerm) {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const { data, error } = await supabase
            .from('ligas')
            .select(`
                *,
                paises:pais_id (nome, bandeira)
            `)
            .ilike('nome', `%${searchTerm}%`)
            .limit(20);

        if (error) {
            console.error('Erro ao pesquisar ligas:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erro inesperado:', error);
        return [];
    }
}

/**
 * Verificar se as credenciais do Supabase estão configuradas
 * @returns {boolean} - true se configurado, false caso contrário
 */
export function isSupabaseConfigured() {
    return SUPABASE_URL && SUPABASE_ANON_KEY &&
           SUPABASE_URL.startsWith('http');
}

// Exportar funções adicionais do Supabase auth para conveniência
export const {
    signInWithPassword,
    signUp,
    signOut,
    resetPassword,
    onAuthStateChange
} = supabase.auth;
