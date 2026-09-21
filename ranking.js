document.addEventListener('DOMContentLoaded', async () => {
    const podiumContainer = document.getElementById('podiumContainer');
    const leaderboardList = document.getElementById('leaderboardList');
    const emailLogado = localStorage.getItem('enemverse_email_ativo');

    async function buscarTodosUsuarios() {
        // CONEXÃO CORRETA COM O RENDER
        const resposta = await fetch('https://enemverse-api.onrender.com');
        return await resposta.json();
    }

    try {
        const usuarios = await buscarTodosUsuarios();

        if (!usuarios || usuarios.length === 0) {
            if (leaderboardList) leaderboardList.innerHTML = '<div>Nenhum estudante cadastrado ainda.</div>';
            return;
        }

        const top3 = [usuarios[0] || null, usuarios[1] || null, usuarios[2] || null];

        if (podiumContainer) {
            podiumContainer.innerHTML = '';
            const ordemPodio = [
                { pos: 2, classe: 'second-place', dados: top3[1], emoji: '👩‍💻' },
                { pos: 1, classe: 'first-place', dados: top3[0], emoji: '👑' },
                { pos: 3, classe: 'third-place', dados: top3[2], emoji: '👩‍🎨' }
            ];

            ordemPodio.forEach(degrau => {
                if (degrau.dados) {
                    podiumContainer.innerHTML += `
                        <div class="podium-card ${degrau.classe}">
                            <div class="avatar-circle">${degrau.emoji}</div>
                            <h3>${degrau.dados.nome}</h3>
                            <span>${degrau.dados.xp.toLocaleString()} XP</span>
                            <small>🔥 ${degrau.dados.ofensiva} dias</small>
                        </div>`;
                } else {
                    podiumContainer.innerHTML += `
                        <div class="podium-card ${degrau.classe} empty-podium">
                            <div class="avatar-circle">?</div>
                            <span class="empty-text">Vaga #${degrau.pos}</span>
                        </div>`;
                }
            });
        }
        if (leaderboardList) {
            leaderboardList.innerHTML = '';
            usuarios.forEach((user, index) => {
                const posicao = index + 1;
                const questoesFeitas = Math.floor(user.xp / 20);
                const eOUsuarioLogado = user.email === emailLogado ? 'current-user' : '';
                const tagLogado = user.email === emailLogado ? '<span>(Você)</span>' : '';

                leaderboardList.innerHTML += `
                    <div class="leaderboard-item ${eOUsuarioLogado}">
                        <span>#${posicao}</span>
                        <div>
                            <strong>${user.nome}</strong> ${tagLogado}
                        </div>
                        <span>🔥 ${user.ofensiva} dias</span>
                        <span>${questoesFeitas} feitas</span>
                        <span>${user.xp.toLocaleString()} XP</span>
                    </div>`;
            });
        }
    } catch (erro) {
        console.error(erro);
    }
});
