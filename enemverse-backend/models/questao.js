const express = require('express');
const router = express.Router();
// Correção de Case Sensitivity para rodar no Linux (Render)
const Questao = require('../models/questao'); 
const Usuario = require('../models/usuario');

// ==========================================
// 1. ROTA PARA PUXAR TODAS AS QUESTÕES DO BANCO
// ==========================================
router.get('/', async (req, res) => {
    try {
        const questoes = await Questao.find();
        res.json(questoes);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao extrair questões do simulado.' });
    }
});

// ==========================================
// 2. ROTA QUE VALIDA A RESPOSTA E COMPUTA O XP
// ==========================================
router.post('/responder', async (req, res) => {
    const { email, questaoId, alternativaSelecionada, tempoEsgotado } = req.body;
    try {
        const questao = await Questao.findOne({ id: questaoId });
        const usuario = await Usuario.findOne({ email });

        if (!questao || !usuario) {
            return res.status(404).json({ erro: 'Dados cadastrais ou questão não encontrados.' });
        }

        const acertou = questao.correta === alternativaSelecionada;
        let xpGanho = 0;

        if (acertou) {
            xpGanho = tempoEsgotado ? 10 : 20; // 20 XP no tempo normal, 10 se estourar o cronômetro
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
