document.addEventListener('DOMContentLoaded', () => {
    const podium = document.getElementById('podiumContainer');
    const lista = document.getElementById('leaderboardList');
    const resumo = document.getElementById('meuRanking');
    const status = document.getElementById('rankingStatus');
    const retry = document.getElementById('retryRanking');
    const token = localStorage.getItem('enemverse_token');
    if (!token) { window.location.href = 'login.html'; return; }
    const numero = n => Number(n).toLocaleString('pt-BR');
    function elemento(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    }
    function mostrar(dados) {
        podium.replaceChildren();
        lista.replaceChildren();
        const meu = dados.meuRanking;
        resumo.textContent = 'Sua posição: #' + numero(meu.posicao) + ' de ' +
            numero(dados.total) + ' estudantes · ' + numero(meu.xp) + ' XP · Nível ' + meu.nivel.numero;
        resumo.hidden = false;
        if (!dados.ranking.length) {
            status.textContent = 'Nenhum estudante no ranking ainda.';
            return;
        }
        status.textContent = 'Top 100 · ' + dados.criterio;
        for (const index of [1, 0, 2]) {
            const user = dados.ranking[index];
            if (!user) continue;
            const card = elemento('div', 'podium-card ' +
                ['first-place', 'second-place', 'third-place'][index]);
            card.append(elemento('div', 'avatar-circle', ['🥇', '🥈', '🥉'][index]),
                elemento('h3', 'podium-name', user.nome),
                elemento('span', 'podium-xp', numero(user.xp) + ' XP'),
                elemento('small', 'podium-meta', '#' + user.posicao + ' · Nível ' + user.nivel.numero));
            podium.append(card);
        }
        for (const user of dados.ranking) {
            const row = elemento('div', 'leaderboard-item' + (user.voce ? ' current-user' : ''));
            const nome = elemento('div', 'student-name-group');
            nome.append(elemento('strong', 'student-name', user.nome));
            if (user.voce) nome.append(elemento('span', 'student-tag', 'Você'));
            row.append(elemento('span', 'position-number', '#' + user.posicao), nome,
                elemento('span', 'student-stat', 'Nível ' + user.nivel.numero),
                elemento('span', 'student-xp', numero(user.xp) + ' XP'));
            lista.append(row);
        }
    }
    async function carregar() {
        retry.hidden = true;
        resumo.hidden = true;
        status.textContent = 'Carregando ranking…';
        lista.setAttribute('aria-busy', 'true');
        try {
            const resposta = await fetch(window.ENEMVERSE_API_BASE_URL + '/api/ranking/meu-ranking', {
                headers: { Authorization: 'Bearer ' + token }
            });
            if (resposta.status === 401) {
                status.textContent = 'Sua sessão expirou. Faça login novamente.';
                const link = elemento('a', 'btn-back', 'Entrar');
                link.href = 'login.html';
                lista.replaceChildren(link);
                return;
            }
            if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
            const dados = await resposta.json();
            if (!Array.isArray(dados.ranking) || !dados.meuRanking ||
                !dados.meuRanking.nivel || !Number.isFinite(dados.total)) {
                throw new Error('Resposta de ranking inválida.');
            }
            mostrar(dados);
        } catch (err) {
            console.error('Erro ao carregar ranking:', err);
            podium.replaceChildren();
            lista.replaceChildren();
            status.textContent = 'Não foi possível carregar o ranking. Tente novamente.';
            retry.hidden = false;
        } finally { lista.setAttribute('aria-busy', 'false'); }
    }
    retry.addEventListener('click', carregar);
    carregar();
});
