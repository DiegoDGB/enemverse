// Converte a extração bruta em registros de revisão. Nunca importe este arquivo.
const fs = require('node:fs');
const path = require('node:path');

const backend = path.resolve(__dirname, '..');
const areas = [
  ['Linguagens, Códigos e suas Tecnologias', 'Linguagens'],
  ['Ciências Humanas e suas Tecnologias', 'Ciências Humanas'],
  ['Ciências da Natureza e suas Tecnologias', 'Ciências da Natureza'],
  ['Matemática e suas Tecnologias', 'Matemática']
];

function limpar(texto) {
  return texto.split('\n').filter(l =>
    !/\.ind[bd]\b|^\s*P\d_\d_Dia_|^\s*\d{6}AZ\b|^\s*\*\d{6}AZ|[•].*DIA.*CADERNO|^\s*Questões de 01 a 05 \(opção espanhol\)|^\s*\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\s*$/i.test(l)
  ).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function dividir(texto) {
  const linhas = texto.split('\n');
  const marcadores = [];
  linhas.forEach((linha, i) => {
    if (/^[A-E](?:\s|$)/.test(linha)) marcadores.push({ letra: linha[0], indice: i });
  });
  // A–E podem aparecer em gráficos e tabelas; selecione somente a última sequência.
  let trecho = null;
  for (let i = 0; i <= marcadores.length - 5; i++) {
    if (marcadores.slice(i, i + 5).map(m => m.letra).join('') === 'ABCDE') trecho = marcadores.slice(i, i + 5);
  }
  if (!trecho) return { apoio: texto, alternativas: [], pendencias: ['alternativas_nao_separadas'] };
  const apoio = linhas.slice(0, trecho[0].indice).join('\n').trim();
  const alternativas = trecho.map((m, i) => linhas.slice(m.indice, trecho[i + 1]?.indice ?? linhas.length)
    .join('\n').replace(/^[A-E]\s*/, '').trim());
  const pendencias = [];
  if (alternativas.some(a => !a)) pendencias.push('alternativa_vazia');
  if (/[\x00-\x08\x0b\x0e-\x1f]/.test(texto)) pendencias.push('notacao_corrompida');
  if (alternativas.some(a => /\n\s*[+×÷=−!\d]+\s*\n/.test(a))) pendencias.push('formula_ou_tabela');
  return { apoio, alternativas, pendencias };
}

function montar(rascunho, gabarito, manifesto) {
  const registros = [];
  for (const q of rascunho.questoes) {
    const numero = q.numero_enem;
    const dia = manifesto.dias.find(d => numero >= d.numeroInicial && numero <= d.numeroFinal);
    const chave = gabarito.respostas[String(numero)];
    if (!dia || !chave) throw new Error(`Origem ou gabarito ausente para ${numero}`);
    const original = q.textoExtraido;
    const limpo = limpar(original).replace(/^QUESTÃO\s+\d+\s*\n/, '');
    const { apoio, alternativas, pendencias } = dividir(limpo);
    if (limpo !== original.replace(/^QUESTÃO\s+\d+\s*\n/, '').trim()) pendencias.push('rodape_removido');
    const [area, materia] = areas[Math.floor((numero - 1) / 45)];
    registros.push({
      id: manifesto.ano * 1000 + numero, origem: 'ENEM_OFICIAL', ano: manifesto.ano,
      numero_enem: numero, dia: dia.dia, caderno: dia.caderno, aplicacao: 'Regular',
      lingua_estrangeira: numero <= 5 ? 'Inglês' : 'Não se aplica',
      fonte: 'ENEM 2024 - INEP', fonte_url: dia.prova, area_enem: area,
      materia, subtopico: '', dificuldade: 'Média', texto_apoio: apoio,
      enunciado: '', alternativas, midias: [], anulada: chave === 'ANULADA',
      correta: chave === 'ANULADA' ? null : 'ABCDE'.indexOf(chave), explicacao: '',
      _revisao: { aprovada: false, paginaPdf: q.paginaPdf, pendencias: ['separar_enunciado_do_texto_apoio', 'comparar_com_pdf', 'verificar_figuras', ...pendencias] }
    });
  }
  if (registros.length !== 180 || new Set(registros.map(q => q.numero_enem)).size !== 180) {
    throw new Error('O rascunho deve conter 180 números distintos.');
  }
  return { aviso: 'RASCUNHO NÃO IMPORTÁVEL: enunciado, imagens, tabelas e fórmulas exigem revisão visual.', questoes: registros };
}

if (require.main === module) {
  const base = path.join(backend, 'fontes-pdf');
  const r = JSON.parse(fs.readFileSync(path.join(base, 'rascunho-2024-azul.json')));
  const g = JSON.parse(fs.readFileSync(path.join(backend, 'dados', 'gabarito-2024-azul.json')));
  const m = JSON.parse(fs.readFileSync(path.join(backend, 'dados', 'fontes-enem-2024-azul.json')));
  const lote = montar(r, g, m);
  const destino = path.join(base, 'revisao-2024-azul.json');
  fs.writeFileSync(destino, JSON.stringify(lote, null, 2) + '\n');
  console.log(`Rascunho de revisão: ${lote.questoes.length} registros em ${destino}. Importação bloqueada.`);
}

module.exports = { limpar, dividir, montar };
