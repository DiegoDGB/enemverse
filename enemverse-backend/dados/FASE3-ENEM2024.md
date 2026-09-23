# Fase 3 — ENEM 2024, cadernos azuis

Fonte: página [Provas e Gabaritos de 2024 do INEP](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2024).

Este lote usará caderno **1 Azul** (dia 1, questões 1–90) e **7 Azul** (dia 2, questões 91–180), aplicação regular, idioma **Inglês** nas questões 1–5. Os quatro PDFs estão identificados em `fontes-enem-2024-azul.json`.

## Estado

- As fontes e o validador estão prontos.
- **Os 180 enunciados, as figuras e o gabarito transcrito ainda não foram conferidos e não estão importados.**
- `revisaoVisualAprovada` permanece `false` para bloquear a aprovação prematura.
- Nenhuma alteração foi feita na `main` nem nos bancos por esta etapa.

## Próximo lote de trabalho

1. Baixar as duas provas oficiais para a pasta local `enemverse-backend/fontes-pdf/` com os nomes `2024_dia1_azul.pdf` e `2024_dia2_azul.pdf` (links no manifesto). Essa pasta é ignorada pelo Git.
2. Executar `node scripts/extrair-rascunho-2024.js fontes-pdf/2024_dia1_azul.pdf fontes-pdf/2024_dia2_azul.pdf` dentro de `enemverse-backend`. O resultado fica em `fontes-pdf/rascunho-2024-azul.json`, **não pode ser importado** e aponta números ausentes e duplicados. O PDF contém questões de Inglês e Espanhol; selecionar somente Inglês para 1–5.
3. Extrair e revisar os dois PDFs em registros com os mesmos campos de `enem-2025-azul.json`, acrescentando `origem: "ENEM_OFICIAL"` e `fonte_url` da prova respectiva.
4. Transcrever separadamente o gabarito oficial para `gabarito-2024-azul.json` no formato `{"respostas":{"1":"A", ...,"180":"E"}}`. Usar `"ANULADA"` quando indicado pelo INEP. Não inferir respostas a partir do texto da questão.
5. Guardar as imagens referenciadas em `assets/enem/2024/azul/` e revisar texto, fórmulas, alternativas e imagens página a página.
6. Após conferência independente, marcar `revisaoVisualAprovada: true` no manifesto e executar, dentro de `enemverse-backend`:
   `node scripts/validar-caderno-2024.js dados/enem-2024-azul.json dados/gabarito-2024-azul.json`
7. Importar somente no MongoDB DEV após a validação completa; conferir contagens, filtros, enunciados e respostas no Preview. A promoção para a produção exigirá uma etapa posterior.

O validador verifica IDs exclusivos 2024001–2024180, dias/cadernos/áreas, origem, 5 alternativas, gabarito correspondente, imagens presentes e revisão visual aprovada. A revisão humana continua necessária para confirmar a fidelidade ao PDF.
