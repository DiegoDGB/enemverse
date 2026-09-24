const API_BASE_URL = window.ENEMVERSE_API_BASE_URL;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('enemverse_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('btnExit').addEventListener('click', event => {
        event.preventDefault();
        for (const chave of ['enemverse_token', 'enemverse_email_ativo', 'enemverse_username', 'enemverse_xp', 'enemverse_streak']) {
            localStorage.removeItem(chave);
        }
        window.location.href = 'login.html';
    });

    const headers = { Authorization: `Bearer ${token}` };
    const status = document.getElementById('dashboardStatus');
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

    async function consultar(rota) {
        const resposta = await fetch(`${API_BASE_URL}/api/${rota}`, { headers });
        if (resposta.status === 401) {
            localStorage.removeItem('enemverse_token');
            window.location.href = 'login.html';
            throw new Error('Sua sessão expirou. Entre novamente.');
        }
        if (!resposta.ok) throw new Error(`Consulta indisponível (HTTP ${resposta.status}).`);
        return resposta.json();
    }

    function preencherPerfil(usuario) {
        document.getElementById('dashName').textContent = usuario.nome || 'Estudante';
        document.getElementById('profileName').textContent = usuario.nome || 'Estudante';
        const xp = Number(usuario.xp) || 0;
        document.getElementById('dashXP').textContent = xp.toLocaleString('pt-BR');
        const nivel = usuario.nivel;
        if (nivel && Number.isInteger(nivel.numero)) {
            document.querySelector('.user-tier').textContent = `Nível ${nivel.numero} • ${nivel.titulo}`;
            document.getElementById('levelProgressFill').style.width = `${nivel.progresso}%`;
            document.getElementById('levelProgressText').textContent =
                `${nivel.xpNoNivel}/${nivel.xpPorNivel} XP neste nível • faltam ${nivel.xpProximoNivel} XP`;
        }
        const ofensiva = Number(usuario.ofensiva) || 0;
        document.getElementById('dashStreak').textContent = `${ofensiva} ${ofensiva === 1 ? 'Dia' : 'Dias'}`;
    }

    function preencherResumo(resumo) {
        document.getElementById('totalRespondidas').textContent = Number(resumo.respondidas || 0).toLocaleString('pt-BR');
        document.getElementById('totalAcertos').textContent = Number(resumo.acertos || 0).toLocaleString('pt-BR');
        document.getElementById('totalErros').textContent = Number(resumo.erros || 0).toLocaleString('pt-BR');
        document.getElementById('taxaAcerto').textContent = `${Number(resumo.taxaAcerto || 0).toLocaleString('pt-BR')}%`;

        const container = document.getElementById('desempenhoAreas');
        container.replaceChildren();
        const areas = Array.isArray(resumo.porArea) ? resumo.porArea : [];
        if (!areas.length) {
            container.textContent = 'Responda questões para ver seu desempenho por área.';
            return;
        }
        for (const area of areas) {
            const linha = document.createElement('div');
            linha.className = 'area-row';
            const cabecalho = document.createElement('div');
            cabecalho.className = 'area-heading';
            const nome = document.createElement('span');
            nome.textContent = area.nome || 'Sem área';
            const taxa = document.createElement('strong');
            taxa.textContent = `${Number(area.taxaAcerto || 0).toLocaleString('pt-BR')}% • ${area.acertos || 0}/${Math.max(0, (area.respondidas || 0) - (area.anuladas || 0))}`;
            cabecalho.append(nome, taxa);
            const barra = document.createElement('div');
            barra.className = 'area-track';
            const preenchimento = document.createElement('div');
            preenchimento.className = 'area-fill';
            preenchimento.style.width = `${Math.min(100, Math.max(0, Number(area.taxaAcerto) || 0))}%`;
            barra.appendChild(preenchimento);
            linha.append(cabecalho, barra);
            container.appendChild(linha);
        }
    }

    function preencherMeta(dados) {
        const feitas = Number(dados.respondidas) || 0;
        const progresso = Math.min(100, Math.round(feitas / 10 * 100));
        document.getElementById('goalCounter').textContent = `${feitas} de 10 concluídas`;
        document.getElementById('goalPercent').textContent = `${progresso}%`;
        document.querySelector('.goal-card .progress-bar-fill').style.width = `${progresso}%`;
        if (feitas >= 10) document.querySelector('.goal-desc').textContent = 'Meta de 10 questões concluída hoje!';
    }

    function preencherRecentes(dados) {
        const lista = document.getElementById('atividadesRecentes');
        lista.replaceChildren();
        const registros = Array.isArray(dados.registros) ? dados.registros : [];
        if (!registros.length) {
            const item = document.createElement('li');
            item.textContent = 'Nenhuma tentativa individual registrada ainda.';
            lista.appendChild(item);
            return;
        }
        for (const tentativa of registros) {
            const item = document.createElement('li');
            const estado = tentativa.anulada ? 'Anulada' : tentativa.correto ? 'Acerto' : 'Erro';
            const data = new Date(tentativa.respondidaEm);
            item.textContent = `Questão ${tentativa.questaoId} • ${estado} • ${Number.isNaN(data.getTime()) ? 'Data indisponível' : data.toLocaleString('pt-BR')}`;
            lista.appendChild(item);
        }
    }

    const resultados = await Promise.allSettled([
        consultar('auth/perfil'),
        consultar('questoes/historico/resumo'),
        consultar(`questoes/historico/hoje?inicio=${encodeURIComponent(inicio.toISOString())}&fim=${encodeURIComponent(fim.toISOString())}`),
        consultar('questoes/historico/tentativas?pagina=1&limite=5')
    ]);
    if (resultados[0].status === 'fulfilled') preencherPerfil(resultados[0].value);
    if (resultados[1].status === 'fulfilled') preencherResumo(resultados[1].value);
    if (resultados[2].status === 'fulfilled') preencherMeta(resultados[2].value);
    if (resultados[3].status === 'fulfilled') preencherRecentes(resultados[3].value);

    const mensagens = ['perfil', 'resumo', 'meta diária', 'atividades recentes']
        .filter((_, indice) => resultados[indice].status === 'rejected');
    if (mensagens.length) {
        status.textContent = `Não foi possível carregar: ${mensagens.join(', ')}. Atualize a página para tentar novamente.`;
        if (resultados[2].status === 'rejected') {
            document.getElementById('goalCounter').textContent = 'Meta indisponível';
            document.getElementById('goalPercent').textContent = '—';
        }
        if (resultados[3].status === 'rejected') {
            document.getElementById('atividadesRecentes').textContent = 'Atividades indisponíveis.';
        }
    } else {
        status.textContent = 'Atualizado com os dados da sua conta.';
    }


});
