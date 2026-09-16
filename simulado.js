/**
 * ENEMVerse - Inteligência em Questões
 * Motor do Simulado e Menu de Subareas Dinâmico - TOTALMENTE OPERACIONAL
 */
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
    
    // Sessão do Usuário
    const emailAtivo = localStorage.getItem('enemverse_email_ativo');
    const nomeReal = localStorage.getItem('enemverse_username') || "Estudante";
    let currentXP = parseInt(localStorage.getItem('enemverse_xp')) || 0;
    let ofensivaReal = parseInt(localStorage.getItem('enemverse_streak')) || 0;

    let tempoRestante = 180;
    let cronometroInterval = null;
    let tempoEsgotadoStatus = false;

    // 1. Inicialização da plataforma
    async function iniciarPlataforma() {
        if (userNameDisplay) userNameDisplay.innerText = nomeReal;
        if (navStreakDisplay) navStreakDisplay.innerText = ofensivaReal === 1 ? "1 dia seguido" : `${ofensivaReal} dias seguidos`;
        if (navXP) navXP.innerText = `${currentXP.toLocaleString()} XP total`;

        if (btnVerify) {
            btnVerify.addEventListener('click', gerenciarCliqueBotaoPrincipal);
            // Configuração visual inicial travada
            btnVerify.style.opacity = "0.5";
            btnVerify.style.cursor = "not-allowed";
        }

        try {
            const respostaMatriz = await fetch('matriz_enem.json');
            const dadosMatriz = await respostaMatriz.json();
            gerarMenuDropdownMatriz(dadosMatriz.macroareas);

            const respostaQuestoes = await fetch('/api/questoes');
            bancoDadosOriginal = await respostaQuestoes.json();
            
            filtrarQuestoes('Todas', 'macro');
        } catch (e) {
            console.error("Erro ao carregar simulado:", e);
            if(enunciado) enunciado.innerText = "Erro ao carregar o simulado. Verifique os arquivos json.";
        }
    }
    // 2. Montagem Automatizada de Menus
    function gerarMenuDropdownMatriz(macroareas) {
        const macroAreasGroup = document.getElementById('macroAreasGroup');
        if (!macroAreasGroup) return;
        macroAreasGroup.innerHTML = '';

        const btnTodas = document.createElement('button');
        btnTodas.className = 'macro-btn active';
        btnTodas.setAttribute('data-area', 'Todas');
        btnTodas.innerText = 'Todas as Áreas';
        btnTodas.addEventListener('click', () => tratarCliqueMacro(btnTodas, 'Todas'));
        macroAreasGroup.appendChild(btnTodas);

        macroareas.forEach(area => {
            dicionarioIncidencia[area.nome] = area.topicos_incidencia.join(', ');

            const divDropdown = document.createElement('div');
            divDropdown.className = 'dropdown';

            let nomeCurto = area.nome.split(" e ")[0]; 
            if(area.nome.includes("Matemática")) nomeCurto = "Matemática";

            const btnMacro = document.createElement('button');
            btnMacro.className = 'macro-btn';
            btnMacro.setAttribute('data-area', area.nome);
            btnMacro.innerText = `${nomeCurto} ▾`; 
            btnMacro.addEventListener('click', () => tratarCliqueMacro(btnMacro, area.nome));
            divDropdown.appendChild(btnMacro);

            const divContent = document.createElement('div');
            divContent.className = 'dropdown-content';

            area.subareas.forEach(sub => {
                const btnSub = document.createElement('button');
                btnSub.className = 'sub-filter-btn';
                btnSub.setAttribute('data-sub', sub);
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

    // 3. Filtragem das Questões
    function filtrarQuestoes(termoBusca, tipo) {
        indiceAtual = 0;
        if (tipo === 'macro') {
            if (termoBusca === 'Todas') {
                if(subareasBox) subareasBox.style.display = 'none';
                listaQuestoesFiltradas = [...bancoDadosOriginal];
            } else {
                if(subareasBox) {
                    subareasBox.style.display = 'block';
                    subareasBox.innerHTML = `<div class="panel-content"><h4>📂 Foco da Área:</h4><div class="panel-incidencia">🎯 <strong>Incidência:</strong> ${dicionarioIncidencia[termoBusca]}</div></div>`;
                }
                listaQuestoesFiltradas = bancoDadosOriginal.filter(q => q.materia === termoBusca);
            }
        } else {
            if(subareasBox) {
                subareasBox.style.display = 'block';
                subareasBox.innerHTML = `<div class="panel-content"><h4>🔬 Disciplina Ativa: ${termoBusca}</h4></div>`;
            }
            listaQuestoesFiltradas = bancoDadosOriginal.filter(q => 
                (q.subtopico && q.subtopico.toLowerCase().includes(termoBusca.toLowerCase())) || 
                (q.materia && q.materia.toLowerCase().includes(termoBusca.toLowerCase()))
            );
        }

        atualizarBarraProgresso();
        if (listaQuestoesFiltradas.length > 0) {
            renderizarQuestao(indiceAtual);
        } else {
            mostrarAvisoSemQuestoes();
        }
    }

    // 4. Motor do Cronômetro
    function rodarRelogio() {
        clearInterval(cronometroInterval);
        tempoRestante = 180;
        tempoEsgotadoStatus = false;
        if(timerWrapper) timerWrapper.classList.remove('timer-alert');
        
        cronometroInterval = setInterval(() => {
            tempoRestante--;
            
            const min = Math.floor(tempoRestante / 60);
            const seg = tempoRestante % 60;
            if(timerDisplay) {
                timerDisplay.innerText = `${min < 10 ? '0' + min : min}:${seg < 10 ? '0' + seg : seg}`;
            }

            if (tempoRestante === 30 && timerWrapper) {
                timerWrapper.classList.add('timer-alert');
            }

            if (tempoRestante <= 0) {
                clearInterval(cronometroInterval);
                tempoEsgotadoStatus = true;
                if(timerDisplay) timerDisplay.innerText = "00:00";
                if(feedbackBox) {
                    feedbackBox.classList.remove('hidden');
                    feedbackBox.className = "feedback-message error-text";
                    feedbackBox.innerHTML = `⚠️ <span class="feedback-text">O tempo acabou! Você ainda pode responder, mas receberá apenas metade dos pontos (+10 XP).</span>`;
                }
            }
        }, 1000);
    }
    // 5. Renderização e Mecânica de Alternativas (Sincronizado com simulado.css)
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

        // Atualização de Metadados
        if(labelYear) labelYear.innerText = `ENEM ${q.ano}`;
        if(labelMateria) labelMateria.innerText = q.subtopico || q.materia;
        if(textoApoio) textoApoio.innerHTML = q.texto_apoio || '';
        if(enunciado) enunciado.innerText = q.enunciado;

        // Montagem das alternativas usando botões legítimos
        if(alternativesList) {
            alternativesList.innerHTML = '';
            const letras = ['A', 'B', 'C', 'D', 'E'];
            
            if (Array.isArray(q.alternativas)) {
                q.alternativas.forEach((alt, idx) => {
                    const item = document.createElement('button');
                    item.className = 'alternative-btn';
                    item.setAttribute('type', 'button');
                    item.setAttribute('data-index', idx);
                    
                    // Respeita as classes ".letter" e ".alt-text" estruturadas no simulado.css
                    item.innerHTML = `<div class="letter">${letras[idx]}</div><div class="alt-text">${alt}</div>`;
                    
                    item.addEventListener('click', () => selecionarAlternativa(item, idx));
                    alternativesList.appendChild(item);
                });
            }
        }

        atualizarBarraProgresso();
        rodarRelogio();
    }

    function selecionarAlternativa(elemento, index) {
        if (respondida) return;
        
        const itens = alternativesList.querySelectorAll('.alternative-btn');
        itens.forEach(i => i.classList.remove('selected'));
        
        elemento.classList.add('selected');
        selectedOption = index;
        
        // Ativa e colore o botão de envio
        if(btnVerify) {
            btnVerify.style.opacity = "1";
            btnVerify.style.cursor = "pointer";
        }
    }

    // 6. Fluxo de Verificação e Avanço
    function gerenciarCliqueBotaoPrincipal() {
        if (selectedOption === null && !respondida) return; // Impede envio sem seleção

        if (!respondida) {
            verificarResposta();
        } else {
            avancarProximaQuestao();
        }
    }

    function verificarResposta() {
        if (selectedOption === null || respondida) return;
        respondida = true;
        clearInterval(cronometroInterval);

        const q = listaQuestoesFiltradas[indiceAtual];
        const itens = alternativesList.querySelectorAll('.alternative-btn');
        
        let indiceCorreto = q.correta;
        if (typeof q.correta === 'string') {
            indiceCorreto = ['A', 'B', 'C', 'D', 'E'].indexOf(q.correta.toUpperCase());
        }

        // Aplica os estados visuais (correct/wrong) nas caixas
        itens.forEach((item, idx) => {
            if (idx === indiceCorreto) {
                item.classList.add('correct');
            } else if (idx === selectedOption) {
                item.classList.add('wrong');
            }
            item.disabled = true;
        });

        let ganhouXP = 0;
        if (selectedOption === indiceCorreto) {
            ganhouXP = tempoEsgotadoStatus ? 10 : 20;
            currentXP += ganhouXP;
            localStorage.setItem('enemverse_xp', currentXP);
            
            // Persiste no banco de dados real (IndexedDB do db.js) se estiver logado
            if (typeof atualizarXPUsuarioBanco === 'function' && emailAtivo) {
                atualizarXPUsuarioBanco(emailAtivo, currentXP).catch(console.error);
            }
            
            if(navXP) navXP.innerText = `${currentXP.toLocaleString()} XP total`;

            feedbackBox.className = "feedback-message success-text";
            feedbackBox.innerHTML = `🎉 <span class="feedback-text"><strong>Resposta Correta!</strong> +${ganhouXP} XP garantidos.</span>`;
        } else {
            const letraCerta = ['A', 'B', 'C', 'D', 'E'][indiceCorreto] || 'A';
            feedbackBox.className = "feedback-message error-text";
            feedbackBox.innerHTML = `❌ <span class="feedback-text"><strong>Resposta Incorreta!</strong> A alternativa certa era a letra ${letraCerta}.</span>`;
        }

        feedbackBox.classList.remove('hidden');
        if(btnVerify) btnVerify.innerText = "Próxima Questão →";
    }

    function avancarProximaQuestao() {
        if (indiceAtual + 1 < listaQuestoesFiltradas.length) {
            indiceAtual++;
            renderizarQuestao(indiceAtual);
        } else {
            if(feedbackBox) {
                feedbackBox.className = "feedback-message gold-text";
                feedbackBox.innerHTML = `🏆 <span class="feedback-text">Você completou todas as questões disponíveis deste filtro!</span>`;
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
        if (progressBarFill) {
            const porcentagem = total > 0 ? (atual / total) * 100 : 0;
            progressBarFill.style.width = `${porcentagem}%`;
        }
    }

    function mostrarAvisoSemQuestoes() {
        if(labelYear) labelYear.innerText = "ENEM --";
        if(labelMateria) labelMateria.innerText = "Vazio";
        if(textoApoio) textoApoio.innerHTML = "";
        if(enunciado) enunciado.innerText = "Nenhuma questão encontrada para os filtros selecionados.";
        if(alternativesList) alternativesList.innerHTML = "";
        if(btnVerify) {
            btnVerify.style.opacity = "0.5";
            btnVerify.style.cursor = "not-allowed";
        }
        clearInterval(cronometroInterval);
    }

    iniciarPlataforma();
});
