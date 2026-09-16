/**
 * ENEMVerse - Inteligência em Questões
 * Controlador do Formulário de Autenticação Conectado ao Banco de Dados Real (IndexedDB)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos DOM
    const tabLogin = document.getElementById('tabLogin');
    const tabCadastro = document.getElementById('tabCadastro');
    const groupNome = document.getElementById('groupNome');
    const inputNome = document.getElementById('nome');
    const inputEmail = document.getElementById('email');
    const inputPassword = document.getElementById('password');
    const btnSubmit = document.getElementById('btnSubmit');
    const authForm = document.getElementById('authForm');
    
    // Elemento para validação visual interna de erros
    const errorDisplay = document.getElementById('authErrorDisplay');

    let modoAtual = 'login'; // Controla o formulário ('login' ou 'cadastro')

    function ativarModoCadastro() {
        modoAtual = 'cadastro';
        limparMensagensErro();
        if(tabCadastro) tabCadastro.classList.add('active');
        if(tabLogin) tabLogin.classList.remove('active');
        if(groupNome) groupNome.classList.remove('hidden');
        if(inputNome) inputNome.setAttribute('required', 'required');
        if(btnSubmit) btnSubmit.innerText = 'Criar minha Conta';
    }

    function ativarModoLogin() {
        modoAtual = 'login';
        limparMensagensErro();
        if(tabLogin) tabLogin.classList.add('active');
        if(tabCadastro) tabCadastro.classList.remove('active');
        if(groupNome) groupNome.classList.add('hidden');
        if(inputNome) inputNome.removeAttribute('required');
        if(btnSubmit) btnSubmit.innerText = 'Entrar no Universo';
    }

    if(tabCadastro) tabCadastro.addEventListener('click', ativarModoCadastro);
    if(tabLogin) tabLogin.addEventListener('click', ativarModoLogin);

    // Limpa os estados de erro visual da tela
    function limparMensagensErro() {
        if (errorDisplay) {
            errorDisplay.innerText = '';
            errorDisplay.classList.add('hidden');
        }
        inputNome?.classList.remove('input-field-error');
        inputEmail?.classList.remove('input-field-error');
        inputPassword?.classList.remove('input-field-error');
    }

    // Exibe o erro diretamente no formulário e pinta as bordas
    function exibirErroNoFormulario(mensagem, elementoInput = null) {
        if (errorDisplay) {
            errorDisplay.innerText = mensagem;
            errorDisplay.classList.remove('hidden');
        }
        if (elementoInput) {
            elementoInput.classList.add('input-field-error');
            elementoInput.focus();
        }
    }

    // Ouvinte do envio do formulário conectado ao Banco de Dados Real
    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            limparMensagensErro();

            const email = inputEmail.value.trim();
            const senha = inputPassword.value;

            // 1. Critérios de Senha (Apenas no modo cadastro)
            if (modoAtual === 'cadastro') {
                const temLetraMaiuscula = /[A-Z]/.test(senha);
                
                if (senha.length < 6) {
                    exibirErroNoFormulario('A senha precisa ter no mínimo 6 caracteres.', inputPassword);
                    return;
                }
                
                if (!temLetraMaiuscula) {
                    exibirErroNoFormulario('A senha precisa conter pelo menos uma letra maiúscula.', inputPassword);
                    return;
                }
            }

            // Inicia feedback visual de processamento
            btnSubmit.innerText = 'Processando...';
            btnSubmit.disabled = true;

            try {
                if (modoAtual === 'cadastro') {
                    const nome = inputNome.value.trim();
                    
                    // 💾 CHAMADA REAL: Grava os dados no IndexedDB (Inicia com XP=0 e Ofensiva=0)
                    const novoPerfil = await cadastrarUsuarioBanco(nome, email, senha);
                    
                    // Salva tokens rápidos de sessão no LocalStorage para controle de interface imediato
                    localStorage.setItem('enemverse_username', novoPerfil.nome);
                    localStorage.setItem('enemverse_xp', novoPerfil.xp);
                    localStorage.setItem('enemverse_streak', novoPerfil.ofensiva);
                    localStorage.setItem('enemverse_email_ativo', novoPerfil.email);
                    
                    // Redireciona após 1 segundo para dar efeito de conexão fluida
                    setTimeout(() => {
                        btnSubmit.disabled = false;
                        window.location.href = 'dashboard.html';
                    }, 1000);

                } else {
                    // 💾 CHAMADA REAL: Lê a tabela e confirma se as credenciais batem
                    const perfilConfirmado = await autenticarUsuarioBanco(email, senha);
                    
                    // Atualiza a sessão com os dados reais recuperados do banco
                    localStorage.setItem('enemverse_username', perfilConfirmado.nome);
                    localStorage.setItem('enemverse_xp', perfilConfirmado.xp);
                    localStorage.setItem('enemverse_streak', perfilConfirmado.ofensiva);
                    localStorage.setItem('enemverse_email_ativo', perfilConfirmado.email);

                    setTimeout(() => {
                        btnSubmit.disabled = false;
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            } catch (mensagemErroDoBanco) {
                // Captura falhas reais do banco (ex: e-mail duplicado) e exibe visualmente no formulário
                exibirErroNoFormulario(mensagemErroDoBanco, inputEmail);
                btnSubmit.innerText = modoAtual === 'cadastro' ? 'Criar minha Conta' : 'Entrar no Universo';
                btnSubmit.disabled = false;
            }
        });
    }

    // Leitor de parâmetros da URL para abrir na aba certa
    const parametros = new URLSearchParams(window.location.search);
    const acaoDesejada = parametros.get('action');
    if (acaoDesejada === 'cadastro') ativarModoCadastro();
    else ativarModoLogin();
});
