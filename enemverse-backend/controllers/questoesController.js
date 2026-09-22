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

// Carrega o banco inicial que acompanha o projeto.
// Também protegido pela ADMIN_API_KEY.
router.post('/importar-iniciais', async (req, res) => {
    try {
        const chaveConfigurada = process.env.ADMIN_API_KEY;
        const chaveEnviada = req.header('x-admin-key');

        if (!chaveConfigurada || !chaveEnviada || chaveEnviada !== chaveConfigurada) {
            return res.status(401).json({ erro: 'Acesso não autorizado.' });
        }

        const arquivo = path.join(__dirname, '../dados/questoes-iniciais.json');
        const dados = JSON.parse(await fs.readFile(arquivo, 'utf8'));

        if (!Array.isArray(dados.questoes) || dados.questoes.length === 0) {
            return res.status(400).json({ erro: 'O banco inicial está vazio ou inválido.' });
        }

        const normalizadas = dados.questoes.map(q => ({
            id: Number(q.id),
            ano: q.ano != null ? Number(q.ano) : undefined,
            materia: String(q.materia || '').trim(),
            subtopico: String(q.subtopico || '').trim(),
            texto_apoio: String(q.texto_apoio || '').trim(),
            enunciado: String(q.enunciado || '').trim(),
            alternativas: Array.isArray(q.alternativas) ? q.alternativas.map(a => String(a).trim()) : [],
            correta: Number(q.correta),
            explicacao: String(q.explicacao || '').trim()
        }));

        for (const q of normalizadas) {
            if (!Number.isInteger(q.id) || !q.materia || !q.enunciado ||
                q.alternativas.length !== 5 || !Number.isInteger(q.correta) ||
                q.correta < 0 || q.correta > 4) {
                return res.status(400).json({
                    erro: 'O banco inicial contém uma questão inválida.',
                    questao: q.id
                });
            }
        }

        const resultado = await Questao.bulkWrite(
            normalizadas.map(q => ({
                updateOne: {
                    filter: { id: q.id },
                    update: { $set: q },
                    upsert: true
                }
            })),
            { ordered: false }
        );

        res.json({
            sucesso: true,
            recebidas: normalizadas.length,
            inseridas: resultado.upsertedCount,
            atualizadas: resultado.modifiedCount,
            mensagem: 'Banco inicial carregado com sucesso.'
        });
    } catch (err) {
        console.error('Erro ao carregar banco inicial:', err);
        res.status(500).json({
            erro: 'Erro ao carregar banco inicial.',
            detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Operações administrativas para gerenciar questões individualmente.
function validarAdmin(req, res) {
    const chaveConfigurada = process.env.ADMIN_API_KEY;
    const chaveEnviada = req.header('x-admin-key');
    if (!chaveConfigurada || !chaveEnviada || chaveEnviada !== chaveConfigurada) {
        res.status(401).json({ erro: 'Acesso não autorizado.' });
        return false;
    }
    return true;
}
function normalizarQuestao(q) {
    return {
        id: Number(q.id),
        ano: q.ano !== undefined && q.ano !== null && q.ano !== '' ? Number(q.ano) : undefined,
        materia: String(q.materia || '').trim(),
        subtopico: String(q.subtopico || '').trim(),
        texto_apoio: String(q.texto_apoio || '').trim(),
        enunciado: String(q.enunciado || '').trim(),
        alternativas: Array.isArray(q.alternativas) ? q.alternativas.map(a => String(a).trim()) : [],
        correta: Number(q.correta),
        explicacao: String(q.explicacao || '').trim()
    };
}
function erroValidacao(q) {
    if (!Number.isInteger(q.id) || q.id <= 0) return '"id" deve ser um número inteiro positivo.';
    if (!q.materia) return '"materia" é obrigatória.';
    if (!q.enunciado) return '"enunciado" é obrigatório.';
    if (q.alternativas.length !== 5 || q.alternativas.some(a => !a)) return 'Informe exatamente 5 alternativas preenchidas.';
    if (!Number.isInteger(q.correta) || q.correta < 0 || q.correta > 4) return '"correta" deve ser 0, 1, 2, 3 ou 4.';
    return null;
}
router.get('/admin/listar', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const busca = String(req.query.busca || '').trim();
        const materia = String(req.query.materia || '').trim();
        const filtro = {};
        if (materia) filtro.materia = materia;
        if (busca) {
            const regex = new RegExp(busca, 'i');
            const numero = Number(busca);
            filtro.$or = [
                { enunciado: regex }, { subtopico: regex }, { materia: regex },
                ...(Number.isInteger(numero) ? [{ id: numero }] : [])
            ];
        }
        const questoes = await Questao.find(filtro).sort({ id: 1 }).lean();
        res.json({ total: questoes.length, questoes });
    } catch (err) {
        console.error('Erro ao listar questões no admin:', err);
        res.status(500).json({ erro: 'Erro ao listar questões.' });
    }
});
router.post('/admin', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const q = normalizarQuestao(req.body);
        const erro = erroValidacao(q);
        if (erro) return res.status(400).json({ erro });
        if (await Questao.exists({ id: q.id })) return res.status(409).json({ erro: 'Já existe uma questão com este ID.' });
        const criada = await Questao.create(q);
        res.status(201).json({ sucesso: true, mensagem: 'Questão cadastrada com sucesso.', questao: criada });
    } catch (err) {
        console.error('Erro ao cadastrar questão:', err);
        res.status(500).json({ erro: 'Erro ao cadastrar questão.' });
    }
});
router.put('/admin/:id', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const idAtual = Number(req.params.id);
        if (!Number.isInteger(idAtual)) return res.status(400).json({ erro: 'ID inválido.' });
        const q = normalizarQuestao(req.body);
        const erro = erroValidacao(q);
        if (erro) return res.status(400).json({ erro });
        if (q.id !== idAtual && await Questao.exists({ id: q.id })) return res.status(409).json({ erro: 'Já existe outra questão com o novo ID.' });
        const atualizada = await Questao.findOneAndUpdate({ id: idAtual }, { $set: q }, { new: true, runValidators: true });
        if (!atualizada) return res.status(404).json({ erro: 'Questão não encontrada.' });
        res.json({ sucesso: true, mensagem: 'Questão atualizada com sucesso.', questao: atualizada });
    } catch (err) {
        console.error('Erro ao atualizar questão:', err);
        res.status(500).json({ erro: 'Erro ao atualizar questão.' });
    }
});
router.delete('/admin/:id', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ erro: 'ID inválido.' });
        const removida = await Questao.findOneAndDelete({ id });
        if (!removida) return res.status(404).json({ erro: 'Questão não encontrada.' });
        res.json({ sucesso: true, mensagem: 'Questão excluída com sucesso.' });
    } catch (err) {
        console.error('Erro ao excluir questão:', err);
        res.status(500).json({ erro: 'Erro ao excluir questão.' });
    }
});

// Importação em lote.
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
