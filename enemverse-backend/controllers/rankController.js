const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// Rota que gera a listagem do Leaderboard organizada de pontuação decrescente
router.get('/', async (req, res) => {
    try {
        const ranking = await Usuario.find()
            .select('nome xp ofensiva email') // Filtra apenas as propriedades necessárias na tabela
            .sort({ xp: -1 }) // Organiza nativamente do maior XP para o menor
            .limit(100); // Top 100 usuários da aplicação
        res.json(ranking);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao gerar tabela classificatória.' });
    }
});

module.exports = router;
