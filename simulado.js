document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 1. SELEÇÃO DE ELEMENTOS DA INTERFACE (Alinhados ao simulado.css)
    // ============================================================
    const labelYear = document.querySelector('.label-year');
    const labelMateria = document.querySelector('.label-materia');
    const textoApoio = document.querySelector('.texto-apoio');
    const enunciado = document.querySelector('.enunciado');
    const alternativesList = document.querySelector('.alternatives-list');
    const btnVerify = document.getElementById('btnVerify');
    const feedbackBox = document.getElementById('feedbackBox');
    const navXP = document.getElementById('navXP') || document.querySelector('.user-stats-stacked p:nth-of-type(2)');
    const progressText = document.getElementById('progressText');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    
    const subareasBox = document.getElementById('subareasBox');
    const timerDisplay = document.getElementById('countdownTimer');
    const timerWrapper = document.querySelector('.timer-wrapper');
    const userNameDisplay = document.querySelector('.user-name');
    const navStreakDisplay = document.getElementById('navStreak') || document.querySelector('.user-stats-stacked p:nth-of-type(1)');

    // ============================================================
    // 2. CONFIGURAÇÃO DE SESSÃO E API_URL UNIFICADA
    // ============================================================
    const API_URL = 'https://enemverse-api.onrender.com';
    const tokenAtivo = localStorage.getItem('enemverse_token');
    const emailAtivo = localStorage.getItem('enemverse_email_ativo');

    // Se o estudante tentar burlar a URL sem estar logado, barra na hora
    if (!tokenAtivo || !emailAtivo) {
        window.location.href = 'login.html';
        return;
    }

    // Estado interno da aplicação
    let bancoDadosOriginal = [];
    let listaQuestoesFiltradas = [];
    let dicionarioIncidencia = {}; 
    let indiceAtual = 0;
    let selectedOption = null;
    let respondida = false;

    let tempoRestante = 180;
    let cronometroInterval = null;
    let tempoEsgotadoStatus = false;

    // ============================================================
    // 3. INICIALIZAÇÃO DA PLATAFORMA (SINCRONIZAÇÃO DO PERFIL)
    // ============================================================
    async function iniciarPlataforma() {
        if (btnVerify) {
            btnVerify.addEventListener('click', gerenciarCliqueBotaoPrincipal);
            btnVerify.style.opacity = "0.5";
            btnVerify.style.cursor = "not-allowed";
        }

        try {
            // Sincroniza os dados do header direto da API para evitar fraudes locais de XP
            const respostaPerfil = await fetch(`${API_URL}/auth/perfil?email=${emailAtivo}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAtivo}`
                }
            });

            if (respostaPerfil.ok) {
                const estudante = await respostaPerfil.json();
                if (userNameDisplay) userNameDisplay.innerText = estudante.nome;
                if (navStreakDisplay) navStreakDisplay.innerText = `🔥 ${estudante.ofensiva} ${estudante.ofensiva === 1 ? 'Dia Ofensiva' : 'Dias Ofensiva'}`;
                if (navXP) navXP.innerText = `⚡ ${estudante.xp.toLocaleString('pt-BR')} XP total`;
            }

            // Puxa o banco de questões real injetado no MongoDB Atlas
            if (enunciado) enunciado.innerText = "Carregando caderno de questões do ENEMverse...";
            const respostaQuestoes = await fetch(`${API_URL}/questoes`);
            bancoDadosOriginal = await respostaQuestoes.json();
            
            // Matriz Oficial do ENEM de incidência pedagógica
            const matrizOficialENEM = [
                { "nome": "Ciências da Natureza e suas Tecnologias", "topicos_incidencia": ["Ecologia", "Mecânica", "Estequiometria", "Evolução"], "subareas": ["Biologia", "Física", "Química"] },
                { "nome": "Matemática e suas Tecnologias", "topicos_incidencia": ["Funções", "Geometria Espacial", "Estatística", "Porcentagem"], "subareas": ["Álgebra", "Geometria"] },
                { "nome": "Ciências Humanas e suas Tecnologias", "topicos_incidencia": ["Brasil Colônia", "Globalização", "Cidadania", "Cartografia"], "subareas": ["História", "Geografia", "Filosofia"] },
                { "nome": "Linguagens, Códigos e suas Tecnologias", "topicos_incidencia": ["Funções da Linguagem", "Modernismo", "Variação Linguística"], "subareas": ["Gramática", "Literatura"] }
            ];
            
            gerarMenuDropdownMatriz(matrizOficialENEM);
            filtrarQuestoes('Todas', 'macro');
            
        } catch (e) {
            console.error("Erro ao carregar simulado:", e);
            if (enunciado) enunciado.innerText = "Erro crítico ao conectar com o banco de dados das questões.";
        }
    }

    // ============================================================
    // 4. MECÂNICA DE FILTROS E DROPDOWNS
    // ============================================================
    function gerarMenuDropdownMatriz(macroareas) {
        const macroAreasGroup = document.getElementById('macroAreasGroup');
        if (!macroAreasGroup) return;
        macroAreasGroup.innerHTML = '';

        const btnTodas = document.createElement('button');
        btnTodas.className = 'macro-btn active';
        btnTodas.innerText = 'Todas as Áreas';
        btnTodas.addEventListener('click', () => tratarCliqueMacro(btnTodas, 'Todas'));
        macroAreasGroup.appendChild(btnTodas);

        macroareas.forEach(area => {
            dicionarioIncidencia[area.nome] = area.topicos_incidencia.join(', ');
            
            const divDropdown = document.createElement('div');
            divDropdown.className = 'dropdown';

            let nomeCurto = area.nome.split(" e ")[0]; 
            const btnMacro = document.createElement('button');
            btnMacro.className = 'macro-btn';
            btnMacro.innerText = `${nomeCurto} ▾`; 
            btnMacro.addEventListener('click', () => tratarCliqueMacro(btnMacro, area.nome));
            divDropdown.appendChild(btnMacro);

            const divContent = document.createElement('div');
            divContent.className = 'dropdown-content';

            area.subareas.forEach(sub => {
                const btnSub = document.createElement('button');
                btnSub.className = 'sub-filter-btn';
                btnSub.innerText = sub;
                btnSub.addEventListener('click', (e) => tratarCliqueSub(e, btnSub, sub));
                divContent.appendChild(btnSub);
            });
            
            divDropdown.appendChild(divContent);
            macroAreasGroup.appendChild(divDropdown);
        });
    }

    function tratarCliqueMacro(elementoBtn, nomeArea) {
        limparEstilosFiltros();
        elementoBtn.classList.add('active');
        filtrarQuestoes(nomeArea, 'macro');
    }

    function tratarCliqueSub(evento, elementoBtn, nomeSub) {
        evento.stopPropagation();
        limparEstilosFiltros();
        elementoBtn.classList.add('active-sub');
        const pai = elementoBtn.closest('.dropdown')?.querySelector('.macro-btn');
        if (pai) pai.classList.add('active');
        filtrarQuestoes(nomeSub, 'sub');
    }

    function limparEstilosFiltros() {
        document.querySelectorAll('.macro-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active-sub'));
    }

    function filtrarQuestoes(termoBusca, tipo) {
        indiceAtual = 0;
        if (tipo === 'macro') {
            if (termoBusca === 'Todas') {
                if (subareasBox) subareasBox.style.display = 'none';
                listaQuestoesFiltradas = [...bancoDadosOriginal];
            } else {
                if (subareasBox) {
                    subareasBox.style.display = 'block';
                    subareasBox.innerHTML = `<div class="panel-content"><h4>📂 Foco da Área: ${termoBusca}</h4><p class="panel-incidencia">🎯 <strong>Mais cobrados:</strong> ${dicionarioIncidencia[termoBusca]}</p></div>`;
                }
                listaQuestoesFiltradas = bancoDadosOriginal.filter(q => q.materia === termoBusca);
            }
        } else {
            if (subareasBox) {
                subareasBox.style.display = 'block';
                subareasBox.innerHTML = `<div class="panel-content"><h4>🔬 Disciplina Ativa: ${termoBusca}</h4><p class="panel-incidencia">Buscando tópicos e subcampos...</p></div>`;
            }
            listaQuestoesFiltradas = bancoDadosOriginal.filter(q => 
                (q.subtopico && q.subtopico.toLowerCase().includes(termoBusca.toLowerCase())) || 
                (q.materia && q.materia.toLowerCase().includes(termoBusca.toLowerCase()))
            );
        }
        atualizarBarraProgresso();
        if (listaQuestoesFiltradas.length > 0) renderizarQuestao(indiceAtual);
        else mostrarAvisoSemQuestoes();
    }
    // ============================================================
    // 5. CRONÔMETRO DE PERFORMANCE (3 minutos por questão)
    // ============================================================
    function rodarRelogio() {
        clearInterval(cronometroInterval);
        tempoRestante = 180;
        tempoEsgotadoStatus = false;
        if (timerWrapper) timerWrapper.classList.remove('timer-alert');
        
        cronometroInterval = setInterval(() => {
            tempoRestante--;
            const min = Math.floor(tempoRestante / 60);
            const seg = tempoRestante % 60;
            if (timerDisplay) timerDisplay.innerText = `${min < 10 ? '0'+min : min}:${seg < 10 ? '0'+seg : seg}`;

            if (tempoRestante === 30 && timerWrapper) timerWrapper.classList.add('timer-alert');

            if (tempoRestante <= 0) {
                clearInterval(cronometroInterval);
                tempoEsgotadoStatus = true;
                if (feedbackBox) {
                    feedbackBox.classList.remove('hidden');
                    feedbackBox.className = "feedback-message error-text";
                    feedbackBox.innerHTML = `⚠️ <span>O tempo acabou! Marque uma opção para validar metade dos pontos de XP (+10 XP).</span>`;
                }
            }
        }, 1000);
    }

    // ============================================================
    // 6. RENDERIZAÇÃO DA QUESTÃO NA INTERFACE
    // ============================================================
    function renderizarQuestao(index) {
        if (!listaQuestoesFiltradas[index]) return;
        const q = listaQuestoesFiltradas[index];
        respondida = false;
        selectedOption = null;
        
        if (btnVerify) {
            btnVerify.innerText = "Verificar Resposta";
            btnVerify.style.opacity = "0.5";
            btnVerify.style.cursor = "not-allowed";
        }
        if (feedbackBox) feedbackBox.classList.add('hidden');

        if (labelYear) labelYear.innerText = `ENEM ${q.ano}`;
        if (labelMateria) labelMateria.innerText = q.subtopico || q.materia;
        if (textoApoio) textoApoio.innerHTML = q.texto_apoio || q.textoApoio || '';
        if (enunciado) enunciado.innerText = q.enunciado;

        if (alternativesList) {
            alternativesList.innerHTML = '';
            const letras = ['A', 'B', 'C', 'D', 'E'];
            q.alternativas.forEach((alt, idx) => {
                const item = document.createElement('button');
                item.className = 'alternative-btn';
                item.innerHTML = `<div class="letter">${letras[idx]}</div><div class="alt-text">${alt}</div>`;
                item.addEventListener('click', () => selecionarAlternativa(item, idx));
                alternativesList.appendChild(item);
            });
        }
        atualizarBarraProgresso();
        rodarRelogio();
    }

    function selecionarAlternativa(elemento, index) {
        if (respondida) return;
        document.querySelectorAll('.alternative-btn').forEach(i => i.classList.remove('selected'));
        elemento.classList.add('selected');
        selectedOption = index;
        if (btnVerify) {
            btnVerify.style.opacity = "1";
            btnVerify.style.cursor = "pointer";
        }
    }

    // Controla se o clique vai avaliar o gabarito ou passar para frente
    function gerenciarCliqueBotaoPrincipal() {
        if (selectedOption === null && !respondida) return;
        if (!respondida) verificarRespostaServidor();
        else avancarProximaQuestao();
    }

    // ============================================================
    // 7. ENVIO SEGURO E VERIFICAÇÃO COM CÁLCULO DE XP NO BANCO
    // ============================================================
    async function verificarRespostaServidor() {
        if (selectedOption === null || respondida) return;
        respondida = true;
        clearInterval(cronometroInterval);
        const q = listaQuestoesFiltradas[indiceAtual];
        const itens = alternativesList.querySelectorAll('.alternative-btn');

        if (feedbackBox) {
            feedbackBox.className = "feedback-message";
            feedbackBox.innerHTML = "Sincronizando pontos com o banco de dados...";
            feedbackBox.classList.remove('hidden');
        }

        try {
            // Envia a resposta para processamento seguro na API protegida por Token JWT
            const resposta = await fetch(`${API_URL}/questoes/responder`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAtivo}`
                },
                body: JSON.stringify({
                    email: emailAtivo, 
                    questaoId: q.id, 
                    alternativaSelecionada: selectedOption, 
                    tempoEsgotado: tempoEsgotadoStatus
                })
            });
            
            const dadosBack = await resposta.json();

            itens.forEach((item, idx) => {
                if (idx === dadosBack.gabarito) item.classList.add('correct');
                else if (idx === selectedOption) item.classList.add('wrong');
                item.disabled = true;
            });

            if (dadosBack.correto) {
                if (navXP) navXP.innerText = `⚡ ${dadosBack.novoXP.toLocaleString('pt-BR')} XP total`;
                feedbackBox.className = "feedback-message success-text";
                feedbackBox.innerHTML = `🎉 <span><strong>Resposta Correta!</strong> +${dadosBack.xpGanho} XP adicionados à sua conta.</span>`;
            } else {
                const letraCerta = ['A', 'B', 'C', 'D', 'E'][dadosBack.gabarito];
                feedbackBox.className = "feedback-message error-text";
                feedbackBox.innerHTML = `❌ <span><strong>Resposta Incorreta!</strong> A alternativa certa era a letra ${letraCerta}.</span>`;
            }
            
            // Adiciona a explicação pedagógica da questão se o banco possuir
            if (dadosBack.explicacao) {
                feedbackBox.innerHTML += `<div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--border);">💡 <strong>Análise:</strong> ${dadosBack.explicacao}</div>`;
            }
            
            feedbackBox.classList.remove('hidden');
            if (btnVerify) btnVerify.innerText = "Próxima Questão →";
        } catch (erro) {
            console.error("Erro ao validar resposta:", erro);
            if (feedbackBox) feedbackBox.innerHTML = "⚠️ Falha ao computar pontuação na nuvem.";
        }
    }

    function avancarProximaQuestao() {
        if (indiceAtual + 1 < listaQuestoesFiltradas.length) {
            indiceAtual++;
            renderizarQuestao(indiceAtual);
        } else {
            if (feedbackBox) {
                feedbackBox.className = "feedback-message gold-text";
                feedbackBox.innerHTML = `🏆 <span>Você completou o caderno de estudos deste filtro! Mude de área para continuar jogando.</span>`;
                feedbackBox.classList.remove('hidden');
            }
            if (btnVerify) {
                btnVerify.style.opacity = "0.5";
                btnVerify.style.cursor = "not-allowed";
                btnVerify.disabled = true;
            }
        }
    }

    function atualizarBarraProgresso() {
        const total = listaQuestoesFiltradas.length;
        const atual = total > 0 ? indiceAtual + 1 : 0;
        if (progressText) progressText.innerText = `${atual} / ${total} Questões`;
        if (progressBarFill) progressBarFill.style.width = `${total > 0 ? (atual / total) * 100 : 0}%`;
    }

    function mostrarAvisoSemQuestoes() {
        if (enunciado) enunciado.innerText = "Nenhuma questão encontrada para os critérios selecionados.";
        if (textoApoio) textoApoio.innerHTML = '';
        if (alternativesList) alternativesList.innerHTML = '';
        if (labelYear) labelYear.innerText = 'ENEM --';
        if (labelMateria) labelMateria.innerText = 'Banca vazia';
        clearInterval(cronometroInterval);
    }

    iniciarPlataforma();
});
