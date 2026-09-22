const express = require('express');
const router = express.Router();
const Questao = require('../models/questao');
const Usuario = require('../models/usuario');
const fs = require('fs/promises');
const path = require('path');

// Lista todas as questões disponíveis para o simulado
router.get('/', async (req, res) => {
    try {
        const questoes = await Questao.find().select('-correta -explicacao').sort({ id: 1 }).lean();
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
            numero_enem: q.numero_enem != null ? Number(q.numero_enem) : undefined,
            dia: q.dia != null ? Number(q.dia) : undefined,
            caderno: String(q.caderno || '').trim() || undefined,
            aplicacao: String(q.aplicacao || 'Regular').trim(),
            lingua_estrangeira: String(q.lingua_estrangeira || 'Não se aplica').trim(),
            fonte: String(q.fonte || '').trim() || undefined,
            fonte_url: String(q.fonte_url || '').trim() || undefined,
            area_enem: String(q.area_enem || '').trim() || undefined,
            materia: String(q.materia || '').trim(),
            subtopico: String(q.subtopico || '').trim(),
            dificuldade: String(q.dificuldade || 'Média').trim(),
            texto_apoio: String(q.texto_apoio || '').trim(),
        midias: Array.isArray(q.midias) ? q.midias.filter(m => m && m.url).map(m => ({ tipo: 'imagem', url: String(m.url).trim(), legenda: String(m.legenda || '').trim(), alt: String(m.alt || '').trim() })) : [],
            enunciado: String(q.enunciado || '').trim(),
            alternativas: Array.isArray(q.alternativas) ? q.alternativas.map(a => String(a).trim()) : [],
            anulada: q.anulada === true || q.anulada === 'true',
        correta: (q.anulada === true || q.anulada === 'true') ? null : Number(q.correta),
            explicacao: String(q.explicacao || '').trim()
        }));

        for (const q of normalizadas) {
            if (!Number.isInteger(q.id) || !q.materia || !q.enunciado ||
                q.alternativas.length !== 5 ||
                (!q.anulada && (!Number.isInteger(q.correta) || q.correta < 0 || q.correta > 4))) {
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
        numero_enem: q.numero_enem !== undefined && q.numero_enem !== null && q.numero_enem !== '' ? Number(q.numero_enem) : undefined,
        dia: q.dia !== undefined && q.dia !== null && q.dia !== '' ? Number(q.dia) : undefined,
        caderno: String(q.caderno || '').trim() || undefined,
        aplicacao: String(q.aplicacao || 'Regular').trim(),
        lingua_estrangeira: String(q.lingua_estrangeira || 'Não se aplica').trim(),
        fonte: String(q.fonte || '').trim() || undefined,
        fonte_url: String(q.fonte_url || '').trim() || undefined,
        area_enem: String(q.area_enem || '').trim() || undefined,
        materia: String(q.materia || '').trim(),
        subtopico: String(q.subtopico || '').trim(),
        dificuldade: String(q.dificuldade || 'Média').trim(),
        texto_apoio: String(q.texto_apoio || '').trim(),
        midias: Array.isArray(q.midias) ? q.midias.filter(m => m && m.url).map(m => ({ tipo: 'imagem', url: String(m.url).trim(), legenda: String(m.legenda || '').trim(), alt: String(m.alt || '').trim() })) : [],
        enunciado: String(q.enunciado || '').trim(),
        alternativas: Array.isArray(q.alternativas) ? q.alternativas.map(a => String(a).trim()) : [],
        anulada: q.anulada === true || q.anulada === 'true',
        correta: (q.anulada === true || q.anulada === 'true') ? null : Number(q.correta),
        explicacao: String(q.explicacao || '').trim()
    };
}
function erroValidacao(q) {
    if (!Number.isInteger(q.id) || q.id <= 0) return '"id" deve ser um número inteiro positivo.';
    if (!q.materia) return '"materia" é obrigatória.';
    if (q.dia !== undefined && ![1, 2].includes(q.dia)) return '"dia" deve ser 1 ou 2.';
    if (!['Inglês', 'Espanhol', 'Não se aplica'].includes(q.lingua_estrangeira)) return '"lingua_estrangeira" inválida.';
    if (!q.enunciado) return '"enunciado" é obrigatório.';
    if (!['Fácil', 'Média', 'Difícil'].includes(q.dificuldade)) return '"dificuldade" deve ser Fácil, Média ou Difícil.';
    if (q.alternativas.length !== 5 || q.alternativas.some(a => !a)) return 'Informe exatamente 5 alternativas preenchidas.';
    if (!q.anulada && (!Number.isInteger(q.correta) || q.correta < 0 || q.correta > 4)) return '"correta" deve ser 0, 1, 2, 3 ou 4.';
    return null;
}
router.get('/admin/listar', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const busca = String(req.query.busca || '').trim();
        const materia = String(req.query.materia || '').trim();
        const area = String(req.query.area || '').trim();
        const dificuldade = String(req.query.dificuldade || '').trim();
        const filtro = {};
        if (materia) filtro.materia = materia;
        if (area) filtro.area_enem = area;
        if (dificuldade) filtro.dificuldade = dificuldade;
        if (busca) {
            const regex = new RegExp(busca, 'i');
            const numero = Number(busca);
            filtro.$or = [
                { enunciado: regex }, { subtopico: regex }, { materia: regex }, { area_enem: regex }, { caderno: regex }, { aplicacao: regex }, { fonte: regex },
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

// Migra questões antigas preenchendo automaticamente a Área ENEM pela matéria.
router.post('/admin/migrar-areas', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const mapa = {
            'Biologia': 'Ciências da Natureza e suas Tecnologias',
            'Física': 'Ciências da Natureza e suas Tecnologias',
            'Química': 'Ciências da Natureza e suas Tecnologias',
            'Matemática': 'Matemática e suas Tecnologias',
            'História': 'Ciências Humanas e suas Tecnologias',
            'Geografia': 'Ciências Humanas e suas Tecnologias',
            'Sociologia': 'Ciências Humanas e suas Tecnologias',
            'Filosofia': 'Ciências Humanas e suas Tecnologias',
            'Linguagens': 'Linguagens, Códigos e suas Tecnologias'
        };

        const questoes = await Questao.find({
            $or: [
                { area_enem: { $exists: false } },
                { area_enem: null },
                { area_enem: '' }
            ]
        }).select('id materia area_enem');

        const operacoes = [];
        const semMapeamento = [];

        for (const q of questoes) {
            const area = mapa[q.materia];
            if (!area) {
                semMapeamento.push({ id: q.id, materia: q.materia });
                continue;
            }
            operacoes.push({
                updateOne: {
                    filter: { _id: q._id },
                    update: { $set: { area_enem: area } }
                }
            });
        }

        let atualizadas = 0;
        if (operacoes.length) {
            const resultado = await Questao.bulkWrite(operacoes, { ordered: false });
            atualizadas = resultado.modifiedCount;
        }

        const restantes = await Questao.countDocuments({
            $or: [
                { area_enem: { $exists: false } },
                { area_enem: null },
                { area_enem: '' }
            ]
        });

        res.json({
            sucesso: true,
            encontradas: questoes.length,
            atualizadas,
            restantes,
            semMapeamento,
            mensagem: atualizadas
                ? 'Áreas ENEM migradas com sucesso.'
                : 'Nenhuma questão precisava de migração.'
        });
    } catch (err) {
        console.error('Erro ao migrar áreas ENEM:', err);
        res.status(500).json({ erro: 'Erro ao migrar áreas ENEM.' });
    }
});

// Migra questões antigas sem dificuldade para o nível padrão "Média".
router.post('/admin/migrar-dificuldades', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const filtro = {
            $or: [
                { dificuldade: { $exists: false } },
                { dificuldade: null },
                { dificuldade: '' }
            ]
        };
        const encontradas = await Questao.countDocuments(filtro);
        const resultado = await Questao.updateMany(filtro, { $set: { dificuldade: 'Média' } });
        const restantes = await Questao.countDocuments(filtro);
        res.json({
            sucesso: true,
            encontradas,
            atualizadas: resultado.modifiedCount,
            restantes,
            mensagem: resultado.modifiedCount
                ? 'Dificuldades migradas para Média com sucesso.'
                : 'Nenhuma questão precisava de migração de dificuldade.'
        });
    } catch (err) {
        console.error('Erro ao migrar dificuldades:', err);
        res.status(500).json({ erro: 'Erro ao migrar dificuldades.' });
    }
});

