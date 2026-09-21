const express = require('express');
const router = express.Router();
const Questao = require('../models/Questao');
const Usuario = require('../models/Usuario');

// Rota para o Simulado puxar todas as questões injetadas no banco
router.get('/', async (req, res) => {
    try {
        const questoes = await Questao.find();
        res.json(questoes);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao extrair questões do simulado.' });
    }
});

// Rota blindada que valida a resposta e computa a premiação de XP no banco
router.post('/responder', async (req, res) => {
    const { email, questaoId, alternativaSelecionada, tempoEsgotado } = req.body;
    try {
        const questao = await Questao.findOne({ id: questaoId });
        const usuario = await Usuario.findOne({ email });

        if (!questao || !usuario) return res.status(404).json({ erro: 'Dados cadastrais ou questão não encontrados.' });

        const acertou = questao.correta === alternativaSelecionada;
        let xpGanho = 0;

        if (acertou) {
            xpGanho = tempoEsgotado ? 10 : 20; // 20 XP por acerto no tempo, 10 se estourar o cronômetro
            usuario.xp += xpGanho;
            await usuario.save();
        }

        res.json({
            correto: acertou,
            gabarito: questao.correta,
            novoXP: usuario.xp,
            xpGanho: xpGanho,
            explicacao: questao.explicacao
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao processar computação de pontuação.' });
    }
});

module.exports = router;
