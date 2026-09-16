/**
 * ENEMVerse - Módulo de Banco de Dados Real (IndexedDB)
 * Configuração: XP Inicial = 0 | Ofensiva Inicial = 0
 */

const DB_NAME = 'EnemVerseDB';
const DB_VERSION = 1;

// Função para abrir a conexão com o banco de dados do navegador
function abrirBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Cria a estrutura do banco se for a primeira vez rodando
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('usuarios')) {
                // Cria a tabela 'usuarios' usando o e-mail como chave primária única
                db.createObjectStore('usuarios', { keyPath: 'email' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// CADASTRO REAL: Salva o usuário no banco se o e-mail não existir (XP e Ofensiva começam zerados)
async function cadastrarUsuarioBanco(nome, email, senha) {
    const db = await abrirBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');

        // Verifica primeiro se o e-mail já existe na tabela
        const consulta = store.get(email);

        consulta.onsuccess = () => {
            if (consulta.result) {
                reject('Este e-mail já está cadastrado no sistema.');
            } else {
                // Monta o novo usuário rigorosamente com XP e Ofensiva em 0
                const novoUsuario = {
                    nome: nome,
                    email: email,
                    senha: senha,
                    xp: 0,         // Começa no zero absoluto!
                    ofensiva: 0    // Começa no zero absoluto!
                };
                
                const insere = store.add(novoUsuario);
                insere.onsuccess = () => resolve(novoUsuario);
                insere.onerror = () => reject('Erro ao gravar dados no banco.');
            }
        };
    });
}

// CONFIRMAÇÃO DE LOGIN: Busca o e-mail na tabela e valida as credenciais
async function autenticarUsuarioBanco(email, senha) {
    const db = await abrirBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        
        const consulta = store.get(email);

        consulta.onsuccess = () => {
            const usuario = consulta.result;
            if (!usuario) {
                reject('E-mail não encontrado ou usuário inexistente.');
            } else if (usuario.senha !== senha) {
                reject('Senha incorreta.');
            } else {
                resolve(usuario); // Retorna o perfil confirmado com seus pontos reais do banco
            }
        };
        
        consulta.onerror = () => reject('Erro ao acessar a tabela de dados.');
    });
}

// ATUALIZAÇÃO DE EXP: Atualiza os pontos de XP do usuário logado na tabela
async function atualizarXPUsuarioBanco(email, novoXP) {
    const db = await abrirBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');

        const consulta = store.get(email);

        consulta.onsuccess = () => {
            const usuario = consulta.result;
            if (usuario) {
                usuario.xp = novoXP; // Insere a nova pontuação ganha no simulado
                
                const atualiza = store.put(usuario);
                atualiza.onsuccess = () => resolve(usuario);
                atualiza.onerror = () => reject('Erro ao atualizar o XP no banco.');
            } else {
                reject('Usuário não identificado.');
            }
        };
    });
}
// ATUALIZAÇÃO DE OFENSIVA: Calcula e gerencia os dias seguidos de estudo
async function atualizarOfensivaUsuarioBanco(email) {
    const db = await abrirBanco();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');

        const consulta = store.get(email);

        consulta.onsuccess = () => {
            const usuario = consulta.result;
            if (usuario) {
                // Captura a data de hoje (considerando apenas Ano, Mês e Dia)
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                // Se for o primeiro acesso após o cadastro, cria o registro de data
                if (!usuario.ultimo_acesso) {
                    usuario.ofensiva = 1;
                    usuario.ultimo_acesso = hoje.getTime();
                } else {
                    const dataUltimoAcesso = new Date(usuario.ultimo_acesso);
                    dataUltimoAcesso.setHours(0, 0, 0, 0);

                    // Calcula a diferença em dias entre hoje e o último acesso
                    const diferencaTempo = hoje.getTime() - dataUltimoAcesso.getTime();
                    const diferencaDias = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

                    if (diferencaDias === 1) {
                        // REGRA 1: Entrou no dia seguinte exato -> Soma +1 dia de ofensiva
                        usuario.ofensiva += 1;
                        usuario.ultimo_acesso = hoje.getTime();
                    } else if (diferencaDias > 1) {
                        // REGRA 2: Ficou mais de um dia sem entrar -> Quebrou a ofensiva (Reseta para 1)
                        usuario.ofensiva = 1;
                        usuario.ultimo_acesso = hoje.getTime();
                    }
                    // Se diferencaDias === 0, ele já entrou hoje, então não fazemos nada para não somar duplicado
                }

                // Grava a atualização por cima do registro antigo
                const atualiza = store.put(usuario);
                atualiza.onsuccess = () => resolve(usuario);
                atualiza.onerror = () => reject('Erro ao atualizar a ofensiva.');
            } else {
                reject('Usuário não encontrado.');
            }
        };
    });
}
