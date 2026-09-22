const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario'); 

// ==========================================
// 1. ROTA DE CADASTRO
// Deve conter APENAS '/cadastrar' (O Express já injeta o prefixo /api/auth automaticamente)
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
// 2. ROTA DE LOGIN
// Deve conter APENAS '/login'
// ==========================================
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ erro: 'E-mail não encontrado ou inexistente.' });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ erro: 'Senha incorreta.' });

        // Gerenciamento de Ofensiva
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
                usuario.ofensiva = 1;
            }
        }
        usuario.ultimo_acesso = hoje;
        await usuario.save();

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
// 3. ROTA DE PERFIL SEGURO
// Deve conter APENAS '/perfil'
// ==========================================
router.get('/perfil', async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const emailFiltro = req.query.email;

    if (!token && !emailFiltro) {
        return res.status(401).json({ erro: 'Acesso negado. Autenticação necessária.' });
    }

    try {
        let emailUsuario = emailFiltro;

        if (token) {
            const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'CHAVE_TOKEN_ENEMVERSE');
            emailUsuario = decodificado.email;
        }

        const usuario = await Usuario.findOne({ email: emailUsuario }).select('-senha');
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

        res.json(usuario);
    } catch (err) {
        res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
});

module.exports = router;
