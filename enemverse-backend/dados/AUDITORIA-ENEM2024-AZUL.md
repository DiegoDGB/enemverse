# Comparação com as provas oficiais — ENEM 2024 Azul

Data da auditoria: 24/09/2026. Fontes: cadernos impressos 1 Azul (primeiro dia, Inglês) e 7 Azul (segundo dia), mais os dois gabaritos oficiais do INEP. PDFs de origem não entram no repositório.

## Resultado da conferência automatizada

- Os 180 enunciados foram localizados nos PDFs das provas; o início do texto de apoio de cada registro também foi localizado na mesma página.
- As 450 alternativas textuais do primeiro dia (questões 1–90) coincidem com o texto extraído do PDF.
- As 180 respostas foram extraídas novamente dos PDFs de gabarito e comparadas com `gabarito-2024-azul.json`, incluindo as questões 1–5 em Inglês e a 129 anulada. Nenhuma divergência.
- As 180 questões têm cinco alternativas não vazias. As 96 referências de imagem apontam para arquivos existentes.
- A alternativa E da questão 45 continha por engano o título da seção seguinte; foi conferida visualmente no PDF e corrigida para “propagação de mensagens com objetivos políticos.”
- O script `scripts/auditar-caderno-2024-pdf.py` reproduz a comparação com quatro caminhos locais de PDFs, na ordem prova do dia 1, prova do dia 2, gabarito do dia 1 e gabarito do dia 2. Resultado atual: zero divergências automáticas.

## Revisão visual concluída

A conferência das páginas confirmou fórmulas, gráficos, tabelas e alternativas desenhadas. Os 72 JPEGs referenciados são idênticos aos objetos de imagem embutidos nos PDFs oficiais. Os 24 arquivos PNG foram inspecionados como recortes de figuras ou tabelas; a tabela da questão 139 estava truncada e foi substituída pelo recorte completo das duas lojas. Também foram ajustados os recortes das questões 121, 169, 170 e 171 para manter todas as alternativas legíveis. As questões 112, 121, 127, 131, 161, 168 e 174 preservam as alternativas ilustradas com seus rótulos A–E.

A revisão visual foi aprovada no manifesto. A importação continua dependendo de operação separada e de testes no serviço e no banco DEV. Nenhuma escrita em banco foi feita por esta auditoria; a `main` e a produção não foram alteradas.
