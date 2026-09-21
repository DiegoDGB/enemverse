document.addEventListener('DOMContentLoaded', async () => {
    const emailAtivo = localStorage.getItem('enemverse_email_ativo');

    if (!emailAtivo) {
        window.location.href = 'login.html';
        return;
    }

    async function buscarDadosUsuarioBanco(email) {
        // URL nova do Render:
        const resposta = await fetch('https://enemverse-api.onrender.com');
        const listaUsuarios = await resposta.json();
        return listaUsuarios.find(u => u.email === email);
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
        const usuario = await buscarDadosUsuarioBanco(emailAtivo);

        if (!usuario) {
            alert('Erro de sincronização. Por favor, refaça o login.');
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

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

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('enemverse_email_ativo');
            window.location.href = 'login.html';
        });
    }
});
