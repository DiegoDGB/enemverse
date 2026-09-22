document.addEventListener('DOMContentLoaded', async () => {
    // Recupera o token e o e-mail que foram salvos durante o login
    const tokenAtivo = localStorage.getItem('enemverse_token');
    const emailAtivo = localStorage.getItem('enemverse_email_ativo');

    // Se o usuário não tiver dados de sessão ativos, barra o acesso e joga para o login
    if (!tokenAtivo || !emailAtivo) {
        window.location.href = 'login.html';
        return;
    }

    // URL base da sua API no Render
    const API_URL = 'https://onrender.com';

    async function buscarDadosUsuarioBanco() {
        try {
            // Faz a requisição segura passando o Token JWT no cabeçalho de autorização (Evita o vazamento de dados antigo)
            const resposta = await fetch(`${API_URL}/auth/perfil?email=${emailAtivo}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAtivo}`
                }
            });

            if (!resposta.ok) {
                throw new Error('Falha na autenticação do token.');
            }

            return await resposta.json();
        } catch (erro) {
            console.error("Erro na requisição de perfil:", erro);
            return null;
        }
    }

    function calcularPatenteUsuario(xpTotal) {
        const nivelCalculado = Math.floor(xpTotal / 300) + 1;
        let rankNome = "Aspirante";

        if (nivelCalculado >= 10) rankNome = "Mestre Supremo";
        else if (nivelCalculado >= 7) rankNome = "Especialista Federal";
        else if (nivelCalculado >= 4) rankNome = "Veterano das Bancas";
        else if (nivelCalculado >= 2) rankNome = "Guerreiro Estudantil";

        return `Nível ${nivelCalculado} • ${rankNome}`;
    }

    try {
        // Busca os dados APENAS do usuário logado de forma totalmente blindada
        const usuario = await buscarDadosUsuarioBanco();

        if (!usuario) {
            alert('Erro de Sincronização de conta. Redirecionando para autenticação...');
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

        // Seleção dos elementos do HTML para injeção de dados dinâmicos
        const topNavWelcome = document.getElementById('topNavWelcome');
        const sidebarNome = document.getElementById('sidebarNome');
        const dashStreak = document.getElementById('dashStreak');
        const dashXP = document.getElementById('dashXP');
        const userTier = document.getElementById('userTier');

        if (topNavWelcome) topNavWelcome.innerText = usuario.nome;
        if (sidebarNome) sidebarNome.innerText = usuario.nome;
        if (dashStreak) dashStreak.innerText = `${usuario.ofensiva} ${usuario.ofensiva === 1 ? 'Dia' : 'Dias'}`;
        if (dashXP) dashXP.innerText = usuario.xp.toLocaleString();
        if (userTier) userTier.innerText = calcularPatenteUsuario(usuario.xp);

        // Ajuste no cálculo da meta diária usando o progresso real de XP
        // (Garante estabilidade mesmo se o estudante ganhar 10 XP por estourar o tempo)
        const totalQuestoesRespondidas = Math.floor(usuario.xp / 15); // Média ponderada aproximada
        let questoesConcluidasHoje = totalQuestoesRespondidas % 10;
        
        if (questoesConcluidasHoje === 0 && totalQuestoesRespondidas > 0) {
            questoesConcluidasHoje = 10;
        }

        const porcentagemMeta = Math.min((questoesConcluidasHoje / 10) * 100, 100);

        const goalPercent = document.getElementById('goalPercent');
        const goalCounter = document.getElementById('goalCounter');
        const goalBarFill = document.getElementById('goalBarFill');

        if (goalPercent) goalPercent.innerText = `${Math.floor(porcentagemMeta)}%`;
        if (goalCounter) goalCounter.innerText = `${questoesConcluidasHoje} de 10 concluídas`;
        if (goalBarFill) goalBarFill.style.width = `${porcentagemMeta}%`;

    } catch (erro) {
        console.error("Erro ao sincronizar painel com o back-end:", erro);
        const sidebarNome = document.getElementById('sidebarNome');
        if (sidebarNome) sidebarNome.innerText = "Erro ao carregar dados";
    }

    // Gerenciamento de Cliques nos Cards de Ação do Painel
    const cardSimulado = document.getElementById('cardSimulado');
    const cardRanking = document.getElementById('cardRanking');

    if (cardSimulado) {
        cardSimulado.addEventListener('click', () => {
            window.location.href = 'simulado.html';
        });
    }

    if (cardRanking) {
        cardRanking.addEventListener('click', () => {
            window.location.href = 'ranking.html';
        });
    }

    // Gerenciamento de Logout do sistema de forma limpa
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); // Apaga tokens e e-mails do navegador por segurança
            window.location.href = 'login.html';
        });
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    // Recupera o token e o e-mail que foram salvos durante o login
    const tokenAtivo = localStorage.getItem('enemverse_token');
    const emailAtivo = localStorage.getItem('enemverse_email_ativo');

    // Se o usuário não tiver dados de sessão ativos, barra o acesso e joga para o login
    if (!tokenAtivo || !emailAtivo) {
        window.location.href = 'login.html';
        return;
    }

    // URL exata e unificada da sua API ativa no Render
    const API_URL = 'https://onrender.com';

    async function buscarDadosUsuarioBanco() {
        try {
            // Faz a requisição segura passando o Token JWT no cabeçalho de autorização (Evita o vazamento de dados antigo)
            const resposta = await fetch(`${API_URL}/auth/perfil?email=${emailAtivo}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAtivo}`
                }
            });

            if (!resposta.ok) {
                throw new Error('Falha na autenticação do token.');
            }

            return await resposta.json();
        } catch (erro) {
            console.error("Erro na requisição de perfil:", erro);
            return null;
        }
    }

    function calcularPatenteUsuario(xpTotal) {
        const nivelCalculado = Math.floor(xpTotal / 300) + 1;
        let rankNome = "Aspirante";

        if (nivelCalculado >= 10) rankNome = "Mestre Supremo";
        else if (nivelCalculado >= 7) rankNome = "Especialista Federal";
        else if (nivelCalculado >= 4) rankNome = "Veterano das Bancas";
        else if (nivelCalculado >= 2) rankNome = "Guerreiro Estudantil";

        return `Nível ${nivelCalculado} • ${rankNome}`;
    }

    try {
        // Busca os dados APENAS do usuário logado de forma totalmente blindada
        const usuario = await buscarDadosUsuarioBanco();

        if (!usuario) {
            alert('Erro de Sincronização de conta. Redirecionando para autenticação...');
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

        // Seleção dos elementos do HTML para injeção de dados dinâmicos
        const topNavWelcome = document.getElementById('topNavWelcome');
        const sidebarNome = document.getElementById('sidebarNome');
        const dashStreak = document.getElementById('dashStreak');
        const dashXP = document.getElementById('dashXP');
        const userTier = document.getElementById('userTier');

        if (topNavWelcome) topNavWelcome.innerText = usuario.nome;
        if (sidebarNome) sidebarNome.innerText = usuario.nome;
        if (dashStreak) dashStreak.innerText = `${usuario.ofensiva} ${usuario.ofensiva === 1 ? 'Dia' : 'Dias'}`;
        if (dashXP) dashXP.innerText = usuario.xp.toLocaleString();
        if (userTier) userTier.innerText = calcularPatenteUsuario(usuario.xp);

        // Ajuste no cálculo da meta diária usando o progresso real de XP
        const totalQuestoesRespondidas = Math.floor(usuario.xp / 15); 
        let questoesConcluidasHoje = totalQuestoesRespondidas % 10;
        
        if (questoesConcluidasHoje === 0 && totalQuestoesRespondidas > 0) {
            questoesConcluidasHoje = 10;
        }

        const porcentagemMeta = Math.min((questoesConcluidasHoje / 10) * 100, 100);

        const goalPercent = document.getElementById('goalPercent');
        const goalCounter = document.getElementById('goalCounter');
        const goalBarFill = document.getElementById('goalBarFill');

        if (goalPercent) goalPercent.innerText = `${Math.floor(porcentagemMeta)}%`;
        if (goalCounter) goalCounter.innerText = `${questoesConcluidasHoje} de 10 concluídas`;
        if (goalBarFill) goalBarFill.style.width = `${porcentagemMeta}%`;

    } catch (erro) {
        console.error("Erro ao sincronizar painel com o back-end:", erro);
        const sidebarNome = document.getElementById('sidebarNome');
        if (sidebarNome) sidebarNome.innerText = "Erro ao carregar dados";
    }

    // Gerenciamento de Cliques nos Cards de Ação do Painel
    const cardSimulado = document.getElementById('cardSimulado');
    const cardRanking = document.getElementById('cardRanking');

    if (cardSimulado) {
        cardSimulado.addEventListener('click', () => {
            window.location.href = 'simulado.html';
        });
    }

    if (cardRanking) {
        cardRanking.addEventListener('click', () => {
            window.location.href = 'ranking.html';
        });
    }

    // Gerenciamento de Logout do sistema de forma limpa
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); 
            window.location.href = 'login.html';
        });
    }
});
