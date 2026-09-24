# Fase 3 — ENEM 2024, cadernos azuis

Fonte: [Provas e Gabaritos de 2024 do INEP](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2024).

O arquivo `enem-2024-azul.json` contém as 180 questões da aplicação regular: caderno **1 Azul** (primeiro dia, questões 1–90, Inglês nas 1–5) e caderno **7 Azul** (segundo dia, questões 91–180). A questão 129 está anulada. As quatro fontes constam em `fontes-enem-2024-azul.json`.

## Estado em 24/09/2026

- A reconstrução e a revisão visual estão concluídas. A auditoria, os achados e as correções estão documentados em `AUDITORIA-ENEM2024-AZUL.md`.
- O manifesto marca `revisaoVisualAprovada: true`; o validador aprovou os 180 registros, as cinco alternativas por questão, o gabarito e as 96 referências de imagem.
- A comparação automatizada com os quatro PDFs oficiais localizou os 180 enunciados e textos de apoio, as 450 alternativas textuais do primeiro dia e as 180 respostas, sem divergências. Fórmulas e imagens foram conferidas visualmente.
- Nenhuma questão de 2024 foi importada ao banco por esta etapa. A `main` e o banco de produção não foram alterados.

## Validação local

Com os quatro PDFs oficiais disponíveis localmente, executar `scripts/auditar-caderno-2024-pdf.py` com os caminhos das duas provas e depois dos dois gabaritos. Os PDFs não são versionados. Em seguida, na pasta `enemverse-backend`:

```bash
node scripts/validar-caderno-2024.js dados/enem-2024-azul.json dados/gabarito-2024-azul.json
```

O validador verifica IDs exclusivos 2024001–2024180, dias, cadernos, áreas, origem, cinco alternativas, respostas, arquivos de imagem e aprovação visual.

## Próxima etapa: serviço e banco DEV

A rota `POST /api/questoes/admin/importar-enem-2024` exige a chave administrativa no cabeçalho `x-admin-key` **e** `ENEM2024_IMPORT_ENABLED=true` no serviço DEV. Sem essa variável a rota retorna 403. A rota valida novamente os 180 itens contra o manifesto e gabarito antes de qualquer escrita e usa upsert por ID, para permitir repetição sem duplicar questões.

Configure a liberação apenas no Render DEV depois de confirmar que o serviço aponta para o banco DEV. Execute uma importação única, verifique `total2024: 180`, a questão 129 anulada, filtros, textos, figuras e respostas no Preview. A promoção para a `main` e produção é uma etapa posterior, condicionada aos testes em DEV.
