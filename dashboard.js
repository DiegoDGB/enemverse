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
            const resposta = await fetch('https://enemverse-api.onrender.com/api/auth/perfil', {
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

        // Elementos do HTML
        const topNavWelcome = document.getElementById('topNavWelcome');
        const sidebarNome = document.getElementById('sidebarNome');
        const dashStreak = document.getElementById('dashStreak');
        const dashXP = document.getElementById('dashXP');
        const userTier = document.getElementById('userTier');

        // Injeção do Nome
        if (topNavWelcome) {
            topNavWelcome.innerText = usuario.nome || 'Estudante';
        }
        if (sidebarNome) {
            sidebarNome.innerText = usuario.nome || 'Estudante';
        }

        // Injeção da Ofensiva
        const ofensiva = Number(usuario.ofensiva || 0);
        if (dashStreak) {
            dashStreak.innerText = `${ofensiva} ${ofensiva === 1 ? 'Dia' : 'Dias'}`;
        }

        // Injeção do XP
        const xp = Number(usuario.xp || 0);
        if (dashXP) {
            dashXP.innerText = xp.toLocaleString('pt-BR');
        }

        // Injeção do Nível / Patente
        if (userTier) {
            userTier.innerText = calcularPatenteUsuario(xp);
        }

        // Cálculo da Meta Diária (15 XP por questão)
        const totalQuestoesRespondidas = Math.floor(xp / 15);
        let questoesConcluidasHoje = totalQuestoesRespondidas % 10;

        if (questoesConcluidasHoje === 0 && totalQuestoesRespondidas > 0) {
            questoesConcluidasHoje = 10;
        }

        // Porcentagem da Meta
        const porcentagemMeta = Math.min((questoesConcluidasHoje / 10) * 100, 100);

        // Elementos de Meta do HTML
        const goalPercent = document.getElementById('goalPercent');
        const goalCounter = document.getElementById('goalCounter');
        const goalBarFill = document.getElementById('goalBarFill');

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
    // 5. CARD DO SIMULADO (Redirecionamento)
    // ============================================================
    const cardSimulado = document.getElementById('cardSimulado');
    if (cardSimulado) {
        cardSimulado.addEventListener('click', () => {
            window.location.href = 'simulado.html';
        });
    }

    // ============================================================
    // 6. CARD DO RANKING (Redirecionamento)
    // ============================================================
    const cardRanking = document.getElementById('cardRanking');
    if (cardRanking) {
        cardRanking.addEventListener('click', () => {
            window.location.href = 'ranking.html';
        });
    }

    // ============================================================
    // 7. LOGOUT (Limpeza da Sessão)
    // ============================================================
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('enemverse_token');
            localStorage.removeItem('enemverse_email_ativo');
            window.location.href = 'login.html';
        });
    }
});
