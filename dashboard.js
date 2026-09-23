const API_BASE_URL = window.location.hostname === 'enemverse.vercel.app'
    ? 'https://enemverse-api.onrender.com'
    : 'https://enemverse-api-dev.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {

    // ============================================================
    // 1. VERIFICAÇÃO DA SESSÃO
    // ============================================================
    const tokenAtivo = localStorage.getItem('enemverse_token');

    if (!tokenAtivo) {
        window.location.href = 'login.html';
        return;
    }

    // ============================================================
    // 2. BUSCAR DADOS DO USUÁRIO NO BACK-END
    // ============================================================
    async function buscarDadosUsuarioBanco() {
        try {
            const resposta = await fetch(`${API_BASE_URL}/api/auth/perfil`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAtivo}`
                }
            });

            const dados = await resposta.json();
            console.log('Resposta da API:', dados);

            if (!resposta.ok) {
                throw new Error(dados.erro || 'Falha ao buscar perfil do usuário.');
            }

            return dados;
        } catch (erro) {
            console.error('Erro na requisição de perfil:', erro);
            return null;
        }
    }

    // ============================================================
    // 3. CÁLCULO DA PATENTE
    // ============================================================
    function calcularPatenteUsuario(xpTotal) {
        const nivelCalculado = Math.floor(xpTotal / 300) + 1;
        let rankNome = 'Aspirante';

        if (nivelCalculado >= 10) {
            rankNome = 'Mestre Supremo';
        } else if (nivelCalculado >= 7) {
            rankNome = 'Especialista Federal';
        } else if (nivelCalculado >= 4) {
            rankNome = 'Veterano das Bancas';
        } else if (nivelCalculado >= 2) {
            rankNome = 'Guerreiro Estudantil';
        }

        return `Nível ${nivelCalculado} • ${rankNome}`;
    }

    // ============================================================
    // 4. SINCRONIZAÇÃO DO PAINEL
    // ============================================================
    try {
        const usuario = await buscarDadosUsuarioBanco();

        if (!usuario) {
            alert('Erro de sincronização da conta. Faça login novamente.');
            localStorage.removeItem('enemverse_token');
            localStorage.removeItem('enemverse_email_ativo');
            window.location.href = 'login.html';
            return;
        }

        console.log('Usuário carregado com sucesso:', usuario);

        // ========================================================
        // CAPTURA DOS ELEMENTOS CORRIGIDOS DO HTML (Alinhados com a árvore de nós)
        // ========================================================
        const topNavWelcome = document.getElementById('topNavWelcome'); // Boas-vindas na barra do topo
        const sidebarNome = document.getElementById('sidebarNome') || document.querySelector('.auth-card h3') || document.querySelector('h3'); // Nome no Bloco de Perfil
        const dashStreak = document.getElementById('dashStreak') || document.querySelector('.auth-card p:nth-of-type(1)'); // Ofensiva
        const dashXP = document.getElementById('dashXP') || document.querySelector('.auth-card p:nth-of-type(2)'); // XP Total
        const userTier = document.getElementById('userTier') || document.querySelector('.auth-card h3 + p') || document.querySelector('p'); // Nível / Patente

        // Elementos de Meta do HTML
        const goalPercent = document.getElementById('goalPercent') || document.querySelector('.meta-diaria span'); // Porcentagem de Texto
        const goalCounter = document.getElementById('goalCounter') || document.querySelector('.meta-diaria p:last-of-type'); // Texto descritivo de progresso
        const goalBarFill = document.getElementById('goalBarFill') || document.querySelector('.progress-bar-fill') || document.querySelector('.meta-diaria div div'); // Barra visual

        // ========================================================
        // INJEÇÃO SEGURA DOS DADOS DENTRO DAS TAGS
        // ========================================================
        
        // Nome do Estudante
        if (topNavWelcome) {
            topNavWelcome.innerText = usuario.nome || 'Estudante';
        }
        if (sidebarNome) {
            sidebarNome.innerText = usuario.nome || 'Estudante';
        }

        // Ofensiva formatada (Exemplo: "5 Dias Ofensiva" ou "5 Dias")
        const ofensiva = Number(usuario.ofensiva || 0);
        if (dashStreak) {
            dashStreak.innerText = `🔥 ${ofensiva} ${ofensiva === 1 ? 'Dia Ofensiva' : 'Dias Ofensiva'}`;
        }

        // Pontuação de XP formatada com pontos (Exemplo: "1.240 XP Total")
        const xp = Number(usuario.xp || 0);
        if (dashXP) {
            dashXP.innerText = `⚡ ${xp.toLocaleString('pt-BR')} XP Total`;
        }

        // Patente e Nível calculados
        if (userTier) {
            userTier.innerText = calcularPatenteUsuario(xp);
        }

        // Cálculo dinâmico da Meta Diária (Baseado na média de 15 XP por questão respondida)
        const totalQuestoesRespondidas = Math.floor(xp / 15);
        let questoesConcluidasHoje = totalQuestoesRespondidas % 10;

        if (questoesConcluidasHoje === 0 && totalQuestoesRespondidas > 0) {
            questoesConcluidasHoje = 10;
        }

        // Porcentagem exata da meta concluída hoje
        const porcentagemMeta = Math.min((questoesConcluidasHoje / 10) * 100, 100);

        // Injeção visual na barra e contadores da Meta Diária
        if (goalPercent) {
            goalPercent.innerText = `${Math.floor(porcentagemMeta)}%`;
        }
        if (goalCounter) {
            goalCounter.innerText = `${questoesConcluidasHoje} de 10 concluídas`;
        }
        if (goalBarFill) {
            goalBarFill.style.width = `${porcentagemMeta}%`;
        }

    } catch (erro) {
        console.error('Erro ao sincronizar painel com o back-end:', erro);
        const sidebarNome = document.getElementById('sidebarNome');
        if (sidebarNome) {
            sidebarNome.innerText = 'Erro ao carregar dados';
        }
    }

    // ============================================================
    // 5. REDIRECIONAMENTO DE CLIQUE: SIMULADO
    // ============================================================
    const cardSimulado = document.getElementById('cardSimulado') || document.querySelector('.atividades-grid div:nth-child(1)');
    if (cardSimulado) {
        cardSimulado.style.cursor = 'pointer';
        cardSimulado.addEventListener('click', () => {
            window.location.href = 'simulado.html';
        });
    }

    // ============================================================
    // 6. REDIRECIONAMENTO DE CLIQUE: RANKING (LEADERBOARD)
    // ============================================================
    const cardRanking = document.getElementById('cardRanking') || document.querySelector('.atividades-grid div:nth-child(2)');
    if (cardRanking) {
        cardRanking.style.cursor = 'pointer';
        cardRanking.addEventListener('click', () => {
            window.location.href = 'ranking.html';
        });
    }

    // ============================================================
    // 7. LOGOUT (Limpeza segura da sessão)
    // ============================================================
    const btnLogout = document.getElementById('btnLogout') || document.querySelector('a[href="login.html"]') || document.querySelector('.logout-btn');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('enemverse_token');
            localStorage.removeItem('enemverse_email_ativo');
            window.location.href = 'login.html';
        });
    }
});
