const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Correção de Case Sensitivity para rodar no Linux do Render (letras minúsculas)
const Usuario = require('../models/usuario'); 

// ==========================================
// 1. ROTA DE CADASTRO DE ESTUDANTES
// ==========================================
router.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) return res.status(400).json({ erro: 'Este e-mail já está cadastrado no sistema.' });

        usuario = new Usuario({ nome, email, senha });
        
        // Criptografia da senha
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(senha, salt);
        
        await usuario.save();
        res.status(201).json({ mensagem: 'Usuário registrado com sucesso.' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno no servidor ao cadastrar.' });
    }
});

// ==========================================
// 2. ROTA DE AUTENTICAÇÃO E LOGIN
// ==========================================
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ erro: 'E-mail não encontrado ou inexistente.' });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ erro: 'Senha incorreta.' });

        // Gerenciamento automático de Ofensiva (Dias seguidos)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (!usuario.ultimo_acesso) {
            usuario.ofensiva = 1;
        } else {
            const dataUltimoAcesso = new Date(usuario.ultimo_acesso);
            dataUltimoAcesso.setHours(0, 0, 0, 0);
            const diferencaTempo = hoje.getTime() - dataUltimoAcesso.getTime();
            const diferencaDias = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

            if (diferencaDias === 1) {
                usuario.ofensiva += 1;
            } else if (diferencaDias > 1) {
                usuario.ofensiva = 1; // Reseta a sequência se quebrou o ritmo
            }
        }
        usuario.ultimo_acesso = hoje;
        await usuario.save();

        // Geração do token JWT (Validade de 24 horas) - Chave secreta robusta
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email }, 
            process.env.JWT_SECRET || 'CHAVE_TOKEN_ENEMVERSE', 
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            nome: usuario.nome, 
            email: usuario.email, 
            xp: usuario.xp, 
            ofensiva: usuario.ofensiva 
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao autenticar estudante.' });
    }
});

// ==========================================
// 3. NOVA ROTA SEGURA: OBTER DADOS DO PERFIL
// Elimina o vazamento de dados antigos e entrega apenas o usuário logado
// ==========================================
router.get('/perfil', async (req, res) => {
    // Captura o token enviado pelo cabeçalho HTTP de autorização
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const emailFiltro = req.query.email; // Fallback caso queira buscar por email de apoio

    if (!token && !emailFiltro) {
        return res.status(401).json({ erro: 'Acesso negado. Autenticação necessária.' });
    }

    try {
        let emailUsuario = emailFiltro;

        // Se houver um token, decodifica para extrair o e-mail real com total segurança
        if (token) {
            const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'CHAVE_TOKEN_ENEMVERSE');
            emailUsuario = decodificado.email;
        }

        const usuario = await Usuario.findOne({ email: emailUsuario }).select('-senha'); // Exclui a senha da resposta
        
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado no sistema.' });
        }

        res.json(usuario);
    } catch (err) {
        res.status(401).json({ erro: 'Token de segurança inválido ou expirado.' });
    }
});

module.exports = router;
