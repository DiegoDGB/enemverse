// Monta uma versão revisável das 180 questões sem liberar a importação.
const fs = require('node:fs');
const path = require('node:path');
const raiz = path.resolve(__dirname, '..');
const questoes = [];
for (let lote = 1; lote <= 14; lote++) {
  const arquivo = path.join(raiz, 'dados', `revisao-enem-2024-azul-lote-${String(lote).padStart(2, '0')}.json`);
  const registros = JSON.parse(fs.readFileSync(arquivo, 'utf8')).questoes;
  if (!Array.isArray(registros)) throw new Error(`Lote inválido: ${arquivo}`);
  questoes.push(...registros);
}
if (questoes.length !== 180 || questoes.some((q, indice) => q.numero_enem !== indice + 1)) {
  throw new Error('Os lotes não cobrem as questões 1–180 em sequência.');
}
const destino = path.join(raiz, 'dados', 'enem-2024-azul.json');
fs.writeFileSync(destino, JSON.stringify({questoes}, null, 2) + '\n');
console.log(`Caderno consolidado: ${questoes.length} questões em ${destino}`);
