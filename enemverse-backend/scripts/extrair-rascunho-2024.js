// Extrai texto preliminar dos PDFs oficiais; não produz lote importável.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function limparPagina(pagina) {
  return pagina.split('\n').filter(linha =>
    !/(?:ENEM2024){3,}/.test(linha) &&
    !/^\s*(?:\d+|CADERNO \d+|AZUL|ENEM 2024)\s*$/.test(linha)
  ).join('\n');
}

function separarQuestoes(texto, dia) {
  const inicio = dia === 1 ? 1 : 91;
  const fim = dia === 1 ? 90 : 180;
  const questoes = [];
  const vistos = new Set();
  let atual = null;
  texto.split('\f').forEach((paginaOriginal, indice) => {
    const pagina = limparPagina(paginaOriginal);
    const marcadores = [...pagina.matchAll(/^QUESTÃO\s+(\d{1,3})\s*$/gm)]
      .filter(m => Number(m[1]) >= inicio && Number(m[1]) <= fim);
    if (!marcadores.length) return;
    if (atual && marcadores[0].index > 0) {
      atual.textoExtraido += '\n' + pagina.slice(0, marcadores[0].index).trim();
    }
    marcadores.forEach((m, i) => {
      const numero = Number(m[1]);
      // A segunda ocorrência de 1–5 pertence à prova de Espanhol.
      if (dia === 1 && numero <= 5 && vistos.has(numero)) {
        atual = null;
        return;
      }
      const proximo = marcadores[i + 1]?.index ?? pagina.length;
      atual = {
        numero_enem: numero, dia, paginaPdf: indice + 1,
        textoExtraido: pagina.slice(m.index, proximo).trim(), revisado: false
      };
      questoes.push(atual);
      vistos.add(numero);
    });
  });
  return questoes;
}

function extrairCaderno(arquivo, dia) {
  const texto = execFileSync('pdftotext', ['-raw', '-enc', 'UTF-8', arquivo, '-'], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024
  });
  return separarQuestoes(texto, dia);
}

if (require.main === module) {
  const [pdfDia1, pdfDia2] = process.argv.slice(2);
  if (!pdfDia1 || !pdfDia2) {
    console.error('Uso: node scripts/extrair-rascunho-2024.js <prova-dia1.pdf> <prova-dia2.pdf>');
    process.exitCode = 2;
  } else {
    try {
      const questoes = [...extrairCaderno(pdfDia1, 1), ...extrairCaderno(pdfDia2, 2)];
      const frequencia = new Map();
      questoes.forEach(q => frequencia.set(q.numero_enem, (frequencia.get(q.numero_enem) || 0) + 1));
      const ausentes = Array.from({ length: 180 }, (_, i) => i + 1).filter(n => !frequencia.has(n));
      const duplicadas = [...frequencia].filter(([, n]) => n > 1).map(([n]) => n);
      const saida = path.join(__dirname, '..', 'fontes-pdf', 'rascunho-2024-azul.json');
      fs.mkdirSync(path.dirname(saida), { recursive: true });
      fs.writeFileSync(saida, JSON.stringify({
        aviso: 'Extração automática incompleta para imagens, fórmulas, tabelas e texto entre páginas. NÃO IMPORTAR.',
        extraidas: questoes.length, ausentes, duplicadas, questoes
      }, null, 2) + '\n');
      console.log(`Rascunho: ${saida}. Questões: ${questoes.length}; ausentes: ${ausentes.length}; duplicadas: ${duplicadas.length}.`);
      if (ausentes.length || duplicadas.length) process.exitCode = 1;
    } catch (erro) {
      console.error('Falha ao extrair PDFs: ' + erro.message);
      process.exitCode = 1;
    }
  }
}

module.exports = { separarQuestoes };
