document.addEventListener('DOMContentLoaded', async () => {
    // Captura o e-mail do usuário ativo guardado no login
    const emailAtivo = localStorage.getItem('enemverse_email_ativo');

    // 1. BARREIRA DE SEGURANÇA: Se não houver sessão ativa, expulsa para a tela de login
    if (!emailAtivo) {
        window.location.href = 'login.html';
        return;
    }

    // 2. FUNÇÃO AUXILIAR: Puxa os dados reais em tempo real direto do Servidor Nativo
    async function buscarDadosUsuarioBanco(email) {
        // Consultamos a lista consolidada de usuários cadastrados no back-end
        const resposta = await fetch('http://localhost:5000/api/ranking');
        const listaUsuarios = await resposta.json();
        return listaUsuarios.find(u => u.email === email);
    }

    // 3. FUNÇÃO AUXILIAR: Calcula dinamicamente a patente do usuário com base no XP total
    function calcularPatenteUsuario(xpTotal) {
        const nivelCalculado = Math.floor(xpTotal / 300) + 1; // Cada 300 XP avança 1 nível
        let rankNome = "Aspirante";

        if (nivelCalculado >= 10) rankNome = "Mestre Supremo";
        else if (nivelCalculado >= 7) rankNome = "Especialista Federal";
        else if (nivelCalculado >= 4) rankNome = "Veterano das Bancas";
        else if (nivelCalculado >= 2) rankNome = "Guerreiro Estudantil";

        return `Nível ${nivelCalculado} • ${rankNome}`;
    }

    try {
        // 4. EXTRAÇÃO E RENDERIZAÇÃO DOS DADOS DO SERVIDOR
        const usuario = await buscarDadosUsuarioBanco(emailAtivo);

        if (!usuario) {
            alert('Erro de sincronização. Por favor, refaça o login.');
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

        // Atualiza elementos textuais da interface do usuário do painel
        const topNavWelcome = document.getElementById('topNavWelcome');
        const sidebarNome = document.getElementById('sidebarNome');
        const dashStreak = document.getElementById('dashStreak');
        const dashXP = document.getElementById('dashXP');
        const userTier = document.getElementById('userTier');

        if (topNavWelcome) topNavWelcome.innerText = usuario.nome;
        if (sidebarNome) sidebarNome.innerText = usuario.nome;
        if (dashStreak) dashStreak.innerText = `${usuario.ofensiva} ${usuario.ofensiva === 1 ? 'Dia' : 'Dias'}`;
        if (dashXP) dashXP.innerText = usuario.xp.toLocaleString();
        
        // Atualiza o nível
        if (userTier) userTier.innerText = calcularPatenteUsuario(usuario.xp);

        // 5. CÁLCULO E RENDERIZAÇÃO DA META DIÁRIA (Conversão de 20XP por questão)
        const questoesRespondidasTotais = Math.floor(usuario.xp / 20);
        let questoesConcluidasHoje = questoesRespondidasTotais % 10;
        
        if (questoesConcluidasHoje === 0 && questoesRespondidasTotais > 0) {
            questoesConcluidasHoje = 10;
        }

        const porcentagemMeta = (questoesConcluidasHoje / 10) * 100;

        const goalPercent = document.getElementById('goalPercent');
        const goalCounter = document.getElementById('goalCounter');
        const goalBarFill = document.getElementById('goalBarFill');

        if (goalPercent) goalPercent.innerText = `${porcentagemMeta}%`;
        if (goalCounter) goalCounter.innerText = `${questoesConcluidasHoje} de 10 concluídas`;
        if (goalBarFill) goalBarFill.style.width = `${porcentagemMeta}%`;

    } catch (erro) {
        console.error("Erro ao sincronizar painel com o back-end:", erro);
        const sidebarNome = document.getElementById('sidebarNome');
        if (sidebarNome) sidebarNome.innerText = "Erro ao carregar dados";
    }

    // 6. SISTEMA DE DIRECIONAMENTO DOS CARDS
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

    // 7. MECANISMO DE LOGOUT
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('enemverse_email_ativo');
            window.location.href = 'login.html';
        });
    }
});
