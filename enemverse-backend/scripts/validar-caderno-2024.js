// Valida um caderno oficial ANTES de qualquer importação ao MongoDB.
const fs = require('node:fs');
const path = require('node:path');
const LETRAS = ['A', 'B', 'C', 'D', 'E'];
const AREAS = [
  'Linguagens, Códigos e suas Tecnologias',
  'Ciências Humanas e suas Tecnologias',
  'Ciências da Natureza e suas Tecnologias',
  'Matemática e suas Tecnologias'
];

function validarLote(manifesto, dados, gabarito, raizProjeto) {
  const erros = [];
  const questoes = dados?.questoes;
  const respostas = gabarito?.respostas;
  if (!Array.isArray(questoes)) return ['O arquivo de questões deve conter o array "questoes".'];
  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) {
    return ['O gabarito revisado deve conter o objeto "respostas" (número: A, B, C, D, E ou ANULADA).'];
  }
  if (questoes.length !== manifesto.questoesEsperadas) {
    erros.push(`Esperadas ${manifesto.questoesEsperadas} questões; recebidas ${questoes.length}.`);
  }
  if (Object.keys(respostas).length !== manifesto.questoesEsperadas) {
    erros.push('O gabarito deve conter exatamente uma entrada para cada questão.');
  }
  const vistos = new Set();
  const prefixoAssets = path.resolve(raizProjeto, 'assets', 'enem', String(manifesto.ano), 'azul') + path.sep;
  for (const q of questoes) {
    const numero = Number(q.numero_enem);
    if (!Number.isInteger(numero) || numero < 1 || numero > 180 || vistos.has(numero)) {
      erros.push(`Número ausente, duplicado ou inválido: ${q.numero_enem}.`);
      continue;
    }
    vistos.add(numero);
    const dia = manifesto.dias.find(d => numero >= d.numeroInicial && numero <= d.numeroFinal);
    const areaEsperada = AREAS[Math.floor((numero - 1) / 45)];
    if (q.id !== manifesto.ano * 1000 + numero) erros.push(`Questão ${numero}: ID incorreto.`);
    if (q.ano !== manifesto.ano || q.dia !== dia?.dia || q.caderno !== dia?.caderno ||
        q.aplicacao !== 'Regular' || q.origem !== 'ENEM_OFICIAL') {
      erros.push(`Questão ${numero}: metadados de origem/ano/dia/caderno inconsistentes.`);
    }
    if (q.area_enem !== areaEsperada) erros.push(`Questão ${numero}: área ENEM incorreta.`);
    if (q.fonte_url !== dia?.prova) erros.push(`Questão ${numero}: link da prova oficial ausente/incorreto.`);
    if (numero <= 5 && q.lingua_estrangeira !== manifesto.idiomaQuestoes1a5) {
      erros.push(`Questão ${numero}: idioma deve ser ${manifesto.idiomaQuestoes1a5}.`);
    }
    if (typeof q.enunciado !== 'string' || !q.enunciado.trim() ||
        !Array.isArray(q.alternativas) || q.alternativas.length !== 5 ||
        q.alternativas.some(a => typeof a !== 'string' || !a.trim())) {
      erros.push(`Questão ${numero}: enunciado/alternativas incompletos.`);
    }
    const chave = respostas[String(numero)];
    if (![...LETRAS, 'ANULADA'].includes(chave)) {
      erros.push(`Questão ${numero}: resposta oficial não preenchida.`);
    } else if (q.anulada !== (chave === 'ANULADA') ||
               (chave === 'ANULADA' ? q.correta !== null : q.correta !== LETRAS.indexOf(chave))) {
      erros.push(`Questão ${numero}: gabarito do JSON diverge do gabarito revisado.`);
    }
    if (!Array.isArray(q.midias)) {
      erros.push(`Questão ${numero}: campo "midias" ausente.`);
    } else for (const midia of q.midias) {
      if (typeof midia.url !== 'string' || !midia.url.startsWith('/assets/enem/')) {
        erros.push(`Questão ${numero}: caminho de imagem inválido.`);
        continue;
      }
      const caminho = path.resolve(raizProjeto, '.' + midia.url);
      if (!caminho.startsWith(prefixoAssets) || !fs.existsSync(caminho)) {
        erros.push(`Questão ${numero}: arquivo de imagem não encontrado em ${midia.url}.`);
      }
    }
  }
  for (let numero = 1; numero <= 180; numero++) {
    if (!vistos.has(numero)) erros.push(`Questão ${numero} ausente.`);
  }
  if (!manifesto.revisaoVisualAprovada) {
    erros.push('Revisão visual manual pendente: confira textos, fórmulas e figuras contra as provas do INEP.');
  }
  return erros;
}

if (require.main === module) {
  const [arquivoQuestoes, arquivoGabarito] = process.argv.slice(2);
  if (!arquivoQuestoes || !arquivoGabarito) {
    console.error('Uso: node scripts/validar-caderno-2024.js dados/enem-2024-azul.json dados/gabarito-2024-azul.json');
    process.exitCode = 2;
  } else {
    try {
      const raizBackend = path.resolve(__dirname, '..');
      const raizProjeto = path.resolve(raizBackend, '..');
      const manifesto = JSON.parse(fs.readFileSync(path.join(raizBackend, 'dados', 'fontes-enem-2024-azul.json'), 'utf8'));
      const dados = JSON.parse(fs.readFileSync(path.resolve(raizBackend, arquivoQuestoes), 'utf8'));
      const gabarito = JSON.parse(fs.readFileSync(path.resolve(raizBackend, arquivoGabarito), 'utf8'));
      const erros = validarLote(manifesto, dados, gabarito, raizProjeto);
      if (erros.length) {
        console.error(`Lote NÃO aprovado: ${erros.length} problema(s).`);
        for (const erro of erros) console.error('- ' + erro);
        process.exitCode = 1;
      } else {
        console.log('Lote 2024 validado: 180 questões, gabarito e mídias conferidos. Importação ainda não executada.');
      }
    } catch (erro) {
      console.error('Falha ao ler o lote: ' + erro.message);
      process.exitCode = 1;
    }
  }
}

module.exports = { validarLote };
