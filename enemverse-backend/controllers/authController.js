const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario'); 
const { ofensivaVisivel } = require('../utils/ofensiva');
const { nivelPorXP } = require('../utils/niveis');

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

        // Acesso não conta como estudo: a ofensiva muda apenas após responder.
        usuario.ultimo_acesso = new Date();
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
            ofensiva: ofensivaVisivel(usuario),
            nivel: nivelPorXP(usuario.xp)
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao autenticar estudante.' });
    }
});

// ==========================================
// 3. ROTA DE PERFIL SEGURO
// Deve conter APENAS '/perfil'
// ==========================================
router.get('/perfil', require('../middlewares/autenticarUsuario'), async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-senha');
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        res.json({ ...usuario.toObject(), ofensiva: ofensivaVisivel(usuario),
            nivel: nivelPorXP(usuario.xp) });
    } catch (err) {
        console.error('Erro ao consultar perfil:', err);
        res.status(500).json({ erro: 'Erro ao consultar perfil.' });
    }
});

module.exports = router;
