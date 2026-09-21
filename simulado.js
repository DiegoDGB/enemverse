document.addEventListener('DOMContentLoaded', () => {
    // Seleção de Elementos da Interface
    const labelYear = document.querySelector('.label-year');
    const labelMateria = document.querySelector('.label-materia');
    const textoApoio = document.querySelector('.texto-apoio');
    const enunciado = document.querySelector('.enunciado');
    const alternativesList = document.querySelector('.alternatives-list');
    const btnVerify = document.getElementById('btnVerify');
    const feedbackBox = document.getElementById('feedbackBox');
    const navXP = document.getElementById('navXP');
    const progressText = document.getElementById('progressText');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    
    const subareasBox = document.getElementById('subareasBox');
    const timerDisplay = document.getElementById('countdownTimer');
    const timerWrapper = document.querySelector('.timer-wrapper');
    const userNameDisplay = document.querySelector('.user-name');
    const navStreakDisplay = document.getElementById('navStreak');

    // Estado da Aplicação
    let bancoDadosOriginal = [];
    let listaQuestoesFiltradas = [];
    let dicionarioIncidencia = {}; 
    let indiceAtual = 0;
    let selectedOption = null;
    let respondida = false;
    
    // Captura de Sessão do LocalStorage
    const emailAtivo = localStorage.getItem('enemverse_email_ativo');
    const nomeReal = localStorage.getItem('enemverse_username') || "Estudante";
    let currentXP = parseInt(localStorage.getItem('enemverse_xp')) || 0;
    let ofensivaReal = parseInt(localStorage.getItem('enemverse_streak')) || 1;

    let tempoRestante = 180;
    let cronometroInterval = null;
    let tempoEsgotadoStatus = false;

    async function iniciarPlataforma() {
        if (userNameDisplay) userNameDisplay.innerText = nomeReal;
        if (navStreakDisplay) navStreakDisplay.innerText = ofensivaReal === 1 ? "1 dia seguido" : `${ofensivaReal} dias seguidos`;
        if (navXP) navXP.innerText = `${currentXP.toLocaleString()} XP total`;

        if (btnVerify) {
            btnVerify.addEventListener('click', gerenciarCliqueBotaoPrincipal);
            btnVerify.style.opacity = "0.5";
            btnVerify.style.cursor = "not-allowed";
        }

        try {
            // SINCRO: Puxando as questões direto da sua API oficial do Render
            const respostaQuestoes = await fetch('https://enemverse-api.onrender.com');
            bancoDadosOriginal = await respostaQuestoes.json();
            
            const macroareasPadrao = [
                { "nome": "Ciências da Natureza e suas Tecnologias", "topicos_incidencia": ["Ecologia", "Mecânica"], "subareas": ["Biologia", "Física", "Química"] },
                { "nome": "Matemática e suas Tecnologias", "topicos_incidencia": ["Funções", "Estatística"], "subareas": ["Álgebra", "Geometria"] }
            ];
            gerarMenuDropdownMatriz(macroareasPadrao);
            
            filtrarQuestoes('Todas', 'macro');
        } catch (e) {
            console.error("Erro ao carregar simulado:", e);
            if(enunciado) enunciado.innerText = "Erro ao conectar com o servidor de produção.";
        }
    }

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

            let nomeCurto = area.nome.split(" e ");
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
                if(subareasBox) subareasBox.style.display = 'none';
                listaQuestoesFiltradas = [...bancoDadosOriginal];
            } else {
                if(subareasBox) {
                    subareasBox.style.display = 'block';
                    subareasBox.innerHTML = `<div><h4>📂 Foco da Área:</h4><div>🎯 Incidência: ${dicionarioIncidencia[termoBusca]}</div></div>`;
                }
                listaQuestoesFiltradas = bancoDadosOriginal.filter(q => q.materia === termoBusca);
            }
        } else {
            if(subareasBox) {
                subareasBox.style.display = 'block';
                subareasBox.innerHTML = `<div><h4>🔬 Disciplina Ativa: ${termoBusca}</h4></div>`;
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

    function rodarRelogio() {
        clearInterval(cronometroInterval);
        tempoRestante = 180;
        tempoEsgotadoStatus = false;
        if(timerWrapper) timerWrapper.classList.remove('timer-alert');
        
        cronometroInterval = setInterval(() => {
            tempoRestante--;
            const min = Math.floor(tempoRestante / 60);
            const seg = tempoRestante % 60;
            if(timerDisplay) timerDisplay.innerText = `${min < 10 ? '0'+min : min}:${seg < 10 ? '0'+seg : seg}`;

            if (tempoRestante === 30 && timerWrapper) timerWrapper.classList.add('timer-alert');

            if (tempoRestante <= 0) {
                clearInterval(croncomplex);
                clearInterval(cronometroInterval);
                tempoEsgotadoStatus = true;
                if(feedbackBox) {
                    feedbackBox.classList.remove('hidden');
                    feedbackBox.className = "feedback-message error-text";
                    feedbackBox.innerHTML = `⚠️ <span>O tempo acabou! Responda para ganhar metade dos pontos (+10 XP).</span>`;
                }
            }
        }, 1000);
    }

    function renderizarQuestao(index) {
        if (!listaQuestoesFiltradas[index]) return;
        const q = listaQuestoesFiltradas[index];
        respondida = false;
        selectedOption = null;
        
        if(btnVerify) {
            btnVerify.innerText = "Verificar Resposta";
            btnVerify.style.opacity = "0.5";
            btnVerify.style.cursor = "not-allowed";
        }
        if(feedbackBox) feedbackBox.classList.add('hidden');

        if(labelYear) labelYear.innerText = `ENEM ${q.ano}`;
        if(labelMateria) labelMateria.innerText = q.subtopico || q.materia;
        if(textoApoio) textoApoio.innerHTML = q.texto_apoio || '';
        if(enunciado) enunciado.innerText = q.enunciado;

        if(alternativesList) {
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
        if(btnVerify) {
            btnVerify.style.opacity = "1";
            btnVerify.style.cursor = "pointer";
        }
    }

    function gerenciarCliqueBotaoPrincipal() {
        if (selectedOption === null && !respondida) return;
        if (!respondida) verificarRespostaServidor();
        else avancarProximaQuestao();
    }

    async function verificarRespostaServidor() {
        if (selectedOption === null || respondida) return;
        respondida = true;
        clearInterval(cronometroInterval);
        const q = listaQuestoesFiltradas[indiceAtual];
        const itens = alternativesList.querySelectorAll('.alternative-btn');

        try {
            // SINCRO: Enviando a resposta para validação na API real do Render
            const resposta = await fetch('https://onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailAtivo, questaoId: q.id, alternativaSelecionada: selectedOption, tempoEsgotado: tempoEsgotadoStatus
                })
            });
            const dadosBack = await resposta.json();

            itens.forEach((item, idx) => {
                if (idx === dadosBack.gabarito) item.classList.add('correct');
                else if (idx === selectedOption) item.classList.add('wrong');
                item.disabled = true;
            });

            if (dadosBack.correto) {
                currentXP = dadosBack.novoXP;
                localStorage.setItem('enemverse_xp', currentXP);
                if(navXP) navXP.innerText = `${currentXP.toLocaleString()} XP total`;
                feedbackBox.className = "feedback-message success-text";
                feedbackBox.innerHTML = `🎉 <span><strong>Resposta Correta!</strong> +${dadosBack.xpGanho} XP sincronizados.</span>`;
            } else {
                const letraCerta = ['A', 'B', 'C', 'D', 'E'][dadosBack.gabarito];
                feedbackBox.className = "feedback-message error-text";
                feedbackBox.innerHTML = `❌ <span><strong>Resposta Incorreta!</strong> A alternativa certa era a letra ${letraCerta}.</span>`;
            }
            feedbackBox.classList.remove('hidden');
            if(btnVerify) btnVerify.innerText = "Próxima Questão →";
        } catch (erro) {
            console.error(erro);
        }
    }

    function avancarProximaQuestao() {
        if (indiceAtual + 1 < listaQuestoesFiltradas.length) {
            indiceAtual++;
            renderizarQuestao(indiceAtual);
        } else {
            if(feedbackBox) {
                feedbackBox.className = "feedback-message gold-text";
                feedbackBox.innerHTML = `🏆 <span>Você completou todas as questões deste filtro!</span>`;
                feedbackBox.classList.remove('hidden');
            }
            if(btnVerify) {
                btnVerify.style.opacity = "0.5";
                btnVerify.style.cursor = "not-allowed";
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
        if(enunciado) enunciado.innerText = "Nenhuma questão encontrada.";
        clearInterval(cronometroInterval);
    }

    iniciarPlataforma();
});
