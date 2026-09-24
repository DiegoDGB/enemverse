# Comparação com as provas oficiais — ENEM 2024 Azul

Data da auditoria: 24/09/2026. Fontes: cadernos impressos 1 Azul (primeiro dia, Inglês) e 7 Azul (segundo dia), mais os dois gabaritos oficiais do INEP. PDFs de origem não entram no repositório.

## Resultado da conferência automatizada

- Os 180 enunciados foram localizados nos PDFs das provas; o início do texto de apoio de cada registro também foi localizado na mesma página.
- As 450 alternativas textuais do primeiro dia (questões 1–90) coincidem com o texto extraído do PDF.
- As 180 respostas foram extraídas novamente dos PDFs de gabarito e comparadas com `gabarito-2024-azul.json`, incluindo as questões 1–5 em Inglês e a 129 anulada. Nenhuma divergência.
- As 180 questões têm cinco alternativas não vazias. As 96 referências de imagem apontam para arquivos existentes.
- A alternativa E da questão 45 continha por engano o título da seção seguinte; foi conferida visualmente no PDF e corrigida para “propagação de mensagens com objetivos políticos.”
- O script `scripts/auditar-caderno-2024-pdf.py` reproduz a comparação com quatro caminhos locais de PDFs, na ordem prova do dia 1, prova do dia 2, gabarito do dia 1 e gabarito do dia 2. Resultado atual: zero divergências automáticas.

## Revisão visual pendente

A extração textual não confirma fidelidade de fórmulas, desenhos, gráficos e tabelas. O segundo dia contém alternativas desenhadas (112, 121, 127, 131, 161, 168 e 174) e expressões matemáticas recuperadas manualmente (por exemplo, 148, 166, 169, 171, 175 e 180). A existência dos recortes e sua identificação foram conferidas durante a reconstrução; falta uma passagem final integral de fidelidade visual antes de marcar `revisaoVisualAprovada: true`.

O resultado desta auditoria **não autoriza importação**. O manifesto permanece com `revisaoVisualAprovada: false`. Testes no banco DEV e no Preview vêm depois dessa revisão; a `main` e a produção não foram alteradas.
