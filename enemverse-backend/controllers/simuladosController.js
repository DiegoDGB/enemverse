const express = require('express');
const router = express.Router();
const Questao = require('../models/questao');

const AREAS_ENEM = [
    'Ciências da Natureza e suas Tecnologias',
    'Matemática e suas Tecnologias',
    'Ciências Humanas e suas Tecnologias',
    'Linguagens, Códigos e suas Tecnologias'
];
const DIFICULDADES = ['Fácil', 'Média', 'Difícil'];
const ORIGENS = ['ENEM_OFICIAL', 'AUTORAL'];
const QUANTIDADE_PADRAO = 20;
const QUANTIDADE_MAXIMA = 90;

function textoOpcional(valor) {
    if (valor === undefined || valor === null) return '';
    return String(valor).trim();
}

// Retorna somente metadados necessários para montar os filtros do frontend.
// Não envia enunciados, alternativas, gabaritos ou explicações.
router.get('/filtros', async (req, res) => {
    try {
        const [anos, origensBanco, areasMaterias, dificuldadesBanco] = await Promise.all([
            Questao.distinct('ano', { ano: { $type: 'number' } }),
            Questao.distinct('origem', { origem: { $in: ORIGENS } }),
            Questao.aggregate([
                {
                    $match: {
                        area_enem: { $in: AREAS_ENEM },
                        materia: { $type: 'string', $ne: '' }
                    }
                },
                {
                    $group: {
                        _id: '$area_enem',
                        materias: { $addToSet: '$materia' }
                    }
                }
            ]),
            Questao.distinct('dificuldade', { dificuldade: { $in: DIFICULDADES } })
        ]);

        // Compatibilidade temporária: questões oficiais legadas podem ainda não ter "origem".
        const oficiaisLegadas = await Questao.exists({
            origem: { $exists: false },
            numero_enem: { $exists: true, $ne: null }
        });

        const origens = [...new Set([
            ...origensBanco,
            ...(oficiaisLegadas ? ['ENEM_OFICIAL'] : [])
        ])].sort();

        const mapaAreas = new Map(areasMaterias.map(item => [
            item._id,
            [...item.materias].sort((a, b) => a.localeCompare(b, 'pt-BR'))
        ]));

        const areas = AREAS_ENEM
            .filter(nome => mapaAreas.has(nome))
            .map(nome => ({ nome, materias: mapaAreas.get(nome) }));

        const dificuldades = DIFICULDADES.filter(nivel => dificuldadesBanco.includes(nivel));

        res.json({
            anos: anos.sort((a, b) => b - a),
            origens,
            areas,
            dificuldades
        });
    } catch (err) {
        console.error('Erro ao carregar filtros de simulados:', err);
        res.status(500).json({ erro: 'Erro ao carregar filtros de simulados.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const anoInformado = req.body.ano !== undefined && req.body.ano !== null && req.body.ano !== '';
        const ano = anoInformado ? Number(req.body.ano) : null;
        const area = textoOpcional(req.body.area);
        const materia = textoOpcional(req.body.materia);
        const dificuldade = textoOpcional(req.body.dificuldade);
        const origem = textoOpcional(req.body.origem);
        const quantidadeRecebida = req.body.quantidade === undefined ? QUANTIDADE_PADRAO : Number(req.body.quantidade);

        if (anoInformado && (!Number.isInteger(ano) || ano < 1998 || ano > new Date().getFullYear())) {
            return res.status(400).json({ erro: 'Ano inválido.' });
        }
        if (area && !AREAS_ENEM.includes(area)) {
            return res.status(400).json({ erro: 'Área ENEM inválida.' });
        }
        if (dificuldade && !DIFICULDADES.includes(dificuldade)) {
            return res.status(400).json({ erro: 'Dificuldade inválida.' });
        }
        if (origem && !ORIGENS.includes(origem)) {
            return res.status(400).json({ erro: 'Origem inválida.' });
        }
        if (!Number.isInteger(quantidadeRecebida) || quantidadeRecebida < 1 || quantidadeRecebida > QUANTIDADE_MAXIMA) {
            return res.status(400).json({ erro: `Quantidade deve ser um inteiro entre 1 e ${QUANTIDADE_MAXIMA}.` });
        }

        const filtro = {};
        if (anoInformado) filtro.ano = ano;
        if (area) filtro.area_enem = area;
        if (materia) filtro.materia = materia;
        if (dificuldade) filtro.dificuldade = dificuldade;

        // Compatibilidade durante a migração: o banco atual ainda não possui "origem".
        // Para ENEM_OFICIAL, os registros legados com numero_enem também são oficiais.
        if (origem === 'ENEM_OFICIAL') {
            filtro.$or = [
                { origem: 'ENEM_OFICIAL' },
                { origem: { $exists: false }, numero_enem: { $exists: true, $ne: null } }
            ];
        } else if (origem === 'AUTORAL') {
            filtro.origem = 'AUTORAL';
        }

        const totalDisponivel = await Questao.countDocuments(filtro);
        if (!totalDisponivel) {
            return res.status(404).json({
                erro: 'Nenhuma questão encontrada para os filtros informados.',
                filtros: { ano: anoInformado ? ano : null, area: area || null, materia: materia || null, dificuldade: dificuldade || null, origem: origem || null }
            });
        }

        const quantidade = Math.min(quantidadeRecebida, totalDisponivel);
        const questoes = await Questao.aggregate([
            { $match: filtro },
            { $sample: { size: quantidade } },
            {
                $project: {
                    correta: 0,
                    explicacao: 0,
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0
                }
            }
        ]);

        res.status(201).json({
            sucesso: true,
            quantidade: questoes.length,
            totalDisponivel,
            filtros: {
                ano: anoInformado ? ano : null,
                area: area || null,
                materia: materia || null,
                dificuldade: dificuldade || null,
                origem: origem || null
            },
            questoes
        });
    } catch (err) {
        console.error('Erro ao criar simulado:', err);
        res.status(500).json({ erro: 'Erro ao criar simulado.' });
    }
});

module.exports = router;
