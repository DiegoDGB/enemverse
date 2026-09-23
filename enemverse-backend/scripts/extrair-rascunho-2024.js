// Gera rascunhos revisáveis dos PDFs oficiais. Nunca gera um lote pronto para importação.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function separarQuestoes(texto, dia) {
    const inicio = dia === 1 ? 1 : 91;
    const fim = dia === 1 ? 90 : 180;
    const saida = [];
    const paginas = texto.split('\f');
    paginas.forEach((pagina, indicePagina) => {
        const regex = /(?:QUEST(?:Ã|A)O|QUESTAO)\s*(\d{1,3})(?!\d)/gi;
        const marcadores = [...pagina.matchAll(regex)].filter(m => Number(m[1]) >= inicio && Number(m[1]) <= fim);
        marcadores.forEach((m, indice) => {
            const proximo = marcadores[indice + 1]?.index ?? pagina.length;
            saida.push({
                numero_enem: Number(m[1]),
                dia,
                paginaPdf: indicePagina + 1,
                textoExtraido: pagina.slice(m.index, proximo).trim(),
                revisado: false
            });
        });
    });
    return saida;
}

function extrairCaderno(arquivo, dia) {
    const texto = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', arquivo, '-'], {
        encoding: 'utf8', maxBuffer: 32 * 1024 * 1024
    });
    return separarQuestoes(texto, dia);
}

if (require.main === module) {
    const [pdfDia1, pdfDia2] = process.argv.slice(2);
    if (!pdfDia1 || !pdfDia2) {
        console.error('Uso: node scripts/extrair-rascunho-2024.js fontes-pdf/2024_dia1_azul.pdf fontes-pdf/2024_dia2_azul.pdf');
        process.exitCode = 2;
    } else {
        try {
            const extraidas = [...extrairCaderno(pdfDia1, 1), ...extrairCaderno(pdfDia2, 2)];
            const porNumero = new Map();
            for (const q of extraidas) porNumero.set(q.numero_enem, [...(porNumero.get(q.numero_enem) || []), q]);
            const ausentes = Array.from({ length: 180 }, (_, i) => i + 1).filter(n => !porNumero.has(n));
            const duplicadas = [...porNumero].filter(([, q]) => q.length > 1).map(([n]) => n);
            const saida = path.join(__dirname, '..', 'fontes-pdf', 'rascunho-2024-azul.json');
            fs.mkdirSync(path.dirname(saida), { recursive: true });
            fs.writeFileSync(saida, JSON.stringify({
                aviso: 'Extração automática sujeita a erros de colunas, fórmulas e imagens. Não importar este rascunho.',
                extraidas: extraidas.length, ausentes, duplicadas, questoes: extraidas
            }, null, 2));
            console.log(`Rascunho: ${saida}. Marcadores: ${extraidas.length}; ausentes: ${ausentes.length}; duplicadas: ${duplicadas.length}.`);
            if (ausentes.length || duplicadas.length) process.exitCode = 1;
        } catch (err) {
            console.error('Falha ao extrair PDFs: ' + err.message);
            process.exitCode = 1;
        }
    }
}
module.exports = { separarQuestoes };
