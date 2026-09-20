const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Rota de Cadastro de Novos Estudantes
router.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) return res.status(400).json({ erro: 'Este e-mail já está cadastrado no sistema.' });

        usuario = new Usuario({ nome, email, senha });
        
        // Criptografia de segurança da senha hash
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(senha, salt);
        
        await usuario.save();
        res.status(201).json({ mensagem: 'Usuário registrado com sucesso.' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

// Rota de Autenticação e Login com Cálculo de Ofensiva
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ erro: 'E-mail não encontrado ou inexistente.' });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ erro: 'Senha incorreta.' });

        // Gerenciamento e cálculo automático de dias seguidos (Ofensiva)
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
                usuario.ofensiva = 1; // Reseta se quebrou a sequência de dias
            }
        }
        usuario.ultimo_acesso = hoje;
        await usuario.save();

        // Geração do token JWT (Validade de 24 horas)
        const token = jwt.sign({ id: usuario._id, email: usuario.email }, 'CHAVE_TOKEN_ENEMVERSE', { expiresIn: '24h' });
        
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

module.exports = router;
