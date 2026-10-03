const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const autenticarUsuario = require('../middlewares/autenticarUsuario');
const { nivelPorXP } = require('../utils/niveis');

// XP decrescente; empates seguem a ordem de criação do identificador da conta.
const ordem = { xp: -1, _id: 1 };
function publico(usuario, posicao) {
    return { id: String(usuario._id), nome: usuario.nome, xp: usuario.xp,
        posicao, nivel: nivelPorXP(usuario.xp) };
}

router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('nome xp').sort(ordem).limit(100).lean();
        res.json(usuarios.map((u, i) => publico(u, i + 1)));
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao gerar tabela classificatória.' });
    }
});

router.get('/meu-ranking', autenticarUsuario, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('nome xp').lean();
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        const [usuarios, total, anteriores] = await Promise.all([
            Usuario.find().select('nome xp').sort(ordem).limit(100).lean(),
            Usuario.countDocuments(),
            Usuario.countDocuments({ $or: [
                { xp: { $gt: usuario.xp } },
                { xp: usuario.xp, _id: { $lt: usuario._id } }
            ] })
        ]);
        res.json({
            ranking: usuarios.map((u, i) => ({ ...publico(u, i + 1),
                voce: String(u._id) === String(usuario._id) })),
            meuRanking: publico(usuario, anteriores + 1), total,
            criterio: 'Maior XP; em empate, ordem de criação da conta.'
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao consultar sua posição. Tente novamente.' });
    }
});

module.exports = router;
