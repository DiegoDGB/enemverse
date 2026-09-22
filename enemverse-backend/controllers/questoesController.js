const express = require('express');
const router = express.Router();
const Questao = require('../models/questao');
const Usuario = require('../models/usuario');
const fs = require('fs/promises');
const path = require('path');

// Lista todas as questões disponíveis para o simulado
router.get('/', async (req, res) => {
    try {
        const questoes = await Questao.find().sort({ id: 1 });
        res.json(questoes);
    } catch (err) {
        console.error('Erro ao extrair questões:', err);
        res.status(500).json({ erro: 'Erro ao extrair questões do simulado.' });
    }
});

// Retorna estatísticas do banco de questões
router.get('/status', async (req, res) => {
    try {
        const total = await Questao.countDocuments();
        const porMateria = await Questao.aggregate([
            { $group: { _id: '$materia', total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        res.json({ total, porMateria });
    } catch (err) {
        console.error('Erro ao consultar status das questões:', err);
        res.status(500).json({ erro: 'Erro ao consultar banco de questões.' });
    }
});

// Carrega o banco inicial que acompanha o projeto.\n// Também protegido pela ADMIN_API_KEY.\nrouter.post('/importar-iniciais', async (req, res) => {\n    try {\n        const chaveConfigurada = process.env.ADMIN_API_KEY;\n        const chaveEnviada = req.header('x-admin-key');\n\n        if (!chaveConfigurada || !chaveEnviada || chaveEnviada !== chaveConfigurada) {\n            return res.status(401).json({ erro: 'Acesso não autorizado.' });\n        }\n\n        const arquivo = path.join(__dirname, '../dados/questoes-iniciais.json');\n        const dados = JSON.parse(await fs.readFile(arquivo, 'utf8'));\n\n        if (!Array.isArray(dados.questoes) || dados.questoes.length === 0) {\n            return res.status(400).json({ erro: 'O banco inicial está vazio ou inválido.' });\n        }\n\n        req.body.questoes = dados.questoes;\n\n        const normalizadas = dados.questoes.map(q => ({\n            id: Number(q.id), ano: q.ano != null ? Number(q.ano) : undefined,\n            materia: String(q.materia || '').trim(), subtopico: String(q.subtopico || '').trim(),\n            texto_apoio: String(q.texto_apoio || '').trim(), enunciado: String(q.enunciado || '').trim(),\n            alternativas: Array.isArray(q.alternativas) ? q.alternativas.map(a => String(a).trim()) : [],\n            correta: Number(q.correta), explicacao: String(q.explicacao || '').trim()\n        }));\n\n        for (const q of normalizadas) {\n            if (!Number.isInteger(q.id) || !q.enunciado || q.alternativas.length !== 5 || !Number.isInteger(q.correta) || q.correta < 0 || q.correta > 4) {\n                return res.status(400).json({ erro: 'O banco inicial contém uma questão inválida.', questao: q.id });\n            }\n        }\n\n        const resultado = await Questao.bulkWrite(normalizadas.map(q => ({\n            updateOne: { filter: { id: q.id }, update: { $set: q }, upsert: true }\n        })), { ordered: false });\n\n        res.json({ sucesso: true, recebidas: normalizadas.length, inseridas: resultado.upsertedCount, atualizadas: resultado.modifiedCount, mensagem: 'Banco inicial carregado com sucesso.' });\n    } catch (err) {\n        console.error('Erro ao carregar banco inicial:', err);\n        res.status(500).json({ erro: 'Erro ao carregar banco inicial.' });\n    }\n});\n\n// Importação em lote.
// Segurança: exige a variável ADMIN_API_KEY configurada no Render
// e o header: x-admin-key: SUA_CHAVE.
router.post('/importar', async (req, res) => {
    try {
        const chaveConfigurada = process.env.ADMIN_API_KEY;
        const chaveEnviada = req.header('x-admin-key');

        if (!chaveConfigurada || !chaveEnviada || chaveEnviada !== chaveConfigurada) {
            return res.status(401).json({ erro: 'Acesso não autorizado.' });
        }

        const { questoes } = req.body;

        if (!Array.isArray(questoes) || questoes.length === 0) {
            return res.status(400).json({
                erro: 'Envie um array de questões no campo "questoes".'
            });
        }

        const normalizadas = questoes.map((q, indice) => ({
            id: Number(q.id),
            ano: q.ano !== undefined && q.ano !== null ? Number(q.ano) : undefined,
            materia: String(q.materia || '').trim(),
            subtopico: String(q.subtopico || '').trim(),
            texto_apoio: String(q.texto_apoio || '').trim(),
            enunciado: String(q.enunciado || '').trim(),
            alternativas: Array.isArray(q.alternativas)
                ? q.alternativas.map(a => String(a).trim())
                : [],
            correta: Number(q.correta),
            explicacao: String(q.explicacao || '').trim()
        }));

        for (let i = 0; i < normalizadas.length; i++) {
            const q = normalizadas[i];

            if (!Number.isInteger(q.id)) {
                return res.status(400).json({ erro: `Questão na posição ${i + 1}: "id" deve ser um número inteiro.` });
            }

            if (!q.enunciado) {
                return res.status(400).json({ erro: `Questão ${q.id}: "enunciado" é obrigatório.` });
            }

            if (q.alternativas.length !== 5) {
                return res.status(400).json({ erro: `Questão ${q.id}: informe exatamente 5 alternativas.` });
            }

            if (!Number.isInteger(q.correta) || q.correta < 0 || q.correta > 4) {
                return res.status(400).json({
                    erro: `Questão ${q.id}: "correta" deve ser 0, 1, 2, 3 ou 4.`
                });
            }
        }

        const ids = normalizadas.map(q => q.id);
        const idsDuplicados = ids.filter((id, index) => ids.indexOf(id) !== index);

        if (idsDuplicados.length) {
            return res.status(400).json({
                erro: 'Existem IDs duplicados no arquivo.',
                ids: [...new Set(idsDuplicados)]
            });
        }

        const operacoes = normalizadas.map(q => ({
            updateOne: {
                filter: { id: q.id },
                update: { $set: q },
                upsert: true
            }
        }));

        const resultado = await Questao.bulkWrite(operacoes, { ordered: false });

        res.json({
            sucesso: true,
            recebidas: normalizadas.length,
            inseridas: resultado.upsertedCount,
            atualizadas: resultado.modifiedCount,
            mensagem: 'Questões importadas/atualizadas com sucesso.'
        });
    } catch (err) {
        console.error('Erro na importação de questões:', err);
        res.status(500).json({
            erro: 'Erro ao importar questões.',
            detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Valida a resposta e computa a premiação de XP no banco
router.post('/responder', async (req, res) => {
    const { email, questaoId, alternativaSelecionada, tempoEsgotado } = req.body;

    try {
        const questao = await Questao.findOne({ id: questaoId });
        const usuario = await Usuario.findOne({ email });

        if (!questao || !usuario) {
            return res.status(404).json({
                erro: 'Dados cadastrais ou questão não encontrados.'
            });
        }

        const acertou = Number(questao.correta) === Number(alternativaSelecionada);
        let xpGanho = 0;

        if (acertou) {
            xpGanho = tempoEsgotado ? 10 : 20;
            usuario.xp += xpGanho;
            await usuario.save();
        }

        res.json({
            correto: acertou,
            gabarito: questao.correta,
            novoXP: usuario.xp,
            xpGanho,
            explicacao: questao.explicacao
        });
    } catch (err) {
        console.error('Erro ao processar resposta:', err);
        res.status(500).json({ erro: 'Erro ao processar computação de pontuação.' });
    }
});

module.exports = router;