// Classificação inicial das questões existentes por dificuldade.
router.post('/admin/classificar-dificuldades', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const classificacao = {
            1:'Fácil',2:'Fácil',3:'Fácil',4:'Média',5:'Fácil',6:'Média',
            7:'Difícil',8:'Fácil',9:'Fácil',10:'Média',11:'Média',12:'Média',
            13:'Média',14:'Média',15:'Fácil',16:'Fácil',17:'Fácil',18:'Média',
            19:'Média'
        };
        const ids = Object.keys(classificacao).map(Number);
        const existentes = await Questao.find({ id: { $in: ids } }).select('id dificuldade').lean();
        const operacoes = existentes.map(q => ({
            updateOne: {
                filter: { id: q.id },
                update: { $set: { dificuldade: classificacao[q.id] } }
            }
        }));
        const resultado = operacoes.length ? await Questao.bulkWrite(operacoes, { ordered: false }) : { modifiedCount: 0 };
        const distribuicao = await Questao.aggregate([
            { $group: { _id: '$dificuldade', total: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json({
            sucesso:true,
            consideradas: existentes.length,
            atualizadas: resultado.modifiedCount,
            distribuicao,
            mensagem:'Classificação inicial de dificuldade aplicada com sucesso.'
        });
    } catch (err) {
        console.error('Erro ao classificar dificuldades:', err);
        res.status(500).json({ erro:'Erro ao classificar dificuldades.' });
    }
});

// Valida um lote oficial antes da importação definitiva.
router.post('/admin/validar-lote-oficial', async (req, res) => {
    if (!validarAdmin(req, res)) return;
    try {
        const { questoes, ano = 2025 } = req.body;
        if (!Array.isArray(questoes) || !questoes.length) return res.status(400).json({ erro: 'Envie o campo "questoes" com pelo menos uma questão.' });
        const erros = [], avisos = [], numeros = new Map();
        questoes.forEach((raw, i) => {
            const q = normalizarQuestao(raw);
            const prefixo = 'Item ' + (i + 1) + (q.numero_enem ? ' / ENEM ' + q.numero_enem : '');
            const erro = erroValidacao(q); if (erro) erros.push(prefixo + ': ' + erro);
            if (q.ano !== Number(ano)) erros.push(prefixo + ': ano deve ser ' + ano + '.');
            if (!Number.isInteger(q.numero_enem) || q.numero_enem < 1 || q.numero_enem > 180) erros.push(prefixo + ': numero_enem deve estar entre 1 e 180.');
            if (![1,2].includes(q.dia)) erros.push(prefixo + ': dia deve ser 1 ou 2.');
            if (!q.caderno) erros.push(prefixo + ': caderno é obrigatório.');
            if (!q.fonte) erros.push(prefixo + ': fonte é obrigatória.');
            if (!q.fonte_url) avisos.push(prefixo + ': fonte_url não informada.');
            const esperado = q.numero_enem <= 90 ? 1 : 2;
            if (q.numero_enem && q.dia !== esperado) erros.push(prefixo + ': número oficial incompatível com o dia da prova.');
            if (q.numero_enem) numeros.set(q.numero_enem, (numeros.get(q.numero_enem)||0)+1);
        });
        const duplicados=[...numeros].filter(([,n])=>n>1).map(([n])=>n);
        if (duplicados.length) avisos.push('Números oficiais repetidos no lote: '+duplicados.join(', ')+'. Isso só é esperado quando houver versões de língua estrangeira.');
        const presentes=[...numeros.keys()].sort((x,y)=>x-y);
        const faltantes=Array.from({length:180},(_,i)=>i+1).filter(n=>!numeros.has(n));
        res.json({ sucesso: erros.length===0, ano:Number(ano), recebidas:questoes.length, numerosOficiaisUnicos:presentes.length, erros, avisos, faltantes, prontoParaImportar:erros.length===0 });
    } catch(err){ console.error('Erro ao validar lote oficial:',err); res.status(500).json({erro:'Erro ao validar lote oficial.'}); }
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
            numero_enem: q.numero_enem != null ? Number(q.numero_enem) : undefined,
            dia: q.dia != null ? Number(q.dia) : undefined,
            caderno: String(q.caderno || '').trim() || undefined,
            aplicacao: String(q.aplicacao || 'Regular').trim(),
            lingua_estrangeira: String(q.lingua_estrangeira || 'Não se aplica').trim(),
            fonte: String(q.fonte || '').trim() || undefined,
            fonte_url: String(q.fonte_url || '').trim() || undefined,
            area_enem: String(q.area_enem || '').trim() || undefined,
            materia: String(q.materia || '').trim(),
            subtopico: String(q.subtopico || '').trim(),
            dificuldade: String(q.dificuldade || 'Média').trim(),
            texto_apoio: String(q.texto_apoio || '').trim(),
        midias: Array.isArray(q.midias) ? q.midias.filter(m => m && m.url).map(m => ({ tipo: 'imagem', url: String(m.url).trim(), legenda: String(m.legenda || '').trim(), alt: String(m.alt || '').trim() })) : [],
            enunciado: String(q.enunciado || '').trim(),
            alternativas: Array.isArray(q.alternativas)
                ? q.alternativas.map(a => String(a).trim())
                : [],
            anulada: q.anulada === true || q.anulada === 'true',
        correta: (q.anulada === true || q.anulada === 'true') ? null : Number(q.correta),
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

            if (!q.anulada && (!Number.isInteger(q.correta) || q.correta < 0 || q.correta > 4)) {
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

        if (questao.anulada) {
            return res.json({ correto: null, anulada: true, gabarito: null, novoXP: usuario.xp, xpGanho: 0, explicacao: questao.explicacao || 'Questão anulada no gabarito oficial.' });
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
            anulada: false,
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
