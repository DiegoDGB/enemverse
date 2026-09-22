const express = require('express');
const router = express.Router();
// Correção de Case Sensitivity para rodar no Linux (Render)
const Usuario = require('../models/usuario');

// ==========================================
// ROTA QUE GERA A LISTAGEM DO LEADERBOARD (TOP 100)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const ranking = await Usuario.find()
            .select('nome xp ofensiva email') // Filtra apenas as propriedades necessárias na tabela
            .sort({ xp: -1 }) // Organiza nativamente do maior XP para o menor
            .limit(100); // Limita ao Top 100 usuários
        res.json(ranking);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao gerar tabela classificatória.' });
    }
});

module.exports = router;
