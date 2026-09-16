/**
 * ENEMVerse - Controlador do Ranking Real Dinâmico com IndexedDB
 */

document.addEventListener('DOMContentLoaded', async () => {
    const podiumContainer = document.getElementById('podiumContainer');
    const leaderboardList = document.getElementById('leaderboardList');
    const emailLogado = localStorage.getItem('enemverse_email_ativo');

    // 1. Função para buscar todos os usuários guardados na tabela IndexedDB
    async function buscarTodosUsuarios() {
        const db = await abrirBanco(); // Abre a conexão usando a função do db.js
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['usuarios'], 'readonly');
            const store = transaction.objectStore('usuarios');
            const request = store.getAll(); // Puxa todos os registros de uma vez

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Erro ao listar ranking.');
        });
    }

    try {
        // 2. Busca e ordena os usuários do maior XP para o menor
        const usuarios = await buscarTodosUsuarios();
        usuarios.sort((a, b) => b.xp - a.xp);

        // Separa os 3 primeiros para o pódio e o restante para a lista
        const top3 = [usuarios[0] || null, usuarios[1] || null, usuarios[2] || null];

        // 3. RENDERIZAÇÃO DO PÓDIO (Inverte a ordem visual para o 1º lugar ficar no centro)
        podiumContainer.innerHTML = '';
        
        // Estrutura do Pódio: 2º Lugar (Esquerda), 1º Lugar (Centro), 3º Lugar (Direita)
        const ordemPodio = [
            { pos: 2, classe: 'second-place', dados: top3[1], emoji: '👩‍💻' },
            { pos: 1, classe: 'first-place', dados: top3[0], emoji: '👨‍🚀' },
            { pos: 3, classe: 'third-place', dados: top3[2], emoji: '👩‍🎨' }
        ];

        ordemPodio.forEach(degrau => {
            if (degrau.dados) {
                // Se houver conta cadastrada para esta posição
                const coroa = degrau.pos === 1 ? '<div class="crown-icon">👑</div>' : '';
                podiumContainer.innerHTML += `
                    <div class="podium-card ${degrau.classe}">
                        ${coroa}
                        <div class="podium-avatar-wrapper">
                            <div class="avatar-circle">${degrau.emoji}</div>
                            <span class="medal-badge">${degrau.pos}</span>
                        </div>
                        <h3 class="podium-name">${degrau.dados.nome}</h3>
                        <span class="podium-xp">${degrau.dados.xp.toLocaleString()} XP</span>
                        <span class="podium-meta">🔥 ${degrau.dados.ofensiva} ${degrau.dados.ofensiva === 1 ? 'dia' : 'dias'}</span>
                    </div>
                `;
            } else {
                // Se a vaga estiver vazia no banco
                podiumContainer.innerHTML += `
                    <div class="podium-card ${degrau.classe} empty-podium">
                        <div class="podium-avatar-wrapper">
                            <div class="avatar-circle">?</div>
                            <span class="medal-badge">${degrau.pos}</span>
                        </div>
                        <span class="empty-text">Vaga #${degrau.pos}</span>
                    </div>
                `;
            }
        });

        // 4. RENDERIZAÇÃO DA LISTA COMPLETA DO RANKING
        leaderboardList.innerHTML = '';

        if (usuarios.length === 0) {
            leaderboardList.innerHTML = '<div class="empty-list-message">Nenhum estudante cadastrado no banco de dados ainda.</div>';
            return;
        }

        // Percorre todos os usuários reais ordenados
        usuarios.forEach((user, index) => {
            const posicao = index + 1;
            const questoesFeitas = Math.floor(user.xp / 20);
            
            // Verifica se a linha pertence ao usuário que está logado no momento para destacá-la em azul
            const eOUsuarioLogado = user.email === emailLogado ? 'current-user' : '';
            const tagLogado = user.email === emailLogado ? '<span class="student-tag">Sua Posição</span>' : '';

            leaderboardList.innerHTML += `
                <div class="leaderboard-item ${eOUsuarioLogado}">
                    <span class="position-number">#${posicao}</span>
                    <div class="student-info">
                        <div class="student-avatar-mini">👤</div>
                        <div class="student-name-group">
                            <span class="student-name">${user.nome}</span>
                            ${tagLogado}
                        </div>
                    </div>
                    <span class="student-stat">🔥 ${user.ofensiva} ${user.ofensiva === 1 ? 'dia' : 'dias'}</span>
                    <span class="student-stat">${questoesFeitas} ${questoesFeitas === 1 ? 'resolvida' : 'resolvidas'}</span>
                    <span class="student-xp">${user.xp.toLocaleString()} XP</span>
                </div>
            `;
        });

    } catch (erro) {
        console.error(erro);
        leaderboardList.innerHTML = '<div class="empty-list-message">Erro ao carregar dados reais do IndexedDB.</div>';
    }
});
