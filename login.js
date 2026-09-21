document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    const formCadastro = document.getElementById('formCadastro');
    const btnIrParaCadastro = document.getElementById('btnIrParaCadastro');
    const btnIrParaLogin = document.getElementById('btnIrParaLogin');
    
    const errorBoxLogin = document.getElementById('errorBoxLogin');
    const errorBoxCadastro = document.getElementById('errorBoxCadastro');

    // 🌟 CORREÇÃO: Endpoint apontando diretamente para a sua API real na nuvem
    const API_URL = 'https://webcontainer.io';

    if (btnIrParaCadastro) {
        btnIrParaCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            formLogin.classList.add('hidden');
            formCadastro.classList.remove('hidden');
            btnIrParaCadastro.classList.add('active');
            btnIrParaLogin.classList.remove('active');
            limparMensagensErro();
        });
    }

    if (btnIrParaLogin) {
        btnIrParaLogin.addEventListener('click', (e) => {
            e.preventDefault();
            formCadastro.classList.add('hidden');
            formLogin.classList.remove('hidden');
            btnIrParaLogin.classList.add('active');
            btnIrParaCadastro.classList.remove('active');
            limparMensagensErro();
        });
    }

    function limparMensagensErro() {
        if (errorBoxLogin) errorBoxLogin.classList.add('hidden');
        if (errorBoxCadastro) errorBoxCadastro.classList.add('hidden');
        document.querySelectorAll('input').forEach(input => input.classList.remove('input-field-error'));
    }

    function exibirErro(elementoBox, mensagem) {
        if (!elementoBox) return;
        elementoBox.innerText = mensagem;
        elementoBox.classList.remove('hidden');
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            limparMensagensErro();

            const nome = document.getElementById('regNome').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const senha = document.getElementById('regSenha').value;

            try {
                const resposta = await fetch(`${API_URL}/cadastrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    exibirErro(errorBoxCadastro, dados.erro || 'Erro ao realizar cadastro.');
                    return;
                }

                alert('Cadastro realizado com sucesso! Faça o seu login.');
                btnIrParaLogin.click(); 

            } catch (erro) {
                console.error(erro);
                exibirErro(errorBoxCadastro, 'Não foi possível conectar ao servidor da nuvem.');
            }
        });
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            limparMensagensErro();

            const email = document.getElementById('loginEmail').value.trim();
            const senha = document.getElementById('loginSenha').value;

            try {
                const resposta = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const dados = await reply || await resposta.json();

                if (!resposta.ok) {
                    exibirErro(errorBoxLogin, dados.erro || 'E-mail ou senha incorretos.');
                    return;
                }

                localStorage.setItem('enemverse_email_ativo', dados.email);
                localStorage.setItem('enemverse_username', dados.nome);
                localStorage.setItem('enemverse_xp', dados.xp);
                localStorage.setItem('enemverse_streak', dados.ofensiva);

                window.location.href = 'dashboard.html';

            } catch (erro) {
                console.error(erro);
                exibirErro(errorBoxLogin, 'Não foi possível conectar ao servidor da nuvem.');
            }
        });
    }
});
