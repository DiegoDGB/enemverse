# Fase 3 — ENEM 2024, cadernos azuis

Fonte: página [Provas e Gabaritos de 2024 do INEP](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2024).

Este lote usará caderno **1 Azul** (dia 1, questões 1–90) e **7 Azul** (dia 2, questões 91–180), aplicação regular, idioma **Inglês** nas questões 1–5. Os quatro PDFs estão identificados em `fontes-enem-2024-azul.json`.

## Estado

- As quatro fontes oficiais foram recebidas; o validador está pronto.
- O gabarito oficial foi transcrito em `gabarito-2024-azul.json`: 180 respostas, questões 1–5 em Inglês e questão 129 anulada. As duas tabelas foram conferidas visualmente contra os PDFs.
- A extração preliminar das provas encontra todos os 180 números; o dia 1 também contém uma segunda versão das questões 1–5 em Espanhol. **Os enunciados, alternativas, figuras e fórmulas ainda precisam de transcrição e revisão visual antes da importação.**
- `revisaoVisualAprovada` permanece `false` para bloquear a aprovação prematura.
- Foram reconstruídas e armazenadas em doze lotes as questões 1–150, com imagens associadas e comparação dos índices de resposta ao gabarito oficial. Faltam 151–180 e a revisão final do caderno completo.
- Nenhuma alteração foi feita na `main` nem nos bancos por esta etapa.


## Auditoria do rascunho extraído

- Cobertura: 180 números exclusivos (1–180), sem ausência; o gabarito tem 180 entradas e marca a 129 como anulada. Isso **não equivale a 180 questões conferidas**.
- 57 registros contêm rodapés ou marcas da editoração anexados ao texto; 13 têm pelo menos uma alternativa cuja linha começa somente com a letra, comum em expressões matemáticas; 4 contêm caracteres de controle. As categorias se sobrepõem: 64 registros têm ao menos um desses sinais automáticos de revisão.
- Conferência visual por amostragem: a questão 1 exige a imagem com as citações, ausente na extração textual; 177 e 178 trazem tabelas; as fórmulas das alternativas da 180 não são reconstruídas de forma legível pelo PDF em texto. A questão 154 inclui letras A–E dentro do próprio material da questão, de modo que separar alternativas pela primeira letra encontrada daria resultado errado.
- Prioridade: recortar e associar imagens/tabelas aos números corretos, reconstruir fórmulas e alternativas, remover marcas editoriais e comparar cada registro com a página original. Depois executar o validador e testar apenas no banco DEV. A revisão visual permanece pendente.

## Próximo lote de trabalho

1. Baixar as duas provas oficiais para a pasta local `enemverse-backend/fontes-pdf/` com os nomes `2024_dia1_azul.pdf` e `2024_dia2_azul.pdf` (links no manifesto). Essa pasta é ignorada pelo Git.
2. Executar `node scripts/extrair-rascunho-2024.js fontes-pdf/2024_dia1_azul.pdf fontes-pdf/2024_dia2_azul.pdf` dentro de `enemverse-backend`. O resultado fica em `fontes-pdf/rascunho-2024-azul.json` e **não pode ser importado**. Com os PDFs recebidos, foram extraídos 180 marcadores exclusivos, sem números ausentes; nas questões 1–5 o script seleciona Inglês. Trechos com imagens e notação matemática precisam ser reconstruídos manualmente.
3. Extrair e revisar os dois PDFs em registros com os mesmos campos de `enem-2025-azul.json`, acrescentando `origem: "ENEM_OFICIAL"` e `fonte_url` da prova respectiva.
4. Usar `gabarito-2024-azul.json` como gabarito independente; a questão 129 traz `"ANULADA"`. Não inferir respostas a partir do texto da questão.
5. Guardar as imagens referenciadas em `assets/enem/2024/azul/` e revisar texto, fórmulas, alternativas e imagens página a página.
6. Após conferência independente, marcar `revisaoVisualAprovada: true` no manifesto e executar, dentro de `enemverse-backend`:
   `node scripts/validar-caderno-2024.js dados/enem-2024-azul.json dados/gabarito-2024-azul.json`
7. Importar somente no MongoDB DEV após a validação completa; conferir contagens, filtros, enunciados e respostas no Preview. A promoção para a produção exigirá uma etapa posterior.

O validador verifica IDs exclusivos 2024001–2024180, dias/cadernos/áreas, origem, 5 alternativas, gabarito correspondente, imagens presentes e revisão visual aprovada. A revisão humana continua necessária para confirmar a fidelidade ao PDF.
